import React from 'react';
import './PricingCards.css';

const PLANS = [
  {
    id: 'starter',
    tier: 'Starter',
    icon: '🥉',
    price: '0.25',
    accent: '#e07a44',
    accentRgb: '224,122,68',
    tag: 'Safe Mode',
    tagColor: 'var(--green)',
    description: 'Launch a secure token with all authorities revoked.',
    features: [
      { text: 'Create SPL Token', included: true },
      { text: 'Upload metadata (name, symbol, logo)', included: true },
      { text: 'Mint initial supply', included: true },
      { text: 'Auto Revoke Mint Authority', included: true, highlight: true },
      { text: 'Auto Revoke Freeze Authority', included: true, highlight: true },
      { text: 'Keep Mint Authority (Advanced)', included: false },
      { text: 'Metadata update', included: false },
      { text: 'Liquidity pool creation', included: false },
    ],
    note: '⚠ Authorities are always revoked in this plan.',
  },
  {
    id: 'pro',
    tier: 'Pro',
    icon: '🥈',
    price: '0.45',
    accent: '#aac8e8',
    accentRgb: '170,200,232',
    tag: 'Most Popular',
    tagColor: 'var(--accent)',
    description: 'Full control over your token with advanced options.',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Keep Mint Authority (optional)', included: true, highlight: true },
      { text: 'Keep Freeze Authority (optional)', included: true, highlight: true },
      { text: 'Additional mint after creation', included: true },
      { text: 'Metadata update', included: true },
      { text: 'Liquidity pool creation', included: false },
      { text: 'LP lock', included: false },
      { text: 'Featured in Recently Created', included: false },
    ],
  },
  {
    id: 'launch',
    tier: 'Launch',
    icon: '🥇',
    price: '0.85',
    accent: '#ffd166',
    accentRgb: '255,209,102',
    tag: 'Full Launch',
    tagColor: 'var(--gold)',
    description: 'Complete token launch suite with liquidity.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Create liquidity pool', included: true, highlight: true },
      { text: 'Add initial liquidity', included: true, highlight: true },
      { text: 'LP lock', included: true, highlight: true },
      { text: 'Featured in Recently Created', included: true, highlight: true },
      { text: 'Priority support', included: true },
    ],
  },
];

export default function PricingCards({ onSelect }) {
  return (
    <div className="pricing">
      <div className="pricing__header">
        <h2 className="pricing__title">Choose Your Plan</h2>
        <p className="pricing__sub">Select the package that fits your launch needs</p>
      </div>

      <div className="pricing__cards">
        {PLANS.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={onSelect}
            delay={i * 0.08}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, onSelect, delay }) {
  return (
    <div
      className={`plan-card ${plan.id === 'launch' ? 'plan-card--featured' : ''}`}
      style={{
        '--plan-accent': plan.accent,
        '--plan-rgb': plan.accentRgb,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="plan-card__header">
        <div className="plan-card__tier-row">
          <span className="plan-card__icon">{plan.icon}</span>
          <div>
            <div className="plan-card__tier">{plan.tier}</div>
            {plan.tag && (
              <span className="plan-card__tag" style={{ color: plan.tagColor }}>
                {plan.tag}
              </span>
            )}
          </div>
        </div>
        <div className="plan-card__price">
          <span className="plan-card__price-value">{plan.price}</span>
          <span className="plan-card__price-unit">SOL</span>
        </div>
      </div>

      <p className="plan-card__desc">{plan.description}</p>

      <ul className="plan-card__features">
        {plan.features.map((f, i) => (
          <li
            key={i}
            className={`plan-card__feature ${f.included ? '' : 'plan-card__feature--off'} ${f.highlight ? 'plan-card__feature--highlight' : ''}`}
          >
            <span className="plan-card__feature-check">
              {f.included ? '✓' : '—'}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      {plan.note && (
        <div className="plan-card__note">{plan.note}</div>
      )}

      <button
        className="plan-card__btn"
        onClick={() => onSelect(plan)}
      >
        Select {plan.tier} Plan
      </button>
    </div>
  );
}
