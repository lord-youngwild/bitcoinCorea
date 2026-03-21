/**
 * 경량 i18n 유틸리티.
 * 현재 한국어(ko)만 지원. 추후 다국어 확장 가능.
 */

import ko from './ko.json';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const translations: Record<string, typeof ko> = { ko };

let currentLang = 'ko';

export function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLang = lang;
  }
}

export function getLanguage(): string {
  return currentLang;
}

/**
 * 번역 문자열 조회. 점(.) 구분자로 중첩 키 접근 가능.
 * 예: t('collective.register.title')
 */
export function t(key: string): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = translations[currentLang] ?? translations['ko'];
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return key;
    current = current[k];
  }
  if (typeof current === 'string') return current;
  return key;
}

/**
 * 배열 번역 조회. 점 구분자로 접근.
 */
export function tArray(key: string): string[] {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = translations[currentLang] ?? translations['ko'];
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return [];
    current = current[k];
  }
  if (Array.isArray(current)) return current as string[];
  return [];
}

export default { t, tArray, setLanguage, getLanguage };
