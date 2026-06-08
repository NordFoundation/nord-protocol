import { create } from 'zustand'
import type { TokenInfo } from '../config/tokens'
import { DEFAULT_TOKENS } from '../config/tokens'
import type { Lang } from '../i18n'

interface AppState {
  lang: Lang
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  customTokens: TokenInfo[]
  connected: boolean
  account: string | null
  demoMode: boolean
  setLang: (l: Lang) => void
  toggleSidebar: () => void
  toggleCollapse: () => void
  closeSidebar: () => void
  addCustomToken: (t: TokenInfo) => void
  setConnected: (a: string | null) => void
  enterDemo: () => void
  exitDemo: () => void
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

const DEMO_ADDR = '0x1234...Demo'

export const useStore = create<AppState>((set, get) => ({
  lang: (localStorage.getItem('nord_lang') as Lang) || 'en',
  sidebarOpen: false,
  sidebarCollapsed: JSON.parse(localStorage.getItem('nord_sidebar_collapsed') || 'false'),
  customTokens: loadTokens(),
  connected: false,
  account: null,
  demoMode: false,

  setLang: (l) => {
    localStorage.setItem('nord_lang', l)
    set({ lang: l })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollapse: () => set((s) => {
    const next = !s.sidebarCollapsed
    localStorage.setItem('nord_sidebar_collapsed', JSON.stringify(next))
    return { sidebarCollapsed: next }
  }),
  closeSidebar: () => set({ sidebarOpen: false }),
  addCustomToken: (t) => {
    const tokens = get().customTokens
    if (!tokens.find((x) => x.address.toLowerCase() === t.address.toLowerCase())) {
      const updated = [...tokens, t]
      saveTokens(updated)
      set({ customTokens: updated })
    }
  },
  setConnected: (account) => set({ connected: !!account, account, demoMode: false }),
  enterDemo: () => set({ connected: true, account: DEMO_ADDR, demoMode: true }),
  exitDemo: () => set({ connected: false, account: null, demoMode: false }),
  getAllTokens: () => [...DEFAULT_TOKENS, ...get().customTokens],
}))
