import React, { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'

export default function WalletModal({ onClose }) {
  const { wallets, select, connect, connecting, connected } = useWallet()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (connected) onClose()
  }, [connected, onClose])

  const handleSelect = useCallback(async (wallet) => {
    setError(null)
    if (
      wallet.readyState === WalletReadyState.NotDetected ||
      wallet.readyState === WalletReadyState.Unsupported
    ) {
      window.open(wallet.adapter.url, '_blank')
      return
    }
    try {
      select(wallet.adapter.name)
      await connect()
    } catch (e) {
      if (e?.message?.includes('User rejected') || e?.message?.includes('cancelled')) return
      setError(e?.message || 'Connection failed')
    }
  }, [select, connect])

  const installedWallets = wallets.filter(w =>
    w.readyState === WalletReadyState.Installed ||
    w.readyState === WalletReadyState.Loadable
  )
  const otherWallets = wallets.filter(w =>
    w.readyState !== WalletReadyState.Installed &&
    w.readyState !== WalletReadyState.Loadable
  )

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          boxSizing: 'border-box',
        }}
        className="animate-slide-up"
      >
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

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
                ⚠ {error}
              </div>
            )}

            {/* Detected */}
            {installedWallets.length > 0 && (
              <div className="mb-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Detected</p>
                <div className="space-y-2">
                  {installedWallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet)}
                      disabled={connecting}
                      className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-wait"
                    >
                      <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg flex-shrink-0" alt="" />
                      <span className="font-semibold text-white group-hover:text-primary transition-colors">
                        {wallet.adapter.name}
                      </span>
                      <span className="ml-auto text-xs text-primary/70 font-mono">
                        {connecting ? 'Connecting...' : 'Detected ✓'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Not installed */}
            {otherWallets.length > 0 && (
              <div>
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">
                  {installedWallets.length > 0 ? 'Install' : 'Not detected'}
                </p>
                <div className="space-y-2">
                  {otherWallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet)}
                      className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-dark-200 border border-white/5 rounded-xl transition-all duration-200 group opacity-60 hover:opacity-100"
                    >
                      <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg flex-shrink-0" alt="" />
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
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#29B6F6" style={{ flexShrink: 0 }}>
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
  )
}
