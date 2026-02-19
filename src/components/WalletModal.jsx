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
return <img src={wallet.adapter.icon} style={{ width: 32, height: 32, borderRadius: 8 }
}
return (
<div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(153,69,255,0.2)
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
<div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255
</div>
{/* Header */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-betwe
<div>
<h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.
<p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontF
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
<p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'upp
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
{detectedWallets.map((wallet) => (
<button
key={wallet.adapter.name}
onClick={() => handleSelect(wallet.adapter.name)}
disabled={connecting}
style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16,
>
{getWalletIcon(wallet)}
<span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{wallet.
<span style={{ marginLeft: 'auto', fontSize: 12, color: '#14F195', font
</button>
))}
</div>
</div>
)}
{/* Not detected */}
{notDetected.length > 0 && (
<div>
{detectedWallets.length > 0 && (
<p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'u
)}
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
{notDetected.slice(0, 3).map((wallet) => (
<button
key={wallet.adapter.name}
onClick={() => handleSelect(wallet.adapter.name)}
style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16,
>
{getWalletIcon(wallet)}
<span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontSiz
<span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,2
</button>
))}
</div>
</div>
)}
{/* Footer */}
<div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 20, paddi
<a
href={"https://t.me/" + TELEGRAM_USERNAME}
target="_blank"
rel="noopener noreferrer"
style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap
>
<svg style={{ width: 16, height: 16, fill: '#229ED9', flexShrink: 0 }} <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0
viewBo
</svg>
</a>
<span style={{ color: '#229ED9', fontSize: 14, fontWeight: 500 }}>Need help?
<p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center',
By connecting you agree to our Terms of Service
</p>
</div>
</div>
</div>
</div>
</>
)
}
