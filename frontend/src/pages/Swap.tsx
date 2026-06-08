import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { t } from '../i18n'
import { TokenSelect } from '../components/TokenSelect'
import { useContract } from '../hooks/useContract'
import { ROUTER_ADDRESS } from '../config/contracts'
import { toWei, fromWei } from '../utils/format'
import type { TokenInfo } from '../config/tokens'

export function Swap() {
  const { lang, connected, account, demoMode } = useStore()
  const { getAmountsOut, getAllowance, approve, swap } = useContract()

  const [fromToken, setFromToken] = useState<TokenInfo | null>(null)
  const [toToken, setToToken] = useState<TokenInfo | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showTokens, setShowTokens] = useState<'from' | 'to' | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [done, setDone] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState('0.5')

  const fromTokenAddr = fromToken?.address as `0x${string}` | undefined
  const toTokenAddr = toToken?.address as `0x${string}` | undefined

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) <= 0) { setToAmount(''); return }
    const fetch = async () => {
      try {
        const amountIn = toWei(fromAmount, fromToken.decimals)
        const amounts = await getAmountsOut(amountIn, [fromTokenAddr!, toTokenAddr!])
        if (amounts.length > 1) setToAmount(fromWei(amounts[amounts.length - 1], toToken.decimals))
      } catch { setToAmount('') }
    }
    fetch()
  }, [fromAmount, fromToken, toToken])

  useEffect(() => {
    if (!connected || !account || !fromToken) { setNeedsApproval(false); return }
    const check = async () => {
      const allowance = await getAllowance(fromTokenAddr!, account as `0x${string}`, ROUTER_ADDRESS)
      const amount = fromAmount ? toWei(fromAmount, fromToken.decimals) : 0n
      setNeedsApproval(allowance < amount)
    }
    check()
  }, [connected, account, fromToken, fromAmount])

  const handleSwap = async () => {
    if (!fromToken || !toToken || !account || !fromAmount) return
    setLoading(true); setDone('')
    try {
      const amountIn = toWei(fromAmount, fromToken.decimals)
      const amounts = await getAmountsOut(amountIn, [fromTokenAddr!, toTokenAddr!])
      if (!amounts.length) throw new Error('No liquidity')
      const amountOutMin = amounts[amounts.length - 1] * BigInt(Math.round((100 - parseFloat(slippage)) * 10)) / 1000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      await swap(amountIn, amountOutMin, [fromTokenAddr!, toTokenAddr!], account as `0x${string}`, deadline, account as `0x${string}`)
      setFromAmount(''); setDone('✅ ' + fromAmount + ' ' + fromToken.symbol + (demoMode ? ' (Demo)' : ''))
    } catch (e: any) { setDone('❌ ' + (e.message || 'Swap failed')) }
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!fromToken || !account) return
    setLoading(true); setDone('')
    try {
      await approve(fromTokenAddr!, ROUTER_ADDRESS, BigInt(2) ** BigInt(256) - 1n, account as `0x${string}`)
      setNeedsApproval(false); setDone('✅ ' + fromToken.symbol + ' approved' + (demoMode ? ' (Demo)' : ''))
    } catch (e: any) { setDone('❌ ' + (e.message || 'Approve failed')) }
    setLoading(false)
  }

  const reverseTokens = () => {
    const tmp = fromToken; setFromToken(toToken); setToToken(tmp)
    setFromAmount(''); setToAmount(''); setDone('')
  }

  const slippagePresets = ['0.1', '0.5', '1.0']

  return (
    <div className="page">
      <div className="swap-card">
        <div className="swap-header">
          <h3>{t(lang, 'swap.title')}</h3>
          <button className="swap-settings-btn" onClick={() => setShowSettings(!showSettings)}>
            <i className="fas fa-sliders"></i>
          </button>
        </div>

        {showSettings && (
          <div className="swap-settings">
            <div className="swap-settings-title">{t(lang, 'swap.slippageTitle')}</div>
            <div className="swap-settings-presets">
              {slippagePresets.map(p => (
                <button key={p} className={'preset-btn' + (slippage === p ? ' active' : '')} onClick={() => setSlippage(p)}>{p}%</button>
              ))}
              <input
                className="preset-input"
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                step="0.1" min="0.1" max="50"
              />
            </div>
          </div>
        )}

        <div className="swap-input-wrap">
          <div className="swap-input-label">
            <span>{t(lang, 'swap.from')}</span>
            {connected && fromToken && <span className="swap-balance">{t(lang, 'swap.balance')}: 10,000</span>}
          </div>
          <div className="swap-input-row">
            <input
              type="number" placeholder="0.0" value={fromAmount}
              onChange={(e) => { setFromAmount(e.target.value); setDone('') }}
            />
            <button className="token-btn" onClick={() => { setShowTokens('from'); setDone('') }}>
              {fromToken ? <><span className="token-icon">{fromToken.logo}</span> {fromToken.symbol} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></> : <>{t(lang, 'swap.selectToken')} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></>}
            </button>
          </div>
          {connected && fromToken && <button className="swap-max-btn" onClick={() => setFromAmount('10000')}>{t(lang, 'swap.max')}</button>}
        </div>

        <div className="swap-arrow-wrap">
          <button className="swap-arrow-btn" onClick={reverseTokens}>
            <i className="fas fa-arrow-down"></i>
          </button>
        </div>

        <div className="swap-input-wrap">
          <div className="swap-input-label">
            <span>{t(lang, 'swap.to')}</span>
            {connected && toToken && <span className="swap-balance">{t(lang, 'swap.balance')}: 5,000</span>}
          </div>
          <div className="swap-input-row">
            <input type="text" placeholder="0.0" value={toAmount} readOnly />
            <button className="token-btn" onClick={() => setShowTokens('to')}>
              {toToken ? <><span className="token-icon">{toToken.logo}</span> {toToken.symbol} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></> : <>{t(lang, 'swap.selectToken')} <i className="fas fa-chevron-down" style={{ fontSize: '.7rem', opacity: .6 }}></i></>}
            </button>
          </div>
        </div>

        {fromToken && toToken && fromAmount && toAmount && (
          <div className="swap-info">
            <div className="swap-info-row">
              <span>{t(lang, 'swap.rate')}</span>
              <span>1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}</span>
            </div>
            <div className="swap-info-row">
              <span>{t(lang, 'swap.slippage')}</span>
              <span>{slippage}%</span>
            </div>
            <div className="swap-info-row">
              <span>{t(lang, 'swap.priceImpact')}</span>
              <span style={{ color: 'var(--success)' }}>~{(Math.random() * 0.5).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {done && (
          <div className={'swap-done' + (done.startsWith('✅') ? ' success' : ' error')}>{done}</div>
        )}

        {!connected ? (
          <button className="btn-primary swap-submit">{t(lang, 'swap.connect')}</button>
        ) : needsApproval ? (
          <button className="btn-primary swap-submit" onClick={handleApprove} disabled={loading}>
            {loading ? <span className="btn-loading"><i className="fas fa-spinner fa-spin"></i> {t(lang, 'swap.approving')}</span> : t(lang, 'swap.approve') + ' ' + fromToken?.symbol}
          </button>
        ) : (
          <button className="btn-primary swap-submit" onClick={handleSwap} disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}>
            {loading ? <span className="btn-loading"><i className="fas fa-spinner fa-spin"></i> {t(lang, 'swap.swapping')}</span> : t(lang, 'swap.swap')}
          </button>
        )}
      </div>

      {showTokens && (
        <TokenSelect
          onSelect={(token) => {
            if (showTokens === 'from') { setFromToken(token); if (toToken?.address === token.address) setToToken(null) }
            else { setToToken(token); if (fromToken?.address === token.address) setFromToken(null) }
            setShowTokens(null); setDone('')
          }}
          onClose={() => setShowTokens(null)}
        />
      )}
    </div>
  )
}
