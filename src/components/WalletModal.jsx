import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
// Вставь свой Telegram username сюда (без @)
const TELEGRAM_USERNAME = 'mv0898'
const WALLET_ICONS = {
Phantom: (
<svg viewBox="0 0 128 128" className="w-8 h-8" fill="none">
<rect width="128" height="128" rx="32" fill="#AB9FF2"/>
<path d="M110.584 64.923c0 24.868-20.156 45.024-45.024 45.024-24.868 0-45.024-20.156-45
<path d="M93.967 62.238c-1.374-7.568-8.012-13.307-15.98-13.307-7.43 0-13.726 5.024-15.6
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
const handleKey = (e) => { if (e.key === 'Escape') onClose() }
window.addEventListener('keydown', handleKey)
return () => window.removeEventListener('keydown', handleKey)
}, [onClose])
useEffect(() => {
document.body.style.overflow = 'hidden'
return () => { document.body.style.overflow = '' }
}, [])
const handleSelect = (walletName) => {
select(walletName)
onClose()
}
const detectedWallets = wallets.filter(w => w.readyState === 'Installed')
const notDetected = wallets.filter(w => w.readyState !== 'Installed')
return (
<div
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
onClick={onClose}
/>
<div className="relative w-full max-w-sm z-10 animate-slide-up">
<div className="animated-border rounded-2xl overflow-hidden">
<div className="bg-dark-300 p-6">
<div className="flex items-center justify-between mb-6">
<div>
</div>
<h2 className="font-display text-2xl text-white tracking-wider">CONNECT WALLE
<p className="text-white/40 text-xs font-mono mt-1">Select your Solana wallet
<button
type="button"
onClick={(e) => { e.stopPropagation(); onClose() }}
aria-label="Close"
className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-wh
>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoi
className="text-white/50 group-hover:text-red-400 transition-colors">
<line x1="18" y1="6" x2="6" y2="18"/>
<line x1="6" y1="6" x2="18" y2="18"/>
</svg>
</button>
</div>
{detectedWallets.length > 0 && (
<div className="mb-4">
<p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3"
<div className="space-y-2">
{detectedWallets.map((wallet) => (
<button
key={wallet.adapter.name}
onClick={() => handleSelect(wallet.adapter.name)}
disabled={connecting}
className="w-full flex items-center gap-4 p-4 bg-dark-200 hover:bg-prim
>
<div className="flex-shrink-0">
{WALLET_ICONS[wallet.adapter.name] || (
<img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="
)}
</div>
<span className="font-semibold text-white group-hover:text-primary tran
{wallet.adapter.name}
</span>
</button>
<span className="ml-auto text-xs text-primary/70 font-mono">Detected</s
))}
</div>
</div>
)}
{notDetected.length > 0 && (
<div>
)}
{detectedWallets.length > 0 && (
<p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-
<div className="space-y-2">
{notDetected.slice(0, 3).map((wallet) => (
<button
key={wallet.adapter.name}
onClick={() => handleSelect(wallet.adapter.name)}
className="w-full flex items-center gap-4 p-4 bg-dark-200/50 hover:bg-d
>
<div className="flex-shrink-0">
{WALLET_ICONS[wallet.adapter.name] || (
<img src={wallet.adapter.icon} className="w-8 h-8 rounded-lg" alt="
)}
</div>
<span className="font-semibold text-white/70 group-hover:text-white tra
{wallet.adapter.name}
</span>
</button>
<span className="ml-auto text-xs text-white/30 font-mono">Not installed
))}
</div>
</div>
)}
<div className="border-t border-white/5 mt-5 pt-4 space-y-3">
<a
href={`https://t.me/${TELEGRAM_USERNAME}`}
target="_blank"
rel="noopener noreferrer"
className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg
>
<svg className="w-4 h-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColo
<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12
</svg>
<span className="text-[#229ED9] text-sm font-medium group-hover:text-white tr
Need help? Contact Support
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
)
}
