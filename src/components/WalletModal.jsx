import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const TELEGRAM_USERNAME = 'mv0898'

export default function WalletModal({ onClose }) {
  const { wallets, select, connecting } = useWallet()

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSelect = (walletName) => {
    select(walletName)
    onClose()
  }

  const detected = wallets.filter(w => w.readyState === 'Installed')
  const notDetected = wallets.filter(w => w.readyState !== 'Installed')

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Модалка */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#0f0f1a',
            border: '1px solid rgba(153,69,255,0.3)',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            pointerEvents: 'all',
          }}
        >
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', margin: 0 }}>CONNECT WALLET</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'monospace', margin: '4px 0 0' }}>Select your Solana wallet</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 18,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Detected */}
          {detected.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: 'monospace' }}>Detected</p>
              {detected.map(w => (
                <button
                  key={w.adapter.name}
                  onClick={() => handleSelect(w.adapter.name)}
                  disabled={connecting}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: 8 }}
                >
                  <img src={w.adapter.icon} style={{ width: 32, height: 32, borderRadius: 8 }} alt={w.adapter.name} />
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{w.adapter.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#14F195', fontFamily: 'monospace' }}>Detected</span>
                </button>
              ))}
            </div>
          )}

          {/* Not detected */}
          {notDetected.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {detected.length > 0 && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: 'monospace' }}>Install</p>}
              {notDetected.slice(0, 3).map(w => (
                <button
                  key={w.adapter.name}
                  onClick={() => handleSelect(w.adapter.name)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', marginBottom: 8, opacity: 0.65 }}
                >
                  <img src={w.adapter.icon} style={{ width: 32, height: 32, borderRadius: 8 }} alt={w.adapter.name} />
                  <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{w.adapter.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Not installed</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4, paddingTop: 16 }}>
            <a
              href={"https://t.me/" + TELEGRAM_USERNAME}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 14, background: 'rgba(34,158,217,0.12)', border: '1px solid rgba(34,158,217,0.3)', textDecoration: 'none', marginBottom: 12 }}
            >
              <svg style={{ width: 16, height: 16, fill: '#229ED9', flexShrink: 0 }} viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.144.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.17l-2.982-.94c-.648-.204-.66-.648.136-.958l11.647-4.492c.537-.194 1.006.131.881.468z" />
              </svg>
              <span style={{ color: '#229ED9', fontSize: 14, fontWeight: 500 }}>Need help? Contact Support</span>
            </a>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', fontFamily: 'monospace', margin: 0 }}>By connecting you agree to our Terms of Service</p>
          </div>

        </div>
      </div>
    </>
  )
}
