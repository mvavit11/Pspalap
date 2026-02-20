import React, { useEffect, useState } from 'react'
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

function isSafari() {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua)
}

function isPhantomAvailable() {
  if (typeof window === 'undefined') return false
  return !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom)
}

export default function WalletModal({ onClose }) {
  const { wallets, select, connecting, connected } = useWallet()
  const [phantomSafariWarning, setPhantomSafariWarning] = useState(false)

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (connected) onClose()
  }, [connected, onClose])

  const handleSelect = (walletName) => {
    if (walletName === 'Phantom' && isSafari() && !isPhantomAvailable()) {
      setPhantomSafariWarning(true)
      return
    }
    select(walletName)
    onClose()
  }

  const detectedWallets = wallets.filter(w => w.readyState === 'Installed')
  const notDetected = wallets.filter(w => w.readyState !== 'Installed')

  return (
    <>
      {/* Backdrop — отдельный слой ПОД модалкой */}
      <div
        style={{
          position: 'fixed', inset: 0,
          zIndex: 998,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Модалка — отдельный слой НАД backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none', // клики сквозь wrapper проходят к backdrop
        }}
      >
        <div
          style={{ pointerEvents: 'all' }} // только сама карточка кликабельна
          className="w-full max-w-sm animate-slide-up"
        >
          <div className="animated-border rounded-2xl overflow-hidden">
            <div className="bg-dark-300 p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl text-white tracking-wider">CONNECT WALLET</h2>
                  <p className="text-white/40 text-xs font-mono mt-1">Select your Solana wallet</p>
                </div>
                {/* Крестик */}
                <button
                  type="button"
                  onClick={onClose}
                  style={{ cursor: 'pointer', zIndex: 1000, position: 'relative' }}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Safari + Phantom warning */}
              {phantomSafariWarning && (
                <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-orange-400 font-semibold text-sm mb-1">Phantom не работает в Safari</p>
                      <p className="text-orange-300/70 text-xs leading-relaxed">
                        Откройте сайт в <span className="text-orange-300 font-semibold">Chrome, Brave или Firefox</span> с установленным расширением Phantom.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPhantomSafariWarning(false)}
                        className="mt-2 text-xs text-orange-400/60 hover:text-orange-400 underline transition-colors"
                      >
                        ← Назад
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected wallets */}
              {!phantomSafariWarning && detectedWallets.length > 0 && (
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
              {!phantomSafariWarning && notDetected.length > 0 && (
                <div>
                  {detectedWallets.length > 0 && (
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Install</p>
                  )}
                  <div className="space-y-2">
                    {notDetected.map((wallet) => (
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
                        <span className="ml-auto text-xs text-white/30 font-mono">
                          {wallet.adapter.name === 'Phantom' && isSafari() ? '⚠ Not supported in Safari' : 'Not installed'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              {!phantomSafariWarning && (
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-white/20 text-xs font-mono">
                    By connecting you agree to our Terms
                  </p>
                  <a
                    href="https://t.me/mv0898"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-[#29B6F6] transition-colors font-mono"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.48 13.617l-2.95-.924c-.64-.203-.654-.64.136-.954l11.57-4.461c.537-.194 1.006.131.658.943z"/>
                    </svg>
                    Поддержка @mv0898
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
