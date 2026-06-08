import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { t } from '../i18n'
import type { TokenInfo } from '../config/tokens'
import { DEFAULT_TOKENS, POPULAR_TOKENS } from '../config/tokens'

interface Props {
  onSelect: (token: TokenInfo) => void
  onClose: () => void
}

export function TokenSelect({ onSelect, onClose }: Props) {
  const { lang, customTokens, addCustomToken } = useStore()
  const [search, setSearch] = useState('')
  const [customAddr, setCustomAddr] = useState('')
  const [customSym, setCustomSym] = useState('')

  const allTokens = [...DEFAULT_TOKENS, ...customTokens]
  const filtered = allTokens.filter((t) =>
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.address.toLowerCase().includes(search.toLowerCase())
  )

  const popular = allTokens.filter((t) => POPULAR_TOKENS.includes(t.symbol))
  const others = filtered.filter((t) => !POPULAR_TOKENS.includes(t.symbol))

  const handleAdd = () => {
    if (customAddr && customSym) {
      addCustomToken({ address: customAddr, symbol: customSym.toUpperCase(), name: customSym.toUpperCase(), decimals: 18, logo: '🪙', verified: false })
      setCustomAddr('')
      setCustomSym('')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{t(lang, 'swap.selectToken')}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-search">
          <input placeholder={t(lang, 'common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="modal-list">
          {popular.length > 0 && <div style={{ padding: '8px 0', fontSize: '.8rem', color: 'var(--text-secondary)' }}>{t(lang, 'swap.popular')}</div>}
          {popular.map((token) => (
            <div key={token.address} className="modal-token" onClick={() => onSelect(token)}>
              <span style={{ fontSize: '1.4rem' }}>{token.logo}</span>
              <div><div className="token-symbol">{token.symbol}</div><div className="token-name">{token.name}</div></div>
              {token.verified && <span style={{ marginLeft: 'auto', fontSize: '.8rem' }}>✅</span>}
            </div>
          ))}
          {others.length > 0 && <div style={{ padding: '8px 0', fontSize: '.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{t(lang, 'swap.myTokens')}</div>}
          {others.map((token) => (
            <div key={token.address} className="modal-token" onClick={() => onSelect(token)}>
              <span style={{ fontSize: '1.4rem' }}>{token.logo}</span>
              <div><div className="token-symbol">{token.symbol}</div><div className="token-name">{token.name}</div></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t(lang, 'swap.addToken')}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="form-input" style={{ flex: 1, padding: '8px 12px', fontSize: '.85rem' }} placeholder={t(lang, 'swap.tokenAddr')} value={customAddr} onChange={(e) => setCustomAddr(e.target.value)} />
            <input className="form-input" style={{ width: '80px', padding: '8px 12px', fontSize: '.85rem' }} placeholder="SYM" value={customSym} onChange={(e) => setCustomSym(e.target.value)} />
            <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={handleAdd}>+</button>
          </div>
        </div>
      </div>
    </div>
  )
}