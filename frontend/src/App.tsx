import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Swap } from './pages/Swap'
import { Pool } from './pages/Pool'
import { Liquidity } from './pages/Liquidity'
import { useEffect } from 'react'
import { useStore } from './store'

export default function App() {
  const { setConnected } = useStore()

  useEffect(() => {
    const saved = localStorage.getItem('nord_account')
    if (saved) setConnected(saved)
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setConnected(accounts[0] || null)
        if (accounts[0]) localStorage.setItem('nord_account', accounts[0])
        else localStorage.removeItem('nord_account')
      })
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/pool" element={<Pool />} />
          <Route path="/liquidity" element={<Liquidity />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}