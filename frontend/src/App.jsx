import React, { useState, useEffect, useCallback } from 'react';
import Header from ‘./components/Header.jsx’;
import PricingCards from ‘./components/PricingCards.jsx’;
import TokenForm from ‘./components/TokenForm.jsx’;
import RecentTokens from ‘./components/RecentTokens.jsx’;
import AuthorityInfo from ‘./components/AuthorityInfo.jsx’;
import Footer from ‘./components/Footer.jsx’;
import ‘./App.css’;

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isInPhantom = () => window.solana?.isPhantom;

export default function App() {
const [wallet, setWallet] = useState(null);
const [walletAddress, setWalletAddress] = useState(null);
const [selectedPackage, setSelectedPackage] = useState(null);
const [createdToken, setCreatedToken] = useState(null);
const [notification, setNotification] = useState(null);
const [showBanner, setShowBanner] = useState(true);

const notify = useCallback((msg, type = ‘info’) => {
setNotification({ msg, type, id: Date.now() });
setTimeout(() => setNotification(null), 5000);
}, []);

const connectWallet = useCallback(async () => {
try {
if (!window.solana?.isPhantom) {
if (isMobile()) {
notify(‘Open this site inside Phantom app browser 👻’, ‘info’);
} else {
window.open(‘https://phantom.app/’, ‘_blank’);
notify(‘Please install Phantom wallet extension’, ‘info’);
}
return;
}
const resp = await window.solana.connect();
setWallet(window.solana);
setWalletAddress(resp.publicKey.toBase58());
notify(‘Wallet connected! ✓’, ‘success’);
} catch (err) {
if (err.code === 4001) {
notify(‘Connection rejected’, ‘error’);
} else {
notify(’Failed to connect: ’ + err.message, ‘error’);
}
}
}, [notify]);

const disconnectWallet = useCallback(async () => {
if (window.solana) await window.solana.disconnect();
setWallet(null);
setWalletAddress(null);
setSelectedPackage(null);
notify(‘Wallet disconnected’, ‘info’);
}, [notify]);

useEffect(() => {
if (window.solana?.isPhantom) {
window.solana.connect({ onlyIfTrusted: true })
.then(resp => {
setWallet(window.solana);
setWalletAddress(resp.publicKey.toBase58());
})
.catch(() => {});
}
}, []);

const mobile = isMobile();
const inPhantom = isInPhantom();
const siteUrl = typeof window !== ‘undefined’ ? window.location.host : ‘pspalap.vercel.app’;

return (
<div className="app">
<div className="bg-grid" />
<div className="bg-glow" />

```
  <Header
    walletAddress={walletAddress}
    onConnect={connectWallet}
    onDisconnect={disconnectWallet}
  />

  {/* Mobile Phantom banner — only show on mobile when NOT in Phantom */}
  {mobile && !inPhantom && showBanner && (
    <div className="phantom-banner">
      <span className="phantom-banner__icon">👻</span>
      <div className="phantom-banner__text">
        <strong>Using mobile?</strong> Open <span className="phantom-banner__url">{siteUrl}</span> inside the <strong>Phantom app browser</strong> to connect your wallet.
      </div>
      <button className="phantom-banner__close" onClick={() => setShowBanner(false)}>×</button>
    </div>
  )}

  {notification && (
    <div className={`notification notification--${notification.type}`} key={notification.id}>
      <span>{notification.msg}</span>
    </div>
  )}

  <main className="main">
    <section className="hero animate-in">
      <div className="hero__tag">Solana Mainnet · SPL Token Standard</div>
      <h1 className="hero__title">
        Launch Your<br />
        <span className="hero__title-accent">SPL Token</span>
      </h1>
      <p className="hero__sub">
        No coding required. Full authority control. Live in minutes.
      </p>
    </section>

    {!selectedPackage && !createdToken && (
      <section className="section animate-in" id="plans" style={{ animationDelay: '0.1s' }}>
        <PricingCards onSelect={setSelectedPackage} />
      </section>
    )}

    {selectedPackage && !createdToken && (
      <section className="section animate-in" id="plans">
        <TokenForm
          selectedPackage={selectedPackage}
          wallet={wallet}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onTokenCreated={(token) => {
            setCreatedToken(token);
            setSelectedPackage(null);
            notify('Token created! 🎉', 'success');
          }}
          onBack={() => setSelectedPackage(null)}
          onNotify={notify}
        />
      </section>
    )}

    {createdToken && (
      <section className="section animate-in">
        <TokenResult token={createdToken} onDismiss={() => setCreatedToken(null)} />
      </section>
    )}

    <section className="section animate-in" id="authority" style={{ animationDelay: '0.15s' }}>
      <AuthorityInfo />
    </section>

    <section className="section animate-in" id="recent" style={{ animationDelay: '0.2s' }}>
      <RecentTokens />
    </section>
  </main>

  <Footer />
</div>
```

);
}

function TokenResult({ token, onDismiss }) {
return (
<div className="token-result">
<div className="token-result__header">
<div className="token-result__icon">✓</div>
<h2>Token Created!</h2>
</div>
<div className="token-result__fields">
<div className="token-result__field">
<label>Mint Address</label>
<div className="token-result__value mono">
{token.mint}
<button className=“copy-btn” onClick={() => navigator.clipboard.writeText(token.mint)}>⧉</button>
</div>
</div>
{token.signature && (
<div className="token-result__field">
<label>Transaction</label>
<div className="token-result__value mono">
{token.signature.slice(0, 20)}…
<button className=“copy-btn” onClick={() => navigator.clipboard.writeText(token.signature)}>⧉</button>
</div>
</div>
)}
<div className="token-result__field">
<label>Mint Authority</label>
<div className="token-result__value">
{token.mintAuthority ? <span className="badge badge--warn">Retained</span> : <span className="badge badge--safe">Revoked ✓</span>}
</div>
</div>
<div className="token-result__field">
<label>Freeze Authority</label>
<div className="token-result__value">
{token.freezeAuthority ? <span className="badge badge--warn">Retained</span> : <span className="badge badge--safe">Revoked ✓</span>}
</div>
</div>
</div>
<div className="token-result__actions">
<a href={`https://solscan.io/token/${token.mint}`} target=”_blank” rel=“noreferrer” className=“btn btn–accent”>View on Solscan ↗</a>
{token.signature && (
<a href={`https://solscan.io/tx/${token.signature}`} target=”_blank” rel=“noreferrer” className=“btn btn–outline”>Transaction ↗</a>
)}
<button className="btn btn--ghost" onClick={onDismiss}>Create Another</button>
</div>
</div>
);
}
