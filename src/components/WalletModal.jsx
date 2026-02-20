import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const WALLET_ICONS = {
  Phantom: (
    <svg viewBox="0 0 128 128" className="w-8 h-8" fill="none">
      <rect width="128" height="128" rx="32" fill="#AB9FF2"/>
      <path d="M110.584 64.923c0 24.868-20.156 45.024-45.024 45.024-24.868 0-45.024-20.156-45.024-45.024 0-24.868 20.156-45.024 45.024-45.024 24.868 0 45.024 20.156 45.024 45.024z" fill="white"/>
      <path d="M93.967 62.238c-1.374-7.568-8.012-13.307-15.98-13.307-7.43 0-13.726 5.024-15.646 11.84-.68-.135-1.382-.206-2.1-.206-6.016 0-10.893 4.877-10.893 10.893 0 6.016 4.877 10.893 10.893 10.893h33.726V62.238z" fill="#AB9FF2"/>
      <circle cx="57.5" cy="71.5" r="3.5" fill="white"/>
      <circle cx="78.5" cy="71.5" r="3.5" fill="white"/>
    </svg>
  ),
  Solflare: (
    <svg viewBox="0 0 128 128" className="w-8 h-8" fill="none">
      <rect width="128" height="128" rx="32" fill="#FC6621"/>
      <path d="M64 24L97 88H31L64 24z" fill="white" opacity="0.9"/>
      <path d="M64 44L85 80H43L64 44z" fill="#FC6621"/>
    </svg>
  ),
}

export default function WalletModal({ onClose }) {
  const { wallets, select, connect, connecting, connected } = useWallet()

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Auto-close once connected
  useEffect(() => {
    if (connected) {
      onClose()
    }
  }, [connected, onClose])

  const handleSelect = (walletName) => {
    select(walletName)
    // Attempt connect after a brief tick so the adapter has time to load the selected wallet
    setTimeout(async () => {
      try {
        await connect()
      } catch (e) {
        // Phantom/Solflare may auto-connect after select(), suppress benign errors
        if (!e?.message?.includes('Wallet not connected')) {
          console.warn('Connect after select:', e?.message)
        }
      }
    }, 100)
  }

  const detectedWallets = wallets.filter(w => w.readyState === 'Installed')
  const notDetected = wallets.filter(w => w.readyState !== 'Installed')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-slide-up z-10">
        <div className="animated-border rounded-2xl overflow-hidden">
          <div className="bg-dark-300 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-white tracking-wider">CONNECT WALLET</h2>
                <p className="text-white/40 text-xs font-mono mt-1">Select your Solana wallet</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClose() }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Detected wallets */}
            {detectedWallets.length > 0 && (
              <div className="mb-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Detected</p>
                <div className="space-y-2">
                  {detectedWallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet.adapter.name)}
                      disabled={connecting}
                      className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0">
                        {WALLET_ICONS[wallet.adapter.name] || (
                          <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="" />
                        )}
                      </div>
                      <span className="font-semibold text-white group-hover:text-primary transition-colors">
                        {wallet.adapter.name}
                      </span>
                      <span className="ml-auto text-xs text-primary/70 font-mono">Detected</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Not detected */}
            {notDetected.length > 0 && (
              <div>
                {detectedWallets.length > 0 && (
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Install</p>
                )}
                <div className="space-y-2">
                  {notDetected.slice(0, 3).map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet.adapter.name)}
                      className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-dark-200 border border-white/5 rounded-xl transition-all duration-200 group opacity-60 hover:opacity-100"
                    >
                      <div className="flex-shrink-0">
                        {WALLET_ICONS[wallet.adapter.name] || (
                          <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="" />
                        )}
                      </div>
                      <span className="font-semibold text-white/70 group-hover:text-white transition-colors">
                        {wallet.adapter.name}
                      </span>
                      <span className="ml-auto text-xs text-white/30 font-mono">Not installed</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-white/20 text-xs text-center mt-5 font-mono">
              By connecting you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
