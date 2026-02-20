import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import { TokenCountProvider } from './context/TokenCountContext.jsx'
import HomePage from './pages/HomePage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
const RPC = import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl(NETWORK)

// Backpack wallet adapter (checks window.backpack)
import { BaseSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base'

class BackpackAdapter extends BaseSignerWalletAdapter {
  name = 'Backpack'
  url = 'https://backpack.app'
  icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIzMiIgZmlsbD0iI0UzM0UzRiIvPjxwYXRoIGQ9Ik02NCAyOEM1MCAyOCA0MCAzOCA0MCA1MlY1NkgzNkMzMyA1NiAzMCA1OSAzMCA2MlY5NkMzMCA5OSAzMyAxMDIgMzYgMTAySDkyQzk1IDEwMiA5OCA5OSA5OCA5NlY2MkM5OCA1OSA5NSA1NiA5MiA1NkgxMjhWNTJDODggMzggNzggMjggNjQgMjhaTTY0IDM2QzczIDM2IDgwIDQzIDgwIDUyVjU2SDQ4VjUyQzQ4IDQzIDU1IDM2IDY0IDM2Wk02NCA3MEM2OCA3MCA3MiA3NCA3MiA3OEM3MiA4MSA3MCA4NCA2NyA4NVY5MEg2MVY4NUA1OCA4NCA1NiA4MSA1NiA3OEM1NiA3NCA2MCA3MCA2NCA3MFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
  _connecting = false

  get connecting() { return this._connecting }

  get readyState() {
    if (typeof window === 'undefined') return WalletReadyState.Unsupported
    if (window.backpack?.isBackpack || window.xnft?.solana) return WalletReadyState.Installed
    return WalletReadyState.NotDetected
  }

  get publicKey() {
    const p = window.backpack || window.xnft?.solana
    return p?.publicKey || null
  }

  get connected() {
    const p = window.backpack || window.xnft?.solana
    return !!p?.isConnected
  }

  _provider() {
    return window.backpack?.isBackpack ? window.backpack : window.xnft?.solana || null
  }

  async connect() {
    const provider = this._provider()
    if (!provider) {
      window.open('https://backpack.app', '_blank')
      throw new Error('Backpack not installed')
    }
    this._connecting = true
    try {
      const resp = await provider.connect()
      this.emit('connect', resp.publicKey)
    } catch (e) {
      this.emit('error', e)
      throw e
    } finally {
      this._connecting = false
    }
  }

  async disconnect() {
    const provider = this._provider()
    if (provider) {
      await provider.disconnect()
      this.emit('disconnect')
    }
  }

  async signTransaction(tx) {
    const provider = this._provider()
    if (!provider) throw new Error('Backpack not connected')
    return provider.signTransaction(tx)
  }

  async signAllTransactions(txs) {
    const provider = this._provider()
    if (!provider) throw new Error('Backpack not connected')
    return provider.signAllTransactions(txs)
  }
}

export default function App() {
  const wallets = useMemo(() => [
    new SolflareWalletAdapter(),
    new BackpackAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <TokenCountProvider>
          <BrowserRouter>
            <div className="scanline" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/success" element={<SuccessPage />} />
            </Routes>
          </BrowserRouter>
        </TokenCountProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
