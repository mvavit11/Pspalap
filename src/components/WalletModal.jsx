import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

// Detect if running on mobile Safari (iOS)
const isMobileSafari = () => {
  const ua = navigator.userAgent
  return /iP(hone|ad|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua)
}

// Deep link connection for mobile — opens wallet app directly
const connectViaDeepLink = (walletName, currentUrl) => {
  const encoded = encodeURIComponent(currentUrl)
  if (walletName === 'Phantom') {
    // Phantom Universal Link format
    const link = `https://phantom.app/ul/v1/connect?app_url=${encoded}&dapp_encryption_public_key=&redirect_link=${encoded}&cluster=mainnet-beta`
    window.location.href = link
  } else if (walletName === 'Solflare') {
    // Solflare Universal Link format
    const link = `https://solflare.com/ul/v1/connect?app_url=${encoded}&redirect_link=${encoded}&cluster=mainnet-beta`
    window.location.href = link
  }
}

export default function WalletModal({ onClose }) {
  const { wallets, select, connect, connecting, connected } = useWallet()
  const mobile = isMobileSafari()

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    if (connected) onClose()
  }, [connected, onClose])

  const handleSelect = async (walletName) => {
    // On mobile Safari — use deep link to open the wallet app directly
    if (mobile) {
      connectViaDeepLink(walletName, window.location.href)
      return
    }
    // On desktop — use standard adapter
    select(walletName)
    setTimeout(async () => {
      try { await connect() } catch (e) { console.warn('connect:', e?.message) }
    }, 150)
  }

  const detectedWallets = wallets.filter(w => w.readyState === 'Installed')
  const notDetected = wallets.filter(w => w.readyState !== 'Installed')

  // On mobile, show both Phantom and Solflare as options regardless of readyState
  const mobileWallets = [
    { name: 'Phantom', icon: WALLET_ICONS.Phantom, url: 'https://phantom.app' },
    { name: 'Solflare', icon: WALLET_ICONS.Solflare, url: 'https://solflare.com' },
  ]

  const modal = (
    <div
      style={{ position:'fixed', inset:0, zIndex:999999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backgroundColor:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', boxSizing:'border-box' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1000000 }}
        onClick={(e) => e.stopPropagation()}
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
                style={{ cursor:'pointer', flexShrink:0, position:'relative', zIndex:1000001 }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* MOBILE — show deep link buttons */}
            {mobile ? (
              <div className="space-y-2">
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Select Wallet</p>
                {mobileWallets.map((w) => (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => handleSelect(w.name)}
                    className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0">{w.icon}</div>
                    <span className="font-semibold text-white group-hover:text-primary transition-colors">{w.name}</span>
                    <span className="ml-auto text-xs text-primary/70 font-mono">Open App →</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* DESKTOP — standard adapter */}
                {detectedWallets.length > 0 && (
                  <div className="mb-4">
                    <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Detected</p>
                    <div className="space-y-2">
                      {detectedWallets.map((wallet) => (
                        <button
                          key={wallet.adapter.name}
                          type="button"
                          onClick={() => handleSelect(wallet.adapter.name)}
                          disabled={connecting}
                          className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-primary/10 border border-white/5 hover:border-primary/40 rounded-xl transition-all duration-200 group disabled:opacity-50"
                        >
                          <div className="flex-shrink-0">
                            {WALLET_ICONS[wallet.adapter.name] || <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="" />}
                          </div>
                          <span className="font-semibold text-white group-hover:text-primary transition-colors">{wallet.adapter.name}</span>
                          <span className="ml-auto text-xs text-primary/70 font-mono">{connecting ? 'Connecting...' : 'Detected ✓'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {notDetected.length > 0 && (
                  <div>
                    {detectedWallets.length > 0 && <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3">Install</p>}
                    <div className="space-y-2">
                      {notDetected.map((wallet) => (
                        <button
                          key={wallet.adapter.name}
                          type="button"
                          onClick={() => window.open(wallet.adapter.url, '_blank')}
                          className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-dark-200 border border-white/5 rounded-xl transition-all duration-200 group opacity-60 hover:opacity-100"
                        >
                          <div className="flex-shrink-0">
                            {WALLET_ICONS[wallet.adapter.name] || <img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="" />}
                          </div>
                          <span className="font-semibold text-white/70 group-hover:text-white transition-colors">{wallet.adapter.name}</span>
                          <span className="ml-auto text-xs text-white/30 font-mono">Install →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
              <p className="text-white/20 text-xs font-mono text-center">By connecting you agree to our Terms of Service</p>
              <a
                href="https://t.me/mv0898"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', padding:'10px 16px', borderRadius:'12px', backgroundColor:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', textDecoration:'none', cursor:'pointer', boxSizing:'border-box', position:'relative', zIndex:1000001 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#29B6F6" style={{flexShrink:0}}>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.48 13.617l-2.95-.924c-.64-.203-.654-.64.136-.954l11.57-4.461c.537-.194 1.006.131.658.943z"/>
                </svg>
                <span style={{color:'#29B6F6', fontSize:'14px', fontFamily:'monospace', fontWeight:600}}>Support @mv0898</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
