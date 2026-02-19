import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { formatAddress, getSolscanUrl, getMintSolscanUrl } from '../utils/tokenLauncher.js'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 rounded-lg text-xs font-mono text-white/50 hover:text-primary transition-all"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function SuccessPage() {
  const { state } = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
  }, [])

  if (!state) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">No token data found.</p>
          <Link to="/" className="btn-primary">← Back to Launcher</Link>
        </div>
      </div>
    )
  }

  const { mintAddress, signature, decimals, supply, plan, autoRevoked } = state

  return (
    <div className="min-h-screen bg-dark-50 bg-grid-pattern">
      <Header />

      <section className="pt-32 pb-20 px-4">
        <div className={`max-w-xl mx-auto transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-float">
              <span className="text-5xl">🚀</span>
            </div>
            <h1 className="font-display text-5xl text-white tracking-widest mb-2">TOKEN LAUNCHED!</h1>
            <p className="text-white/40 font-mono text-sm">Your Solana token is live on the blockchain</p>
          </div>

          {/* Plan badge */}
          <div className="flex justify-center mb-6">
            <span className="px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-primary font-mono text-sm">
              {plan}
            </span>
          </div>

          {/* Token info */}
          <div className="glass-card p-6 space-y-4 mb-6">
            <h2 className="font-display text-lg text-white tracking-wider mb-5">TOKEN DETAILS</h2>

            {/* Mint Address */}
            <div>
              <label className="label-field">Mint Address</label>
              <div className="flex items-center gap-3 bg-dark-200 border border-white/10 rounded-xl px-4 py-3">
                <span className="font-mono text-sm text-primary flex-1 break-all">
                  {mintAddress}
                </span>
                <CopyButton text={mintAddress} />
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className="label-field">Transaction Signature</label>
              <div className="flex items-center gap-3 bg-dark-200 border border-white/10 rounded-xl px-4 py-3">
                <span className="font-mono text-xs text-white/50 flex-1 break-all">
                  {signature}
                </span>
                <CopyButton text={signature} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-200 rounded-xl p-3">
                <p className="text-white/30 font-mono text-xs mb-1">SUPPLY</p>
                <p className="text-white font-mono text-sm">{parseInt(supply).toLocaleString()}</p>
              </div>
              <div className="bg-dark-200 rounded-xl p-3">
                <p className="text-white/30 font-mono text-xs mb-1">DECIMALS</p>
                <p className="text-white font-mono text-sm">{decimals}</p>
              </div>
            </div>
          </div>

          {/* Ownership Renounced badge (Trusted plan) */}
          {autoRevoked && (
            <div className="glass-card border border-yellow-400/30 bg-yellow-400/5 p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔐</span>
                </div>
                <div>
                  <p className="text-yellow-400 font-semibold">Ownership Renounced</p>
                  <p className="text-white/40 text-sm font-mono mt-1">
                    Mint & Freeze authorities were automatically revoked. This token is immutable and fully decentralized.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-md text-yellow-400 text-xs font-mono">✓ Mint Revoked</span>
                    <span className="px-2 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-md text-yellow-400 text-xs font-mono">✓ Freeze Revoked</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getSolscanUrl(signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 text-center"
            >
              View on Solscan ↗
            </a>
            <a
              href={getMintSolscanUrl(mintAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 text-center"
            >
              View Token ↗
            </a>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-white/30 hover:text-white/60 text-sm font-mono transition-colors"
            >
              ← Launch another token
            </Link>
          </div>

          {/* Share */}
          <div className="mt-8 p-4 bg-dark-300/40 border border-white/5 rounded-xl text-center">
            <p className="text-white/30 text-xs font-mono mb-3">SHARE YOUR LAUNCH</p>
            <a
              href={`https://twitter.com/intent/tweet?text=Just launched my Solana token! 🚀 Mint: ${formatAddress(mintAddress)} — created with SolLaunch&url=https://solscan.io/token/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 rounded-lg text-[#1DA1F2] text-sm font-mono transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Tweet Your Launch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
