import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export function Home() {
  const navigate = useNavigate()
  const { lang } = useStore()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    const gradient = ctx.createLinearGradient(0, 0, 0, 280)
    gradient.addColorStop(0, 'rgba(20,184,166,0.2)')
    gradient.addColorStop(1, 'rgba(20,184,166,0)')
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'TVL $',
          data: [45000, 52000, 68000, 89000, 124000, 156000],
          borderColor: '#14B8A6',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', callback: (v) => '$' + (Number(v) / 1000).toFixed(0) + 'k' } },
          x: { grid: { display: false }, ticks: { color: '#94A3B8' } }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    })
    return () => { if (chartInstance.current) chartInstance.current.destroy() }
  }, [])

  const products = [
    { icon: '🔄', key: 'prod1', accent: '#14B8A6', nav: '/swap' },
    { icon: '💧', key: 'prod2', accent: '#F59E0B', nav: '/pool' },
    { icon: '💎', key: 'prod3', accent: '#A855F7', nav: '/swap' },
    { icon: '🏛️', key: 'prod4', accent: '#3B82F6', nav: '/swap' },
  ]

  const steps = [
    { key: 'step1' },
    { key: 'step2' },
    { key: 'step3' },
  ]

  return (
    <div className="page home-page">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-bg">
          <div className="home-grid"></div>
        </div>
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6EE7B7', display: 'inline-block' }}></span>
            {t(lang, 'home.badge')}
          </div>
          <h1>{t(lang, 'home.title')}</h1>
          <p>{t(lang, 'home.subtitle')}</p>
          <div className="home-hero-btns">
            <button className="btn-primary" onClick={() => navigate('/swap')}>
              <i className="fas fa-rocket"></i> {t(lang, 'home.launch')}
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-book"></i> {t(lang, 'home.learn')}
            </button>
          </div>
          <div className="home-hero-stats">
            <div className="home-hero-stat">
              <div className="home-hero-stat-value">$156K</div>
              <div className="home-hero-stat-label">{t(lang, 'home.heroStat1')}</div>
            </div>
            <div className="home-hero-stat">
              <div className="home-hero-stat-value">$8.2K</div>
              <div className="home-hero-stat-label">{t(lang, 'home.heroStat2')}</div>
            </div>
            <div className="home-hero-stat">
              <div className="home-hero-stat-value">4</div>
              <div className="home-hero-stat-label">{t(lang, 'home.heroStat3')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem / Products */}
      <div className="home-section" id="ecosystem">
        <div className="home-section-label">{t(lang, 'home.sectionLabel')}</div>
        <h2 className="home-section-title">{t(lang, 'home.sectionTitle')}</h2>
        <p className="home-section-desc">{t(lang, 'home.sectionDesc')}</p>
        <div className="home-products" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {products.map((p) => (
            <div key={p.key} className="home-product-card" onClick={() => navigate(p.nav)}
              onMouseEnter={(e) => e.currentTarget.style.setProperty('--accent-current', p.accent)}>
              <div className="home-product-icon">{p.icon}</div>
              <div className="home-product-title">{t(lang, 'home.' + p.key + '_title')}</div>
              <div className="home-product-desc">{t(lang, 'home.' + p.key + '_desc')}</div>
              <div className="home-product-link">
                {t(lang, 'home.launch')} <i className="fas fa-arrow-right" style={{ fontSize: '.75rem' }}></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="home-section">
        <div className="home-section-label">How it works</div>
        <h2 className="home-section-title">Three Simple Steps</h2>
        <p className="home-section-desc">Get started with Nord Protocol in minutes</p>
        <div className="home-steps" style={{ maxWidth: 900, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={s.key} className="home-step">
              <div className="home-step-num">{i + 1}</div>
              <h3>{t(lang, 'home.' + s.key + '_title')}</h3>
              <p>{t(lang, 'home.' + s.key + '_desc')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TVL Chart */}
      <div className="home-section">
        <div className="card" style={{ maxWidth: 900, margin: '0 auto', borderColor: 'rgba(20,184,166,.2)' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>📊 {t(lang, 'home.chart')}</h3>
          <div className="chart-container"><canvas ref={chartRef}></canvas></div>
        </div>
      </div>

      {/* CTA */}
      <div className="home-section">
        <div className="home-cta">
          <h2>{t(lang, 'home.ctaTitle')}</h2>
          <p>{t(lang, 'home.ctaDesc')}</p>
          <button className="btn-primary" onClick={() => navigate('/swap')}>
            <i className="fas fa-arrow-right"></i> {t(lang, 'home.cta')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <p>© 2026 {t(lang, 'home.footer')}</p>
        <p style={{ fontSize: '.75rem', marginTop: '8px', color: 'var(--text-secondary)' }}>NORD max supply: 5,000,000</p>
      </footer>
    </div>
  )
}
