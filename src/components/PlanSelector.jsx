import React from 'react'
import { PLAN_CONFIG } from '../utils/tokenLauncher.js'

const PLAN_DETAILS = {
  basic: {
    color: 'text-neon-blue',
    borderSelected: 'border-sky-400/50 shadow-[0_0_30px_rgba(14,165,233,0.15)]',
    bgSelected: 'bg-sky-400/5',
    dot: 'bg-sky-400',
    icon: '⚡',
    features: [
      { text: 'SPL Token creation', ok: true },
      { text: 'Mint Authority retained', ok: true },
      { text: 'Freeze Authority retained', ok: true },
      { text: 'Custom decimals', ok: false },
      { text: 'Revoke authorities', ok: false },
      { text: 'Auto-revoke on launch', ok: false },
      { text: 'Immutable metadata', ok: false },
    ],
  },
  safe: {
    color: 'text-primary',
    borderSelected: 'border-primary/50 shadow-[0_0_30px_rgba(0,255,163,0.15)]',
    bgSelected: 'bg-primary/5',
    dot: 'bg-primary',
    icon: '🛡',
    features: [
      { text: 'SPL Token creation', ok: true },
      { text: 'Custom decimals', ok: true },
      { text: 'Revoke Mint Authority', ok: true },
      { text: 'Revoke Freeze Authority', ok: true },
      { text: 'Auto-revoke on launch', ok: false },
      { text: 'Immutable metadata', ok: false },
    ],
  },
  trusted: {
    color: 'text-gradient-gold',
    borderSelected: 'border-yellow-400/50 shadow-[0_0_30px_rgba(255,215,0,0.15)]',
    bgSelected: 'bg-yellow-400/5',
    dot: 'bg-yellow-400',
    icon: '👑',
    features: [
      { text: 'SPL Token creation', ok: true },
      { text: 'Custom decimals', ok: true },
      { text: 'Revoke Mint Authority', ok: true },
      { text: 'Revoke Freeze Authority', ok: true },
      { text: 'Auto-revoke on launch', ok: true },
      { text: 'Immutable metadata', ok: true },
    ],
  },
}

export default function PlanSelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Object.values(PLAN_CONFIG).map((plan) => {
        const details = PLAN_DETAILS[plan.id]
        const isSelected = selected === plan.id

        return (
          <button
            key={plan.id}
            onClick={() => onChange(plan.id)}
            className={`plan-card text-left ${isSelected ? `selected ${details.borderSelected} ${details.bgSelected}` : ''}`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-mono font-bold rounded-full ${
                plan.id === 'trusted'
                  ? 'bg-yellow-400 text-dark-50'
                  : 'bg-primary text-dark-50'
              }`}>
                {plan.badge}
              </div>
            )}

            {/* Icon + Name */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{details.icon}</span>
              <div>
                <div className={`font-display text-lg tracking-wider ${details.color}`}>
                  {plan.name}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <span className={`font-display text-4xl ${details.color}`}>{plan.price}</span>
              <span className="text-white/40 font-mono text-sm ml-1">SOL</span>
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {details.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className={feat.ok ? 'text-primary' : 'text-white/20'}>
                    {feat.ok ? '✓' : '✕'}
                  </span>
                  <span className={feat.ok ? 'text-white/70' : 'text-white/25'}>
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Selected indicator */}
            {isSelected && (
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${details.dot} animate-pulse`} />
            )}
          </button>
        )
      })}
    </div>
  )
}
