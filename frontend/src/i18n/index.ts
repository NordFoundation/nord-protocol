import { en } from './en'
import { ru } from './ru'

export type Lang = 'en' | 'ru'
export type TranslationDict = typeof en

const dicts: Record<Lang, TranslationDict> = { en, ru }

export function t(lang: Lang, path: string): string {
  const keys = path.split('.')
  let obj: any = dicts[lang]
  for (const k of keys) {
    if (obj?.[k] === undefined) return path
    obj = obj[k]
  }
  return String(obj)
}