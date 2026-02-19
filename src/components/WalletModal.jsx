import React, { useEffect } from ‘react’
import { useWallet } from ‘@solana/wallet-adapter-react’

// ← Вставь свой Telegram username сюда (без @)
const TELEGRAM_USERNAME = ‘your_username’

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
const { wallets, select, connecting } = useWallet()

useEffect(() => {
const handleKey = (e) => { if (e.key === ‘Escape’) onClose() }
window.addEventListener(‘keydown’, handleKey)
return () => window.removeEventListener(‘keydown’, handleKey)
}, [onClose])

useEffect(() => {
document.body.style.overflow = ‘hidden’
return () => { document.body.style.overflow = ‘’ }
}, [])

const handleSelect = (walletName) => {
select(walletName)
onClose()
}

const detectedWallets = wallets.filter(w => w.readyState === ‘Installed’)
const notDetected = wallets.filter(w => w.readyState !== ‘Installed’)

return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
{/* Backdrop */}
<div
className="absolute inset-0 bg-black/70 backdrop-blur-sm"
onClick={onClose}
/>

```
  {/* Modal */}
  <div className="relative w-full max-w-sm z-10 animate-slide-up">
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
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-all duration-200 cursor-pointer border border-white/10 hover:border-red-500/40 group"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-white/50 group-hover:text-red-400 transition-colors">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
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

        {/* Footer */}
        <div className="border-t border-white/5 mt-5 pt-4 space-y-3">
          {/* Telegram support */}
          <a
            href={`https://t.me/${TELEGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/20 hover:border-[#229ED9]/40 transition-all duration-200 group"
          >
            <svg className="w-4 h-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span className="text-[#229ED9] text-sm font-medium group-hover:text-white transition-colors">
              Support — @{TELEGRAM_USERNAME}
            </span>
          </a>

          <p className="text-white/20 text-xs text-center font-mono">
            By connecting you agree to our Terms of Service
          </p>
        </div>

      </div>
    </div>
  </div>
</div>
```

)
}
