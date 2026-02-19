import React, { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const TELEGRAM_USERNAME = 'mv0898'

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

  const getWalletIcon = (wallet) => {
    if (wallet.adapter.icon) {
      return <img src={wallet.adapter.icon} style={{ width: 32, height: 32, borderRadius: 8 }} alt={wallet.adapter.name} />
    }
    return (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(153,69,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9945FF', fontWeight: 700, fontSize: 14 }}>
        {wallet.adapter.name[0]}
      </div>
    )
  }

  return (
    <>
      {/* Backdrop — отдельно, под модалкой */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Модалка — поверх backdrop */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            borderRadius: '20px 20px 0 0',
            overflow: 'hidden',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#0f0f1a',
            border: '1px solid rgba(153,69,255,0.3)',
            borderBottom: 'none',
          }}
        >
          <div style={{ padding: '24px' }}>

            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', margin: 0 }}>CONNECT WALLET</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'monospace' }}>Select your Solana wallet</p>
              </div>

              {/* Крестик */}
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  zIndex: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Detected */}
            {detectedWallets.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: 'monospace' }}>Detected</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detectedWallets.map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet.adapter.name)}
                      disabled={connecting}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
                    >
                      {getWalletIcon(wallet)}
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{wallet.adapter.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#14F195', fontFamily: 'monospace' }}>Detected</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Not detected */}
            {notDetected.length > 0 && (
              <div>
                {detectedWallets.length > 0 && (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: 'monospace' }}>Install</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notDetected.slice(0, 3).map((wallet) => (
                    <button
                      key={wallet.adapter.name}
                      onClick={() => handleSelect(wallet.adapter.name)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', opacity: 0.65 }}
                    >
                      {getWalletIcon(wallet)}
                      <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>{wallet.adapter.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Not installed</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 20, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a
                href={"https://t.me/" + TELEGRAM_USERNAME}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 14, background: 'rgba(34,158,217,0.12)', border: '1px solid rgba(34,158,217,0.3)', textDecoration: 'none' }}
              >
                <svg style={{ width: 16, height: 16, fill: '#229ED9', flexShrink: 0 }} viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.144.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.17l-2.982-.94c-.648-.204-.66-.648.136-.958l11.647-4.492c.537-.194 1.006.131.881.468z" />
                </svg>
                <span style={{ color: '#229ED9', fontSize: 14, fontWeight: 500 }}>Need help? Contact Support</span>
              </a>

              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', fontFamily: 'monospace' }}>
                By connecting you agree to our Terms of Service
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
