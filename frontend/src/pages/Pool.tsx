import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'

interface PoolRow {
  pair: string
  tvl: string
  volume24h: string
  apr: string
}

const MOCK_POOLS: PoolRow[] = [
  { pair: 'WFUSE / USDC', tvl: '$85,420', volume24h: '$12,340', apr: '14.2%' },
  { pair: 'WFUSE / BUSD', tvl: '$42,100', volume24h: '$5,670', apr: '11.8%' },
  { pair: 'USDC / BUSD', tvl: '$22,800', volume24h: '$3,210', apr: '8.5%' },
  { pair: 'NORD / WFUSE', tvl: '$5,680', volume24h: '$890', apr: '—' },
]

export function Pool() {
  const navigate = useNavigate()
  const { lang } = useStore()
  const [pools] = useState<PoolRow[]>(MOCK_POOLS)

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title" style={{ margin: 0 }}>{t(lang, 'pool.allPools')}</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/liquidity')}>
          <i className="fas fa-plus"></i> {t(lang, 'pool.addLiquidity')}
        </button>
      </div>

      {pools.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t(lang, 'pool.pair')}</th>
                <th>{t(lang, 'pool.tvl')}</th>
                <th>{t(lang, 'pool.volume24h')}</th>
                <th>{t(lang, 'pool.apr')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pools.map((p) => (
                <tr key={p.pair}>
                  <td style={{ fontWeight: 600 }}>{p.pair}</td>
                  <td>{p.tvl}</td>
                  <td>{p.volume24h}</td>
                  <td style={{ color: p.apr !== '—' ? 'var(--success)' : 'var(--text-secondary)' }}>{p.apr}</td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '.8rem' }} onClick={() => navigate('/liquidity')}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💧</div>
          <p style={{ color: 'var(--text-secondary)' }}>{t(lang, 'pool.noPools')}</p>
          <button className="btn-primary" style={{ width: 'auto', marginTop: '20px', display: 'inline-block' }} onClick={() => navigate('/liquidity')}>
            {t(lang, 'pool.createPair')}
          </button>
        </div>
      )}
    </div>
  )
}