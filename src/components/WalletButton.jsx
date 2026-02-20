import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletModal from './WalletModal.jsx'
import { formatAddress } from '../utils/tokenLauncher.js'

export default function WalletButton({ className = '' }) {
  const [showModal, setShowModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const { connected, publicKey, disconnect, connecting } = useWallet()

  const handleDisconnect = async () => {
    setShowMenu(false)
    try {
      await disconnect()
    } catch (e) {
      console.warn('Disconnect error:', e)
    }
  }

  const handleChangeWallet = async () => {
    setShowMenu(false)
    try {
      await disconnect()
    } catch (e) {
      console.warn('Disconnect before change error:', e)
    }
    setTimeout(() => setShowModal(true), 150)
  }

  if (connecting) {
    return (
      <button className={`btn-secondary ${className}`} disabled>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Connecting...
        </span>
      </button>
    )
  }

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center gap-3 px-4 py-2.5 bg-dark-300 hover:bg-dark-400 border border-primary/30 hover:border-primary/60 rounded-xl transition-all duration-200 ${className}`}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-sm text-white/80">
            {formatAddress(publicKey.toBase58())}
          </span>
          <svg className={`w-4 h-4 text-white/40 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-52 bg-dark-300 border border-white/10 rounded-xl overflow-hidden z-20 animate-fade-in">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicKey.toBase58())
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </button>
              <div className="border-t border-white/5" />
              <button
                onClick={handleChangeWallet}
                className="w-full px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 text-left transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Change Wallet
              </button>
              <div className="border-t border-white/5" />
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}

        {showModal && <WalletModal onClose={() => setShowModal(false)} />}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`btn-primary ${className}`}
      >
        Connect Wallet
      </button>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  )
}
