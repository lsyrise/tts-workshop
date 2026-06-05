import { Sliders } from 'lucide-react';
import { GroupCard } from '@/components/GroupCard/GroupCard';
import { RangeSlider } from '@/components/RangeSlider/RangeSlider';
import { SelectField } from '@/components/SelectField/SelectField';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { AudioFormat, SampleRate } from '@/types/settings';
import styles from './ParamsSection.module.css';

const FORMAT_OPTIONS = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'flac', label: 'FLAC' },
];

const SAMPLE_RATE_OPTIONS: { value: string; label: string }[] = [
  { value: '8000', label: '8000 Hz' },
  { value: '16000', label: '16000 Hz' },
  { value: '22050', label: '22050 Hz' },
  { value: '24000', label: '24000 Hz' },
  { value: '32000', label: '32000 Hz' },
  { value: '44100', label: '44100 Hz' },
];

export function ParamsSection() {
  const speed = useSettingsStore((s) => s.speed);
  const vol = useSettingsStore((s) => s.vol);
  const pitch = useSettingsStore((s) => s.pitch);
  const concurrency = useSettingsStore((s) => s.concurrency);
  const audioFormat = useSettingsStore((s) => s.audioFormat);
  const sampleRate = useSettingsStore((s) => s.sampleRate);

  const setSpeed = useSettingsStore((s) => s.setSpeed);
  const setVol = useSettingsStore((s) => s.setVol);
  const setPitch = useSettingsStore((s) => s.setPitch);
  const setConcurrency = useSettingsStore((s) => s.setConcurrency);
  const setAudioFormat = useSettingsStore((s) => s.setAudioFormat);
  const setSampleRate = useSettingsStore((s) => s.setSampleRate);

  return (
    <GroupCard
      color="orange"
      icon={<Sliders size={18} strokeWidth={2} />}
      title="参数"
      description="语速、音量、音调、并发等"
    >
      <RangeSlider
        label="语速"
        min={0.5}
        max={2.0}
        step={0.05}
        value={speed}
        onChange={setSpeed}
      />
      <RangeSlider
        label="音量"
        min={0}
        max={10}
        step={0.1}
        value={vol}
        onChange={setVol}
      />
      <RangeSlider
        label="音调"
        min={-12}
        max={12}
        step={1}
        value={pitch}
        onChange={setPitch}
      />
      <RangeSlider
        label="并发数"
        min={1}
        max={20}
        step={1}
        value={concurrency}
        onChange={setConcurrency}
      />
      <div className={styles.row}>
        <SelectField
          id="audio-format"
          label="格式"
          value={audioFormat}
          onChange={(e) => setAudioFormat(e.target.value as AudioFormat)}
          options={FORMAT_OPTIONS}
        />
        <SelectField
          id="sample-rate"
          label="采样率"
          value={String(sampleRate)}
          onChange={(e) => setSampleRate(Number(e.target.value) as SampleRate)}
          options={SAMPLE_RATE_OPTIONS}
        />
      </div>
    </GroupCard>
  );
}
