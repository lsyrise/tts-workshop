/**
 * MiniMax 音色元数据解析
 * 1:1 移植自原 HTML
 */
import type { VoiceMeta } from '@/types/voice';
import { BUILTIN_LANG_VOICES } from '@/lib/voices-db';

export function getAvailableLanguages(): string[] {
  return Object.keys(BUILTIN_LANG_VOICES);
}

export function parseVoiceMeta(descArr: string[] | undefined): VoiceMeta {
  const desc = (descArr ?? []).join(' ');
  const meta: VoiceMeta = {
    gender: '',
    age: '',
    accent: '',
    fullDesc: descArr ? descArr.join('；') : '',
  };

  if (/男|male|man|boy|gentleman|lord|master|king|guy|dude|sir|father|brother/i.test(desc)) {
    meta.gender = 'male';
  } else if (
    /女|female|woman|lady|girl|sister|maiden|queen|princess|mother|aunt|miss/i.test(desc)
  ) {
    meta.gender = 'female';
  }

  if (/儿童|孩子|童|婴儿|幼儿|kid|child|baby/i.test(desc) && !/青年|中年|老年/i.test(desc)) {
    meta.age = 'child';
  } else if (/青年|少年|少女|学弟|学妹|大学生|青春|young|youth|teen|student/i.test(desc)) {
    meta.age = 'young';
  } else if (
    /中年|成熟|沉稳|稳重|温润|阅历|mature|middle.?aged|adult|executive/i.test(desc)
  ) {
    meta.age = 'middle';
  } else if (/老年|老人|大爷|大妈|爷爷|奶奶|花甲|elder|grandpa|grandma|old/i.test(desc)) {
    meta.age = 'elder';
  }

  if (/港普|香港|粤语|Cantonese/i.test(desc)) meta.accent = '粤语';
  else if (/美音|美式|美语|American/i.test(desc)) meta.accent = '美音';
  else if (/英音|英式|British|UK/i.test(desc)) meta.accent = '英音';
  else if (/澳音|澳洲|Australian|Aussie/i.test(desc)) meta.accent = '澳音';
  else if (/普通话|mandarin/i.test(desc)) meta.accent = '普通话';
  else if (/南方/i.test(desc)) meta.accent = '南方口音';

  return meta;
}
