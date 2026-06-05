/**
 * 调用 MiniMax T2A v2 API 合成音频
 */
import type { AudioFormat, Concurrency, SampleRate, TtsModel } from '@/types/settings';

export type TtsPayload = {
  model: TtsModel;
  text: string;
  voice_id: string;
  speed: number;
  vol: number;
  pitch: number;
  format: AudioFormat;
  sampleRate: SampleRate;
  /** 来自 LANG_VOICES[code].langBoost */
  langBoost: string;
};

const API_URL = 'https://api.minimaxi.com/v1/t2a_v2';

const MIME_MAP: Record<AudioFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  flac: 'audio/flac',
};

export async function callTTS(apiKey: string, payload: TtsPayload): Promise<Blob> {
  if (!apiKey) throw new Error('请先设置 API Key');

  const body: Record<string, unknown> = {
    model: payload.model,
    text: payload.text,
    stream: false,
    voice_setting: {
      voice_id: payload.voice_id,
      speed: payload.speed,
      vol: payload.vol,
      pitch: payload.pitch,
    },
    audio_setting: {
      sample_rate: payload.sampleRate,
      bitrate: 128000,
      format: payload.format,
      channel: 1,
    },
    output_format: 'hex',
  };
  if (payload.langBoost) body.language_boost = payload.langBoost;

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const t = await resp.text();
    const err = new Error(`HTTP ${resp.status}: ${t.substring(0, 150)}`) as Error & {
      response?: Response;
      body?: string;
    };
    err.response = resp;
    err.body = t;
    throw err;
  }
  const data: {
    base_resp?: { status_code: number; status_msg: string };
    data?: { audio?: string };
  } = await resp.json();

  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`API ${data.base_resp.status_code}: ${data.base_resp.status_msg}`);
  }
  if (!data.data?.audio) throw new Error('响应无音频数据');

  const hex = data.data.audio;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return new Blob([bytes], { type: MIME_MAP[payload.format] });
}

/** MiniMax 音色 API */
const VOICE_API_URL = 'https://api.minimaxi.com/v1/get_voice';

export type ApiSystemVoice = {
  voice_id: string;
  voice_name: string;
  description: string[];
};

export async function fetchVoiceList(apiKey: string): Promise<ApiSystemVoice[]> {
  if (!apiKey) throw new Error('请先设置 API Key');
  const resp = await fetch(VOICE_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_type: 'system' }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${t.substring(0, 80)}`);
  }
  const data: { system_voice?: ApiSystemVoice[]; base_resp?: { status_code: number; status_msg: string } } =
    await resp.json();
  if (data.base_resp && data.base_resp.status_code !== 0) {
    const err = new Error(data.base_resp.status_msg) as Error & {
      response?: Response;
      body?: string;
    };
    err.response = resp;
    err.body = JSON.stringify(data);
    throw err;
  }
  return data.system_voice ?? [];
}

/** 并发控制（与原 HTML 行为一致） */
export async function runWithConcurrency<T>(
  total: number,
  concurrency: Concurrency,
  worker: (idx: number) => Promise<T>,
  shouldAbort: () => boolean,
): Promise<void> {
  let next = 0;
  async function w(): Promise<void> {
    while (next < total && !shouldAbort()) {
      const i = next++;
      await worker(i);
    }
  }
  const workers = Array.from({ length: concurrency }, () => w());
  await Promise.all(workers);
}
