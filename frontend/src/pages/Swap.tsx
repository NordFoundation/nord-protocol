import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'
import { t } from '../i18n'
import { TokenSelect } from '../components/TokenSelect'
import { useContract } from '../hooks/useContract'
import { ROUTER_ADDRESS } from '../config/contracts'
import { toWei, fromWei } from '../utils/format'
import type { TokenInfo } from '../config/tokens'

export function Swap() {
  const { lang, connected, account } = useStore()
  const { getAmountsOut, getAllowance, approve, swap } = useContract()

  const [fromToken, setFromToken] = useState<TokenInfo | null>(null)
  const [toToken, setToToken] = useState<TokenInfo | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [showTokens, setShowTokens] = useState<'from' | 'to' | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)

  const fromTokenAddr = fromToken?.address as `0x${string}` | undefined
  const toTokenAddr = toToken?.address as `0x${string}` | undefined

  useEffect(() => {
    if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) <= 0) { setToAmount(''); return }
    const fetch = async () => {
      try {
        const amountIn = toWei(fromAmount, fromToken.decimals)
        const amounts = await getAmountsOut(amountIn, [fromTokenAddr!, toTokenAddr!])
        if (amounts.length > 1) {
          setToAmount(fromWei(amounts[amounts.length - 1], toToken.decimals))
        }
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
    setLoading(true)
    try {
      const amountIn = toWei(fromAmount, fromToken.decimals)
      const amounts = await getAmountsOut(amountIn, [fromTokenAddr!, toTokenAddr!])
      if (!amounts.length) throw new Error('No liquidity')
      const amountOutMin = amounts[amounts.length - 1] * 995n / 1000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200)
      await swap(amountIn, amountOutMin, [fromTokenAddr!, toTokenAddr!], account as `0x${string}`, deadline, account as `0x${string}`)
      setFromAmount('')
    } catch (e: any) {
      alert(e.message || 'Swap failed')
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!fromToken || !account) return
    setLoading(true)
    try {
      await approve(fromTokenAddr!, ROUTER_ADDRESS, BigInt(2) ** BigInt(256) - 1n, account as `0x${string}`)
      setNeedsApproval(false)
    } catch (e: any) { alert(e.message || 'Approve failed') }
    setLoading(false)
  }

  const reverseTokens = () => {
    const tmp = fromToken; setFromToken(toToken); setToToken(tmp)
    setFromAmount(''); setToAmount('')
  }

  return (
    <div className="page">
      <div className="swap-card">
        <div className="form-input" style={{ marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '.85rem', minWidth: '60px' }}>{t(lang, 'swap.from')}</span>
          <input type="number" placeholder="0.0" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} />
          <button className="token-btn" onClick={() => setShowTokens('from')}>
            {fromToken ? <>{fromToken.logo} {fromToken.symbol}</> : t(lang, 'swap.selectToken')}
          </button>
        </div>
        <div className="swap-arrow">
          <button className="btn-ghost" onClick={reverseTokens}><i className="fas fa-arrow-down"></i></button>
        </div>
        <div className="form-input" style={{ marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '.85rem', minWidth: '60px' }}>{t(lang, 'swap.to')}</span>
          <input type="text" placeholder="0.0" value={toAmount} readOnly />
          <button className="token-btn" onClick={() => setShowTokens('to')}>
            {toToken ? <>{toToken.logo} {toToken.symbol}</> : t(lang, 'swap.selectToken')}
          </button>
        </div>

        {fromToken && toToken && <div className="info-row">
          <span>{t(lang, 'swap.rate')}</span>
          <span>1 {fromToken.symbol} = {fromAmount && toAmount ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) : '—'} {toToken.symbol}</span>
        </div>}

        {!connected ? (
          <button className="btn-primary">{t(lang, 'swap.connect')}</button>
        ) : needsApproval ? (
          <button className="btn-primary" onClick={handleApprove} disabled={loading}>
            {loading ? '...' : t(lang, 'swap.approve') + ' ' + fromToken?.symbol}
          </button>
        ) : (
          <button className="btn-primary" onClick={handleSwap} disabled={loading || !fromAmount || parseFloat(fromAmount) <= 0}>
            {loading ? '...' : t(lang, 'swap.swap')}
          </button>
        )}
      </div>

      {showTokens && (
        <TokenSelect
          onSelect={(token) => {
            if (showTokens === 'from') { setFromToken(token); if (toToken?.address === token.address) setToToken(null) }
            else { setToToken(token); if (fromToken?.address === token.address) setFromToken(null) }
            setShowTokens(null)
          }}
          onClose={() => setShowTokens(null)}
        />
      )}
    </div>
  )
}