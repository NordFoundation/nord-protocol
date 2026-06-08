import { create } from 'zustand'
import type { TokenInfo } from '../config/tokens'
import { DEFAULT_TOKENS } from '../config/tokens'
import type { Lang } from '../i18n'

interface AppState {
  lang: Lang
  sidebarOpen: boolean
  customTokens: TokenInfo[]
  connected: boolean
  account: string | null
  setLang: (l: Lang) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  addCustomToken: (t: TokenInfo) => void
  setConnected: (a: string | null) => void
  getAllTokens: () => TokenInfo[]
}

const STORAGE_KEY = 'nord_custom_tokens'

function loadTokens(): TokenInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTokens(tokens: TokenInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export const useStore = create<AppState>((set, get) => ({
  lang: (localStorage.getItem('nord_lang') as Lang) || 'en',
  sidebarOpen: false,
  customTokens: loadTokens(),
  connected: false,
  account: null,

  setLang: (l) => {
    localStorage.setItem('nord_lang', l)
    set({ lang: l })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  addCustomToken: (t) => {
    const tokens = get().customTokens
    if (!tokens.find((x) => x.address.toLowerCase() === t.address.toLowerCase())) {
      const updated = [...tokens, t]
      saveTokens(updated)
      set({ customTokens: updated })
    }
  },
  setConnected: (account) => set({ connected: !!account, account }),
  getAllTokens: () => [...DEFAULT_TOKENS, ...get().customTokens],
}))