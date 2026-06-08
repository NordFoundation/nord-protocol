import { useState } from 'react'
import { useStore } from '../store'
import { t } from '../i18n'
import { TokenSelect } from '../components/TokenSelect'
import { useContract } from '../hooks/useContract'
import { toWei } from '../utils/format'
import type { TokenInfo } from '../config/tokens'

export function Liquidity() {
  const { lang, connected, account, demoMode } = useStore()
  const { addLiquidity, createPair } = useContract()

  const [tokenA, setTokenA] = useState<TokenInfo | null>(null)
  const [tokenB, setTokenB] = useState<TokenInfo | null>(null)
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [showTokens, setShowTokens] = useState<'A' | 'B' | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'add' | 'create'>('add')
  const [done, setDone] = useState('')

  const tokenAAddr = tokenA?.address as `0x${string}` | undefined
  const tokenBAddr = tokenB?.address as `0x${string}` | undefined

  const handleAddLiquidity = async () => {
    if (!tokenA || !tokenB || !account || !amountA || !amountB) return
    setLoading(true); setDone('')
    try {
      const amtA = toWei(amountA, tokenA.decimals)
      const amtB = toWei(amountB, tokenB.decimals)
      const minA = amtA * 995n / 1000n
      const minB = amtB * 995n / 1000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      await addLiquidity(tokenAAddr!, tokenBAddr!, amtA, amtB, minA, minB, account as `0x${string}`, deadline, account as `0x${string}`)
      setAmountA(''); setAmountB('')
      setDone('✅ ' + t(lang, 'liquidity.add') + (demoMode ? ' (Demo)' : ''))
    } catch (e: any) { setDone('❌ ' + (e.message || 'Failed')) }
    setLoading(false)
  }

  const handleCreatePair = async () => {
    if (!tokenA || !tokenB || !account) return
    setLoading(true); setDone('')
    try {
      await createPair(tokenAAddr!, tokenBAddr!, account as `0x${string}`)
      setDone('✅ ' + t(lang, 'liquidity.create') + (demoMode ? ' (Demo)' : ''))
      setMode('add')
    } catch (e: any) { setDone('❌ ' + (e.message || 'Failed')) }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="liquidity-card">
        <div className="liquidity-tabs">
          <button
            className={'liquidity-tab' + (mode === 'add' ? ' active' : '')}
            onClick={() => { setMode('add'); setDone('') }}
          >
            <i className="fas fa-plus-circle"></i> {t(lang, 'liquidity.add')}
          </button>
          <button
            className={'liquidity-tab' + (mode === 'create' ? ' active' : '')}
            onClick={() => { setMode('create'); setDone('') }}
          >
            <i className="fas fa-layer-group"></i> {t(lang, 'liquidity.create')}
          </button>
        </div>

        <p style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          {mode === 'add' ? t(lang, 'liquidity.addDesc') : t(lang, 'liquidity.createDesc')}
        </p>

        <div className="liq-input-wrap">
          <div className="swap-input-label">
            <span>{t(lang, 'liquidity.token1')}</span>
            {connected && tokenA && <span className="swap-balance">{t(lang, 'liquidity.balance')}: 10,000</span>}
          </div>
          <div className="swap-input-row">
            <input
              type="number" placeholder="0.0" value={amountA}
              onChange={(e) => { setAmountA(e.target.value); setDone('') }}
            />
            <button className="token-btn" onClick={() => { setShowTokens('A'); setDone('') }}>
              {tokenA ? <><span className="token-icon">{tokenA.logo}</span> {tokenA.symbol} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></> : <>{t(lang, 'liquidity.token1')} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></>}
            </button>
          </div>
        </div>

        <div className="swap-arrow-wrap" style={{ margin: '4px 0' }}>
          <div className="swap-arrow-btn" style={{ cursor: 'default', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
            <i className="fas fa-plus"></i>
          </div>
        </div>

        <div className="liq-input-wrap">
          <div className="swap-input-label">
            <span>{t(lang, 'liquidity.token2')}</span>
            {connected && tokenB && <span className="swap-balance">{t(lang, 'liquidity.balance')}: 5,000</span>}
          </div>
          <div className="swap-input-row">
            <input
              type="number" placeholder="0.0" value={amountB}
              onChange={(e) => { setAmountB(e.target.value); setDone('') }}
            />
            <button className="token-btn" onClick={() => { setShowTokens('B'); setDone('') }}>
              {tokenB ? <><span className="token-icon">{tokenB.logo}</span> {tokenB.symbol} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></> : <>{t(lang, 'liquidity.token2')} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></>}
            </button>
          </div>
        </div>

        {tokenA && tokenB && amountA && amountB && (
          <div className="swap-info">
            <div className="swap-info-row">
              <span>1 {tokenA.symbol} = {(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} {tokenB.symbol}</span>
              <span>1 {tokenB.symbol} = {(parseFloat(amountA) / parseFloat(amountB)).toFixed(6)} {tokenA.symbol}</span>
            </div>
            <div className="swap-info-row">
              <span>{t(lang, 'liquidity.shareOfPool')}</span>
              <span>~{(Math.random() * 100).toFixed(2)}%</span>
            </div>
            <div className="swap-info-row">
              <span>{t(lang, 'liquidity.lpTokens')}</span>
              <span>~{(parseFloat(amountA || '0') + parseFloat(amountB || '0')) * 100} NORD-LP</span>
            </div>
          </div>
        )}

        {done && (
          <div className={'swap-done' + (done.startsWith('✅') ? ' success' : ' error')}>{done}</div>
        )}

        {!connected ? (
          <button className="btn-primary swap-submit">{t(lang, 'common.connect')}</button>
        ) : !tokenA || !tokenB || (mode === 'add' && (!amountA || !amountB)) ? (
          <button className="btn-primary swap-submit" disabled>
            {mode === 'add' ? t(lang, 'liquidity.enterAmounts') : t(lang, 'liquidity.selectTokens')}
          </button>
        ) : mode === 'create' ? (
          <button className="btn-primary swap-submit" onClick={handleCreatePair} disabled={loading}>
            {loading ? <span className="btn-loading"><i className="fas fa-spinner fa-spin"></i> {t(lang, 'liquidity.creating')}</span> : t(lang, 'liquidity.createAndAdd')}
          </button>
        ) : (
          <button className="btn-primary swap-submit" onClick={handleAddLiquidity} disabled={loading}>
            {loading ? <span className="btn-loading"><i className="fas fa-spinner fa-spin"></i> {t(lang, 'liquidity.adding')}</span> : t(lang, 'liquidity.add')}
          </button>
        )}
      </div>

      {showTokens && (
        <TokenSelect
          onSelect={(token) => {
            if (showTokens === 'A') { setTokenA(token); if (tokenB?.address === token.address) setTokenB(null) }
            else { setTokenB(token); if (tokenA?.address === token.address) setTokenA(null) }
            setShowTokens(null); setDone('')
          }}
          onClose={() => setShowTokens(null)}
        />
      )}
    </div>
  )
}
