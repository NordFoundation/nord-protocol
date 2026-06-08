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

  return (
    <div className="page">
      <div className="hero">
        <h1>{t(lang, 'home.title')}</h1>
        <p>{t(lang, 'home.subtitle')}</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate('/swap')}>
            <i className="fas fa-rocket"></i> {t(lang, 'home.launch')}
          </button>
          <button className="btn-secondary" onClick={() => window.open('#', '_blank')}>
            <i className="fas fa-book"></i> {t(lang, 'home.learn')}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">{t(lang, 'home.tvl')}</div><div className="stat-value">$156K</div><div className="stat-change up">↑ 12.3%</div></div>
        <div className="stat-card"><div className="stat-label">{t(lang, 'home.volume')}</div><div className="stat-value">$8.2K</div><div className="stat-change up">↑ 5.1%</div></div>
        <div className="stat-card"><div className="stat-label">{t(lang, 'home.pairs')}</div><div className="stat-value">4</div></div>
        <div className="stat-card"><div className="stat-label">{t(lang, 'home.nordPrice')}</div><div className="stat-value">$0.42</div><div className="stat-change down">↓ 2.1%</div></div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>📊 {t(lang, 'home.chart')}</h3>
        <div className="chart-container"><canvas ref={chartRef}></canvas></div>
      </div>

      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
          <h3 style={{ marginBottom: '8px' }}>{t(lang, 'home.s1_title')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6 }}>{t(lang, 'home.s1_desc')}</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏛️</div>
          <h3 style={{ marginBottom: '8px' }}>{t(lang, 'home.s2_title')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6 }}>{t(lang, 'home.s2_desc')}</p>
        </div>
        <div className="card">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💎</div>
          <h3 style={{ marginBottom: '8px' }}>{t(lang, 'home.s3_title')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', lineHeight: 1.6 }}>{t(lang, 'home.s3_desc')}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button className="btn-primary" style={{ width: 'auto', padding: '14px 40px' }} onClick={() => navigate('/swap')}>
          <i className="fas fa-arrow-right"></i> {t(lang, 'home.cta')}
        </button>
      </div>

      <footer>
        <p>© 2026 {t(lang, 'home.footer')}</p>
        <p style={{ fontSize: '.75rem', marginTop: '8px', color: 'var(--text-secondary)' }}>NORD max supply: 5,000,000</p>
      </footer>
    </div>
  )
}