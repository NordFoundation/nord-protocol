import { useStore } from '../store'
import { t } from '../i18n'

export function ConnectWallet() {
  const { connected, account, setConnected, lang } = useStore()

  const handleClick = async () => {
    if (connected) return
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

  const shortAddr = account ? account.slice(0, 6) + '...' + account.slice(-4) : ''

  return (
    <button className={'btn-wallet' + (connected ? ' connected' : '')} onClick={handleClick}>
      <i className={'fas ' + (connected ? 'fa-wallet' : 'fa-plug')}></i>
      {connected ? shortAddr : t(lang, 'common.connect')}
    </button>
  )
}