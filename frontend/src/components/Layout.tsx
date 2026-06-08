import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'
import { ConnectWallet } from './ConnectWallet'

const navItems = [
  { path: '/', icon: 'fa-home', labelKey: 'nav.home' },
  { path: '/swap', icon: 'fa-exchange-alt', labelKey: 'nav.swap' },
  { path: '/pool', icon: 'fa-water', labelKey: 'nav.pool' },
  { path: '/liquidity', icon: 'fa-plus-circle', labelKey: 'nav.liquidity' },
]

const accentMap: Record<string, string> = {
  '/': '#A855F7',
  '/swap': '#14B8A6',
  '/pool': '#F59E0B',
  '/liquidity': '#3B82F6',
}

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLang, sidebarOpen, toggleSidebar, closeSidebar } = useStore()

  const path = location.pathname
  const accent = accentMap[path] || '#14B8A6'
  document.documentElement.style.setProperty('--accent-current', accent)

  return (
    <div className="app-layout">
      <div className={"sidebar-overlay" + (sidebarOpen ? ' show' : '')} onClick={closeSidebar}></div>
      <aside className={"sidebar" + (sidebarOpen ? ' open' : '')}>
        <div className="logo">
          <div className="logo-icon">N</div>
          <span className="gradient-text">Nord</span>
        </div>
        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={"nav-item" + (path === item.path ? ' active' : '')}
              onClick={() => { navigate(item.path); closeSidebar() }}
              style={path === item.path ? { '--accent-current': accent } as any : undefined}
            >
              <i className={"fas " + item.icon}></i>
              {t(lang, item.labelKey)}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div className="lang-selector" style={{ marginBottom: '12px' }}>
            {(['en', 'ru'] as const).map((l) => (
              <button key={l} className={"lang-btn" + (lang === l ? ' active' : '')} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <ConnectWallet />
        </div>
      </aside>
      <main className="main-area">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-btn" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
            <span className="page-title">{t(lang, navItems.find(i => i.path === path)?.labelKey || 'nav.home')}</span>
          </div>
          <div className="top-bar-right">
            <ConnectWallet />
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}