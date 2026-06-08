import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'

interface PoolRow {
  pair: string
  iconA: string
  iconB: string
  tvl: string
  volume24h: string
  apr: string
  fee: string
}

const MOCK_POOLS: PoolRow[] = [
  { pair: 'WFUSE / USDC', iconA: '🔥', iconB: '💲', tvl: '$85,420', volume24h: '$12,340', apr: '14.2%', fee: '0.30%' },
  { pair: 'WFUSE / BUSD', iconA: '🔥', iconB: '💲', tvl: '$42,100', volume24h: '$5,670', apr: '11.8%', fee: '0.30%' },
  { pair: 'USDC / BUSD', iconA: '💲', iconB: '💲', tvl: '$22,800', volume24h: '$3,210', apr: '8.5%', fee: '0.05%' },
  { pair: 'NORD / WFUSE', iconA: '💎', iconB: '🔥', tvl: '$5,680', volume24h: '$890', apr: '—', fee: '0.30%' },
  { pair: 'NORD / USDC', iconA: '💎', iconB: '💲', tvl: '$3,200', volume24h: '$450', apr: '—', fee: '0.30%' },
  { pair: 'cUSD / USDC', iconA: '💲', iconB: '💲', tvl: '$98,000', volume24h: '$22,100', apr: '6.2%', fee: '0.05%' },
]

export function Pool() {
  const navigate = useNavigate()
  const { lang } = useStore()
  const [search, setSearch] = useState('')

  const filtered = MOCK_POOLS.filter(p =>
    p.pair.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="pool-header">
        <div>
          <h2 className="pool-title">{t(lang, 'pool.title')}</h2>
          <p className="pool-subtitle">{t(lang, 'pool.subtitle')}</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px', fontSize: '.9rem' }} onClick={() => navigate('/liquidity')}>
          <i className="fas fa-plus"></i> {t(lang, 'pool.newPosition')}
        </button>
      </div>

      <div className="pool-search-bar">
        <i className="fas fa-search" style={{ color: 'var(--text-secondary)' }}></i>
        <input
          placeholder={t(lang, 'pool.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pool-grid">
        {filtered.length > 0 ? filtered.map((p) => (
          <div key={p.pair} className="pool-card" onClick={() => navigate('/liquidity')}>
            <div className="pool-card-top">
              <div className="pool-card-icons">
                <span className="pool-icon">{p.iconA}</span>
                <span className="pool-icon">{p.iconB}</span>
              </div>
              <span className="pool-card-fee">{t(lang, 'pool.fee')} {p.fee}</span>
            </div>
            <div className="pool-card-pair">{p.pair}</div>
            <div className="pool-card-stats">
              <div className="pool-card-stat">
                <span className="pool-card-stat-label">{t(lang, 'pool.tvl')}</span>
                <span className="pool-card-stat-value">{p.tvl}</span>
              </div>
              <div className="pool-card-stat">
                <span className="pool-card-stat-label">{t(lang, 'pool.volume24h')}</span>
                <span className="pool-card-stat-value">{p.volume24h}</span>
              </div>
              <div className="pool-card-stat">
                <span className="pool-card-stat-label">{t(lang, 'pool.apr')}</span>
                <span className="pool-card-stat-value" style={{ color: p.apr !== '—' ? 'var(--success)' : 'var(--text-secondary)' }}>{p.apr}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="pool-empty">
            <div className="pool-empty-icon">🔍</div>
            <p>{t(lang, 'pool.noPools')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
