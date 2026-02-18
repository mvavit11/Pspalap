import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import PricingCards from './components/PricingCards.jsx';
import TokenForm from './components/TokenForm.jsx';
import RecentTokens from './components/RecentTokens.jsx';
import AuthorityInfo from './components/AuthorityInfo.jsx';
import Footer from './components/Footer.jsx';
import './App.css';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [createdToken, setCreatedToken] = useState(null);
  const [notification, setNotification] = useState(null);

  const notify = useCallback((msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }
      const resp = await window.solana.connect();
      setWallet(window.solana);
      setWalletAddress(resp.publicKey.toBase58());
      notify('Wallet connected!', 'success');
    } catch (err) {
      notify('Failed to connect wallet: ' + err.message, 'error');
    }
  }, [notify]);

  const disconnectWallet = useCallback(async () => {
    if (window.solana) await window.solana.disconnect();
    setWallet(null);
    setWalletAddress(null);
    setSelectedPackage(null);
    notify('Wallet disconnected', 'info');
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
      {/* Background grid */}
      <div className="bg-grid" />
      <div className="bg-glow" />

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
        {/* Hero */}
        <section className="hero animate-in">
          <div className="hero__tag">Solana Mainnet • SPL Token Standard</div>
          <h1 className="hero__title">
            Create Your<br />
            <span className="hero__title-accent">SPL Token</span>
          </h1>
          <p className="hero__sub">
            Launch a professional Solana token in minutes.<br />
            No coding required. Full authority control.
          </p>
        </section>

        {/* Pricing */}
        {!selectedPackage && (
          <section className="section animate-in" style={{ animationDelay: '0.1s' }}>
            <PricingCards onSelect={setSelectedPackage} />
          </section>
        )}

        {/* Token Form */}
        {selectedPackage && (
          <section className="section animate-in">
            <TokenForm
              selectedPackage={selectedPackage}
              wallet={wallet}
              walletAddress={walletAddress}
              onConnect={connectWallet}
              onTokenCreated={(token) => {
                setCreatedToken(token);
                setSelectedPackage(null);
                notify('Token created successfully!', 'success');
              }}
              onBack={() => setSelectedPackage(null)}
              onNotify={notify}
            />
          </section>
        )}

        {/* Created token result */}
        {createdToken && (
          <section className="section animate-in">
            <TokenResult token={createdToken} onDismiss={() => setCreatedToken(null)} />
          </section>
        )}

        {/* Authority info */}
        <section className="section animate-in" style={{ animationDelay: '0.2s' }}>
          <AuthorityInfo />
        </section>

        {/* Recent tokens */}
        <section className="section animate-in" style={{ animationDelay: '0.3s' }}>
          <RecentTokens />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function TokenResult({ token, onDismiss }) {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';
  const explorerBase = network === 'devnet'
    ? 'https://solscan.io'
    : 'https://solscan.io';
  const clusterParam = network === 'devnet' ? '?cluster=devnet' : '';

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
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(token.mint)}
              title="Copy"
            >⧉</button>
          </div>
        </div>

        {token.signature && (
          <div className="token-result__field">
            <label>Transaction</label>
            <div className="token-result__value mono">
              {token.signature.slice(0, 20)}...
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(token.signature)}
                title="Copy"
              >⧉</button>
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
        <a
          href={`${explorerBase}/token/${token.mint}${clusterParam}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn--accent"
        >
          View on Solscan ↗
        </a>
        {token.signature && (
          <a
            href={`${explorerBase}/tx/${token.signature}${clusterParam}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn--outline"
          >
            View Transaction ↗
          </a>
        )}
        <button className="btn btn--ghost" onClick={onDismiss}>
          Create Another
        </button>
      </div>
    </div>
  );
}
