import { useState } from 'react'
import { useStore } from '../store'
import { t } from '../i18n'
import { TokenSelect } from '../components/TokenSelect'
import { useContract } from '../hooks/useContract'
import { ROUTER_ADDRESS } from '../config/contracts'
import { toWei } from '../utils/format'
import type { TokenInfo } from '../config/tokens'

export function Liquidity() {
  const { lang, connected, account } = useStore()
  const { addLiquidity, createPair } = useContract()

  const [tokenA, setTokenA] = useState<TokenInfo | null>(null)
  const [tokenB, setTokenB] = useState<TokenInfo | null>(null)
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [showTokens, setShowTokens] = useState<'A' | 'B' | null>(null)
  const [loading, setLoading] = useState(false)

  const tokenAAddr = tokenA?.address as `0x${string}` | undefined
  const tokenBAddr = tokenB?.address as `0x${string}` | undefined

  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !account || !amountA || !amountB) return
    setLoading(true)
    try {
      const amtA = toWei(amountA, tokenA.decimals)
      const amtB = toWei(amountB, tokenB.decimals)
      const minA = amtA * 995n / 1000n
      const minB = amtB * 995n / 1000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      await addLiquidity(tokenAAddr!, tokenBAddr!, amtA, amtB, minA, minB, account as `0x${string}`, deadline, account as `0x${string}`)
      setAmountA('')
      setAmountB('')
    } catch (e: any) {
      alert(e.message || 'Failed to add liquidity')
    }
    setLoading(false)
  }

  const handleCreatePair = async () => {
    if (!tokenA || !tokenB || !account) return
    setLoading(true)
    try {
      await createPair(tokenAAddr!, tokenBAddr!, account as `0x${string}`)
      alert('Pair created! You can now add liquidity.')
    } catch (e: any) {
      alert(e.message || 'Failed to create pair')
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="liquidity-card">
        <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>{tokenA && tokenB ? t(lang, 'liquidity.add') : t(lang, 'liquidity.createNew')}</h3>

        <div className="form-input" style={{ marginBottom: '12px' }}>
          <button className="token-btn" onClick={() => setShowTokens('A')}>
            {tokenA ? <>{tokenA.logo} {tokenA.symbol}</> : t(lang, 'swap.selectToken')}
          </button>
          <input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)} />
        </div>

        <div style={{ textAlign: 'center', margin: '8px 0', color: 'var(--text-secondary)' }}><i className="fas fa-plus"></i></div>

        <div className="form-input" style={{ marginBottom: '20px' }}>
          <button className="token-btn" onClick={() => setShowTokens('B')}>
            {tokenB ? <>{tokenB.logo} {tokenB.symbol}</> : t(lang, 'swap.selectToken')}
          </button>
          <input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)} />
        </div>

        {tokenA && tokenB && amountA && amountB && (
          <div style={{ marginBottom: '16px' }}>
            <div className="info-row">
              <span>{t(lang, 'liquidity.price')}</span>
              <span>1 {tokenA.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB.symbol}</span>
            </div>
            <div className="info-row">
              <span>{t(lang, 'liquidity.price')}</span>
              <span>1 {tokenB.symbol} = {(parseFloat(amountA) / parseFloat(amountB)).toFixed(6)} {tokenA.symbol}</span>
            </div>
          </div>
        )}

        {!connected ? (
          <button className="btn-primary">{t(lang, 'common.connect')}</button>
        ) : !tokenA || !tokenB ? (
          <button className="btn-primary" disabled>{t(lang, 'swap.selectToken')}</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn-primary" onClick={handleAddLiquidity} disabled={loading || !amountA || !amountB}>
              {loading ? '...' : t(lang, 'liquidity.add')}
            </button>
            <button className="btn-secondary" onClick={handleCreatePair} disabled={loading}>
              <i className="fas fa-plus"></i> {t(lang, 'liquidity.create')}
            </button>
          </div>
        )}
      </div>

      {showTokens && (
        <TokenSelect
          onSelect={(token) => {
            if (showTokens === 'A') { setTokenA(token); if (tokenB?.address === token.address) setTokenB(null) }
            else { setTokenB(token); if (tokenA?.address === token.address) setTokenA(null) }
            setShowTokens(null)
          }}
          onClose={() => setShowTokens(null)}
        />
      )}
    </div>
  )
}