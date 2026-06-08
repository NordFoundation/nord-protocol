import { useStore } from '../store'
import { t } from '../i18n'

export function ConnectWallet() {
  const { connected, account, setConnected, enterDemo, exitDemo, demoMode, lang } = useStore()

  const handleClick = async () => {
    if (connected) { if (demoMode) exitDemo(); return }
    if (!window.ethereum) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts[0]) {
        setConnected(accounts[0])
        localStorage.setItem('nord_account', accounts[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const shortAddr = account
    ? account.startsWith('0x1234')
      ? '🧪 Demo'
      : account.slice(0, 6) + '...' + account.slice(-4)
    : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button className={'btn-wallet' + (connected ? ' connected' : '')} onClick={handleClick} style={{ width: '100%', justifyContent: 'center' }}>
        <i className={'fas ' + (connected ? 'fa-wallet' : 'fa-plug')}></i>
        {connected ? shortAddr : t(lang, 'common.connect')}
      </button>
      {!connected && (
        <button className="btn-secondary" onClick={enterDemo} style={{ width: '100%', justifyContent: 'center', fontSize: '.8rem', padding: '8px 12px' }}>
          <i className="fas fa-flask"></i> Demo Mode
        </button>
      )}
    </div>
  )
}
