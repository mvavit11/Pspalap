import React, { useEffect, useRef, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const WALLET_ICONS = {
  Phantom: (
    <svg viewBox="0 0 128 128" className="w-8 h-8 flex-shrink-0" fill="none">
      <rect width="128" height="128" rx="32" fill="#AB9FF2"/>
      <path d="M110.584 64.923c0 24.868-20.156 45.024-45.024 45.024-24.868 0-45.024-20.156-45.024-45.024 0-24.868 20.156-45.024 45.024-45.024 24.868 0 45.024 20.156 45.024 45.024z" fill="white"/>
      <path d="M93.967 62.238c-1.374-7.568-8.012-13.307-15.98-13.307-7.43 0-13.726 5.024-15.646 11.84-.68-.135-1.382-.206-2.1-.206-6.016 0-10.893 4.877-10.893 10.893 0 6.016 4.877 10.893 10.893 10.893h33.726V62.238z" fill="#AB9FF2"/>
      <circle cx="57.5" cy="71.5" r="3.5" fill="white"/>
      <circle cx="78.5" cy="71.5" r="3.5" fill="white"/>
    </svg>
  ),
  Solflare: (
    <svg viewBox="0 0 128 128" className="w-8 h-8 flex-shrink-0" fill="none">
      <rect width="128" height="128" rx="32" fill="#FC6621"/>
      <path d="M64 24L97 88H31L64 24z" fill="white" opacity="0.9"/>
      <path d="M64 44L85 80H43L64 44z" fill="#FC6621"/>
    </svg>
  ),
}

export default function WalletModal({ onClose }) {
  const { wallets, select, connecting, connected } = useWallet()
  const pendingWalletRef = useRef(null)
  const modalRef = useRef(null)

  // Scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Close only after successful connection
  useEffect(() => {
    if (connected && pendingWalletRef.current) {
      pendingWalletRef.current = null
      onClose()
    }
  }, [connected, onClose])

  const handleSelect = useCallback((walletName) => {
    pendingWalletRef.current = walletName
    select(walletName)
    // Do NOT call onClose() here — wait for `connected` to become true
  }, [select])

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const detectedWallets = wallets.filter((w) => w.readyState === 'Installed')
  const notDetected = wallets.filter((w) => w.readyState !== 'Installed')

  return (
    <>
      {/* Backdrop — pointer-events-none so it never blocks clicks on modal content */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in pointer-events-none"
      />

      {/* Scroll container — handles backdrop clicks and centers modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Connect wallet"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          className="relative w-full max-w-sm my-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="animated-border rounded-2xl overflow-hidden">
            <div className="bg-dark-300 p-6 max-h-[90vh] overflow-y-auto overscroll-contain">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-white tracking-wider">CONNECT WALLET</h2>
                  <p className="text-white/40 text-xs font-mono mt-1">Select your Solana wallet</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close wallet modal"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Connecting state */}
              {connecting && (
                <div className="flex items-center justify-center gap-3 py-4 mb-4 rounded-xl bg-primary/10 border border-primary/20">
                  <svg className="w-4 h-4 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  <span className="text-primary text-sm font-mono">Connecting…</span>
                </div>
              )}

              {/* Detected wallets */}
              {detectedWallets.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Detected</p>
                  <div className="space-y-2">
                    {detectedWallets.map((wallet) => (
                      <button
                        type="button"
                        key={wallet.adapter.name}
                        onClick={() => handleSelect(wallet.adapter.name)}
                        disabled={connecting}
                        className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {WALLET_ICONS[wallet.adapter.name] || (
                          <img
                            src={wallet.adapter.icon}
                            className="w-8 h-8 rounded-lg flex-shrink-0"
                            alt={wallet.adapter.name}
                          />
                        )}
                        <span className="font-semibold text-white group-hover:text-primary transition-colors text-left">
                          {wallet.adapter.name}
                        </span>
                        <span className="ml-auto text-xs text-primary/70 font-mono flex-shrink-0">Detected</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Not detected */}
              {notDetected.length > 0 && (
                <div>
                  {detectedWallets.length > 0 && (
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3 mt-4">Install</p>
                  )}
                  <div className="space-y-2">
                    {notDetected.slice(0, 3).map((wallet) => (
                      <button
                        type="button"
                        key={wallet.adapter.name}
                        onClick={() => handleSelect(wallet.adapter.name)}
                        disabled={connecting}
                        className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-dark-200 border border-white/5 rounded-xl transition-all duration-200 group opacity-60 hover:opacity-100 disabled:cursor-not-allowed"
                      >
                        {WALLET_ICONS[wallet.adapter.name] || (
                          <img
                            src={wallet.adapter.icon}
                            className="w-8 h-8 rounded-lg flex-shrink-0"
                            alt={wallet.adapter.name}
                          />
                        )}
                        <span className="font-semibold text-white/70 group-hover:text-white transition-colors text-left">
                          {wallet.adapter.name}
                        </span>
                        <span className="ml-auto text-xs text-white/30 font-mono flex-shrink-0">Not installed</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {wallets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm font-mono">No wallets found.</p>
                  <p className="text-white/20 text-xs font-mono mt-1">Install Phantom or Solflare to get started.</p>
                </div>
              )}

              <p className="text-white/20 text-xs text-center mt-5 font-mono">
                By connecting you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
