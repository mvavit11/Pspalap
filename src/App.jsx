import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { BaseSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl, Transaction, VersionedTransaction } from '@solana/web3.js'
import { TokenCountProvider } from './context/TokenCountContext.jsx'
import HomePage from './pages/HomePage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
const RPC = import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl(NETWORK)

// Custom Phantom adapter — checks both window.phantom.solana and window.solana
class CustomPhantomAdapter extends BaseSignerWalletAdapter {
  name = 'Phantom'
  url = 'https://phantom.app'
  icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIzMiIgZmlsbD0iI0FCOUZGMiIvPjxwYXRoIGQ9Ik0xMTAuNTg0IDY0LjkyM0MxMTAuNTg0IDg5Ljc5MSA5MC40MjggMTA5Ljk0NyA2NS41NiAxMDkuOTQ3QzQwLjY5MiAxMDkuOTQ3IDIwLjUzNiA4OS43OTEgMjAuNTM2IDY0LjkyM0MyMC41MzYgNDAuMDU1IDQwLjY5MiAxOS44OTkgNjUuNTYgMTkuODk5QzkwLjQyOCAxOS44OTkgMTEwLjU4NCA0MC4wNTUgMTEwLjU4NCA2NC45MjNaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik05My45NjcgNjIuMjM4QzkyLjU5MyA1NC42NyA4NS45NTUgNDguOTMxIDc3Ljk4NyA0OC45MzFDNzAuNTU3IDQ4LjkzMSA2NC4yNjEgNTMuOTU1IDYyLjM0MSA2MC43NzFDNjEuNjYxIDYwLjYzNiA2MC45NTkgNjAuNTY1IDYwLjI0MSA2MC41NjVDNTQuMjI1IDYwLjU2NSA0OS4zNDggNjUuNDQyIDQ5LjM0OCA3MS40NThDNDkuMzQ4IDc3LjQ3NCA1NC4yMjUgODIuMzUxIDYwLjI0MSA4Mi4zNTFIOTMuOTY3VjYyLjIzOFoiIGZpbGw9IiNBQjlGRjIiLz48Y2lyY2xlIGN4PSI1Ny41IiBjeT0iNzEuNSIgcj0iMy41IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9Ijc4LjUiIGN5PSI3MS41IiByPSIzLjUiIGZpbGw9IndoaXRlIi8+PC9zdmc+'

  _connecting = false

  get connecting() { return this._connecting }

  get readyState() {
    if (typeof window === 'undefined') return WalletReadyState.Unsupported
    const provider = window.phantom?.solana || window.solana
    if (provider?.isPhantom) return WalletReadyState.Installed
    return WalletReadyState.NotDetected
  }

  get publicKey() {
    const provider = window.phantom?.solana || window.solana
    return provider?.publicKey || null
  }

  get connected() {
    const provider = window.phantom?.solana || window.solana
    return !!provider?.isConnected
  }

  _provider() {
    return window.phantom?.solana?.isPhantom
      ? window.phantom.solana
      : window.solana?.isPhantom
      ? window.solana
      : null
  }

  async connect() {
    const provider = this._provider()
    if (!provider) {
      window.open('https://phantom.app', '_blank')
      throw new Error('Phantom not installed')
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

  async signTransaction(transaction) {
    const provider = this._provider()
    if (!provider) throw new Error('Phantom not connected')
    return provider.signTransaction(transaction)
  }

  async signAllTransactions(transactions) {
    const provider = this._provider()
    if (!provider) throw new Error('Phantom not connected')
    return provider.signAllTransactions(transactions)
  }
}

export default function App() {
  const wallets = useMemo(() => [
    new CustomPhantomAdapter(),
    new SolflareWalletAdapter(),
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
