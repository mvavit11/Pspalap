import React from 'react'
import { Link } from 'react-router-dom'
import WalletButton from './WalletButton.jsx'
import { useTokenCount } from '../context/TokenCountContext.jsx'

const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'

export default function Header() {
  const { count } = useTokenCount()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-dark-50/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-primary rounded-lg opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
            <div className="relative w-8 h-8 bg-dark-300 border border-primary/50 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="font-display text-xl text-white tracking-widest">SOL</span>
            <span className="font-display text-xl text-gradient tracking-widest">LAUNCH</span>
          </div>
        </Link>

        {/* Center - Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-white/40 font-mono text-xs">TOKENS LAUNCHED:</span>
            <span className="text-primary font-mono text-sm font-semibold ticker-num">{count.toLocaleString()}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
            NETWORK === 'mainnet-beta'
              ? 'border-primary/30 text-primary bg-primary/5'
              : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
          }`}>
            {NETWORK === 'mainnet-beta' ? '● MAINNET' : '● DEVNET'}
          </div>
        </div>

        {/* Right */}
        <WalletButton />
      </div>
    </header>
  )
}
