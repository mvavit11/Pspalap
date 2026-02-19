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

  const s = {
    overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:9998, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)' },
    sheet: { position:'fixed', bottom:0, left:0, right:0, zIndex:9999, display:'flex', justifyContent:'center' },
    inner: { width:'100%', maxWidth:'440px', background:'#0f0f1a', border:'1px solid rgba(153,69,255,0.3)', borderBottom:'none', borderRadius:'20px 20px 0 0', maxHeight:'90vh', overflowY:'auto', padding:'24px' },
    handle: { width:40, height:4, borderRadius:99, background:'rgba(255,255,255,0.2)', margin:'0 auto 20px' },
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 },
    title: { fontSize:22, fontWeight:700, color:'#fff', letterSpacing:'0.05em', margin:0 },
    sub: { fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4, fontFamily:'monospace' },
    closeBtn: { width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'rgba(255,255,255,0.7)', flexShrink:0 },
    label: { fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10, fontFamily:'monospace' },
    walletBtn: { width:'100%', display:'flex', alignItems:'center', gap:16, padding:16, borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', marginBottom:8 },
    walletBtnDim: { width:'100%', display:'flex', alignItems:'center', gap:16, padding:16, borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', marginBottom:8, opacity:0.65 },
    walletName: { fontWeight:600, color:'#fff', fontSize:15 },
    walletNameDim: { fontWeight:600, color:'rgba(255,255,255,0.7)', fontSize:15 },
    badge: { marginLeft:'auto', fontSize:12, color:'#14F195', fontFamily:'monospace' },
    badgeDim: { marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' },
    divider: { borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:20, paddingTop:16 },
    tgBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 16px', borderRadius:14, background:'rgba(34,158,217,0.12)', border:'1px solid rgba(34,158,217,0.3)', textDecoration:'none', marginBottom:12 },
    tgText: { color:'#229ED9', fontSize:14, fontWeight:500 },
    terms: { color:'rgba(255,255,255,0.2)', fontSize:11, textAlign:'center', fontFamily:'monospace' },
    icon: { width:32, height:32, borderRadius:8, objectFit:'cover' },
  }

  return (
    <>
      <div style={s.overlay} onClick={onClose} />
      <div style={s.sheet}>
        <div style={s.inner}>
          <div style={s.handle} />

          <div style={s.header}>
            <div>
              <h2 style={s.title}>CONNECT WALLET</h2>
              <p style={s.sub}>Select your Solana wallet</p>
            </div>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>

          {detected.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <p style={s.label}>Detected</p>
              {detected.map(w => (
                <button key={w.adapter.name} style={s.walletBtn} onClick={() => handleSelect(w.adapter.name)} disabled={connecting}>
                  <img src={w.adapter.icon} style={s.icon} alt={w.adapter.name} />
                  <span style={s.walletName}>{w.adapter.name}</span>
                  <span style={s.badge}>Detected</span>
                </button>
              ))}
            </div>
          )}

          {notDetected.length > 0 && (
            <div style={{ marginBottom:16 }}>
              {detected.length > 0 && <p style={s.label}>Install</p>}
              {notDetected.slice(0, 3).map(w => (
                <button key={w.adapter.name} style={s.walletBtnDim} onClick={() => handleSelect(w.adapter.name)}>
                  <img src={w.adapter.icon} style={s.icon} alt={w.adapter.name} />
                  <span style={s.walletNameDim}>{w.adapter.name}</span>
                  <span style={s.badgeDim}>Not installed</span>
                </button>
              ))}
            </div>
          )}

          <div style={s.divider}>
            <a href={"https://t.me/" + TELEGRAM_USERNAME} target="_blank" rel="noopener noreferrer" style={s.tgBtn}>
              <svg style={{ width:16, height:16, fill:'#229ED9', flexShrink:0 }} viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.28c-.144.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.17l-2.982-.94c-.648-.204-.66-.648.136-.958l11.647-4.492c.537-.194 1.006.131.881.468z" />
              </svg>
              <span style={s.tgText}>Need help? Contact Support</span>
            </a>
            <p style={s.terms}>By connecting you agree to our Terms of Service</p>
          </div>

        </div>
      </div>
    </>
  )
}
