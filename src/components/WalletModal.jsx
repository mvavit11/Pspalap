import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const WALLET_ICONS = {
  Solflare: (
    <svg viewBox="0 0 128 128" className="w-8 h-8" fill="none">
      <rect width="128" height="128" rx="32" fill="#FC6621"/>
      <path d="M64 24L97 88H31L64 24z" fill="white" opacity="0.9"/>
      <path d="M64 44L85 80H43L64 44z" fill="#FC6621"/>
    </svg>
  ),
  Backpack: (
    <svg viewBox="0 0 128 128" className="w-8 h-8" fill="none">
      <rect width="128" height="128" rx="32" fill="#E33E3F"/>
      <path d="M64 28C50 28 40 38 40 52V56H36C33 56 30 59 30 62V96C30 99 33 102 36 102H92C95 102 98 99 98 96V62C98 59 95 56 92 56H88V52C88 38 78 28 64 28ZM64 36C73 36 80 43 80 52V56H48V52C48 43 55 36 64 36ZM64 70C68 70 72 74 72 78C72 81 70 84 67 85V90H61V85C58 84 56 81 56 78C56 74 60 70 64 70Z" fill="white"/>
    </svg>
  ),
}

const INSTALL_LINKS = {
  Solflare: 'https://solflare.com',
  Backpack: 'https://backpack.app',
}

export default function WalletModal({ onClose }) {
  const { wallets, select, connecting, connected } = useWallet()

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (connected) onClose()
  }, [connected, onClose])

  const handleSelect = (wallet) => {
    if (wallet.readyState !== 'Installed') {
      window.open(INSTALL_LINKS[wallet.adapter.name] || wallet.adapter.url, '_blank')
      return
    }
    select(wallet.adapter.name)
    onClose()
  }

  const detectedWallets = wallets.filter(w => w.readyState === 'Installed')
  const notDetected = wallets.filter(w => w.readyState !== 'Installed')

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal wrapper — pointer-events none so clicks pass to backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'all', width: '100%', maxWidth: '384px' }} className="animate-slide-up">
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
                  onClick={onClose}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Detected */}
              {detectedWallets.length > 0 && (
                <div className="mb-4">
                  <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Detected</p>
                  <div className="space-y-2">
                    {detectedWallets.map((wallet) => (
                      <button
                        key={wallet.adapter.name}
                        onClick={() => handleSelect(wallet)}
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

              {/* Not installed */}
              {notDetected.length > 0 && (
                <div>
                  {detectedWallets.length > 0 && (
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Install</p>
                  )}
                  {detectedWallets.length === 0 && (
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Choose wallet</p>
                  )}
                  <div className="space-y-2">
                    {notDetected.map((wallet) => (
                      <button
                        key={wallet.adapter.name}
                        onClick={() => handleSelect(wallet)}
                        className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-dark-200 border border-white/5 hover:border-primary/20 rounded-xl transition-all duration-200 group opacity-70 hover:opacity-100"
                      >
                        <div className="flex-shrink-0">
                          {WALLET_ICONS[wallet.adapter.name] || (
                            <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="" />
                          )}
                        </div>
                        <span className="font-semibold text-white/70 group-hover:text-white transition-colors">
                          {wallet.adapter.name}
                        </span>
                        <span className="ml-auto text-xs text-white/30 font-mono">Install →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                <p className="text-white/20 text-xs font-mono text-center">
                  By connecting you agree to our Terms of Service
                </p>
                <a
                  href="https://t.me/mv0898"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', cursor: 'pointer' }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/20 hover:border-blue-400/50 transition-all duration-200"
                >
                  <svg style={{ width: 16, height: 16, flexShrink: 0, fill: '#29B6F6' }} viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.48 13.617l-2.95-.924c-.64-.203-.654-.64.136-.954l11.57-4.461c.537-.194 1.006.131.658.943z"/>
                  </svg>
                  <span style={{ color: '#29B6F6', fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 600 }}>
                    Support @mv0898
                  </span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
