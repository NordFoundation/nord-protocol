import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'
import { ConnectWallet } from './ConnectWallet'

const navItems = [
  { path: '/', icon: 'fa-home', labelKey: 'nav.home' },
  { path: '/swap', icon: 'fa-arrow-right-arrow-left', labelKey: 'nav.swap' },
  { path: '/pool', icon: 'fa-water', labelKey: 'nav.pool' },
  { path: '/liquidity', icon: 'fa-plus', labelKey: 'nav.liquidity' },
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
  const { lang, setLang, sidebarOpen, sidebarCollapsed, toggleSidebar, toggleCollapse, closeSidebar } = useStore()

  const path = location.pathname
  const accent = accentMap[path] || '#14B8A6'
  document.documentElement.style.setProperty('--accent-current', accent)

  return (
    <div className={'app-layout' + (sidebarCollapsed ? ' sidebar-collapsed' : '')}>
      <div className={'sidebar-overlay' + (sidebarOpen ? ' show' : '')} onClick={closeSidebar}></div>
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="logo" onClick={() => navigate('/')}>
              <div className="logo-icon">N</div>
              {!sidebarCollapsed && <span className="gradient-text">Nord</span>}
            </div>
            <button className="collapse-btn" onClick={toggleCollapse} title="Toggle sidebar">
              <i className={'fas fa-chevron-left' + (sidebarCollapsed ? ' collapsed' : '')}></i>
            </button>
          </div>
          <nav className="nav-menu">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={'nav-item' + (path === item.path ? ' active' : '')}
                onClick={() => { navigate(item.path); closeSidebar() }}
                style={path === item.path ? { '--accent-current': accent } as any : undefined}
                title={sidebarCollapsed ? t(lang, item.labelKey) : undefined}
              >
                <i className={'fas ' + item.icon}></i>
                {!sidebarCollapsed && <span>{t(lang, item.labelKey)}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            {!sidebarCollapsed && (
              <div className="lang-selector">
                {(['en', 'ru'] as const).map((l) => (
                  <button key={l} className={'lang-btn' + (lang === l ? ' active' : '')} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                ))}
              </div>
            )}
            <ConnectWallet />
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}><i className="fas fa-bars"></i></button>
            <button className="desktop-menu-btn" onClick={toggleCollapse}><i className="fas fa-bars"></i></button>
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
