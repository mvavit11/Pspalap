import React, { useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { clusterApiUrl } from '@solana/web3.js'
import { TokenCountProvider } from './context/TokenCountContext.jsx'
import HomePage from './pages/HomePage.jsx'
import SuccessPage from './pages/SuccessPage.jsx'

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'
const RPC = import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl(NETWORK)

export default function App() {
  const wallets = useMemo(() => {
    const adapters = []

    // Phantom — проверяем оба места где он может жить
    const phantomAdapter = new PhantomWalletAdapter()
    adapters.push(phantomAdapter)

    // Solflare
    adapters.push(new SolflareWalletAdapter())

    return adapters
  }, [])

  return (
    <ConnectionProvider endpoint={RPC}>
      {/*
        autoConnect: true — при повторном заходе кошелёк подключается сам
        onError: глушим ошибки которые возникают при конфликтах расширений
      */}
      <WalletProvider
        wallets={wallets}
        autoConnect={true}
        onError={(error) => {
          // Не крашим приложение при конфликтах между расширениями
          console.warn('Wallet error (non-fatal):', error?.message)
        }}
      >
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
