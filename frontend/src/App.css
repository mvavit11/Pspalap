import React, { useState, useEffect, useCallback } from ‘react’;
import Header from ‘./components/Header.jsx’;
import PricingCards from ‘./components/PricingCards.jsx’;
import TokenForm from ‘./components/TokenForm.jsx’;
import RecentTokens from ‘./components/RecentTokens.jsx’;
import AuthorityInfo from ‘./components/AuthorityInfo.jsx’;
import Footer from ‘./components/Footer.jsx’;
import ‘./App.css’;

// Detect mobile browser
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function App() {
const [wallet, setWallet] = useState(null);
const [walletAddress, setWalletAddress] = useState(null);
const [selectedPackage, setSelectedPackage] = useState(null);
const [createdToken, setCreatedToken] = useState(null);
const [notification, setNotification] = useState(null);

const notify = useCallback((msg, type = ‘info’) => {
setNotification({ msg, type, id: Date.now() });
setTimeout(() => setNotification(null), 5000);
}, []);

const connectWallet = useCallback(async () => {
try {
// Mobile: open Phantom app via deeplink
if (isMobile()) {
if (!window.solana?.isPhantom) {
// Open current page inside Phantom browser
const currentUrl = encodeURIComponent(window.location.href);
window.location.href = `https://phantom.app/ul/browse/${currentUrl}?ref=${encodeURIComponent(window.location.origin)}`;
return;
}
} else {
// Desktop: redirect to install if not found
if (!window.solana?.isPhantom) {
window.open(‘https://phantom.app/’, ‘_blank’);
notify(‘Please install Phantom wallet extension’, ‘info’);
return;
}
}

```
  const resp = await window.solana.connect();
  setWallet(window.solana);
  setWalletAddress(resp.publicKey.toBase58());
  notify('Wallet connected!', 'success');
} catch (err) {
  if (err.code === 4001) {
    notify('Connection rejected by user', 'error');
  } else {
    notify('Failed to connect: ' + err.message, 'error');
  }
}
```

}, [notify]);

const disconnectWallet = useCallback(async () => {
if (window.solana) await window.solana.disconnect();
setWallet(null);
setWalletAddress(null);
setSelectedPackage(null);
notify(‘Wallet disconnected’, ‘info’);
}, [notify]);

// Auto-connect if previously connected
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

  {notification && (
    <div className={`notification notification--${notification.type}`} key={notification.id}>
      <span>{notification.msg}</span>
    </div>
  )}

  <main className="main">
    {/* Hero — compact */}
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

    {/* Pricing — always visible */}
    {!selectedPackage && !createdToken && (
      <section className="section animate-in" id="plans" style={{ animationDelay: '0.1s' }}>
        <PricingCards onSelect={setSelectedPackage} />
      </section>
    )}

    {/* Token Form */}
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
            notify('Token created successfully! 🎉', 'success');
          }}
          onBack={() => setSelectedPackage(null)}
          onNotify={notify}
        />
      </section>
    )}

    {/* Result */}
    {createdToken && (
      <section className="section animate-in">
        <TokenResult token={createdToken} onDismiss={() => setCreatedToken(null)} />
      </section>
    )}

    {/* Authority info */}
    <section className="section animate-in" id="authority" style={{ animationDelay: '0.15s' }}>
      <AuthorityInfo />
    </section>

    {/* Recent tokens */}
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

```
  <div className="token-result__fields">
    <div className="token-result__field">
      <label>Mint Address</label>
      <div className="token-result__value mono">
        {token.mint}
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(token.mint)}>⧉</button>
      </div>
    </div>

    {token.signature && (
      <div className="token-result__field">
        <label>Transaction</label>
        <div className="token-result__value mono">
          {token.signature.slice(0, 20)}...
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(token.signature)}>⧉</button>
        </div>
      </div>
    )}

    <div className="token-result__field">
      <label>Mint Authority</label>
      <div className="token-result__value">
        {token.mintAuthority
          ? <span className="badge badge--warn">Retained</span>
          : <span className="badge badge--safe">Revoked ✓</span>}
      </div>
    </div>

    <div className="token-result__field">
      <label>Freeze Authority</label>
      <div className="token-result__value">
        {token.freezeAuthority
          ? <span className="badge badge--warn">Retained</span>
          : <span className="badge badge--safe">Revoked ✓</span>}
      </div>
    </div>
  </div>

  <div className="token-result__actions">
    <a href={`https://solscan.io/token/${token.mint}`} target="_blank" rel="noreferrer" className="btn btn--accent">
      View on Solscan ↗
    </a>
    {token.signature && (
      <a href={`https://solscan.io/tx/${token.signature}`} target="_blank" rel="noreferrer" className="btn btn--outline">
        Transaction ↗
      </a>
    )}
    <button className="btn btn--ghost" onClick={onDismiss}>Create Another</button>
  </div>
</div>
```

);
}
