import React, { useMemo, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import { TokenCountProvider } from './context/TokenCountContext.jsx'
import HomePage from './pages/HomePage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
const RPC = import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl(NETWORK)

export default function App() {
  // Phantom fix: new versions expose window.phantom.solana
  // but PhantomWalletAdapter looks for window.solana — bridge them
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.phantom?.solana?.isPhantom &&
      !window.solana
    ) {
      window.solana = window.phantom.solana
    }
  }, [])

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
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
