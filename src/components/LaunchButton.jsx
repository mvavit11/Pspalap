import React from 'react'

const STATUSES = {
  idle: null,
  preparing: { text: 'Preparing transaction...', color: 'text-white/60' },
  approving: { text: 'Approve in your wallet...', color: 'text-primary' },
  sending: { text: 'Sending to blockchain...', color: 'text-neon-blue' },
  confirming: { text: 'Confirming on-chain...', color: 'text-accent' },
  success: { text: 'Token launched! 🚀', color: 'text-primary' },
  error: { text: 'Error occurred', color: 'text-red-400' },
}

export default function LaunchButton({ onClick, status, disabled, plan, price }) {
  const statusInfo = STATUSES[status] || null
  const isLoading = ['preparing', 'approving', 'sending', 'confirming'].includes(status)

  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full relative overflow-hidden py-4 rounded-xl font-display text-2xl tracking-[0.2em] transition-all duration-300 ${
          isLoading
            ? 'bg-dark-300 border border-primary/30 text-primary/60 cursor-wait'
            : disabled
            ? 'bg-dark-300 border border-white/5 text-white/20 cursor-not-allowed'
            : 'bg-primary text-dark-50 hover:shadow-[0_0_40px_rgba(0,255,163,0.5)] hover:scale-[1.01] active:scale-[0.99] glow-green'
        }`}
      >
        {/* Loading bar */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-accent to-neon-blue animate-pulse w-full" />
        )}

        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            LAUNCHING...
          </span>
        ) : (
          <span>🚀 LAUNCH TOKEN — {price} SOL</span>
        )}
      </button>

      {/* Status message */}
      {statusInfo && (
        <div className={`text-center text-sm font-mono animate-fade-in ${statusInfo.color}`}>
          {statusInfo.text}
        </div>
      )}
    </div>
  )
}
