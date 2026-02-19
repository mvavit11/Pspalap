import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import Header from './components/Header.jsx';
import PricingCards from './components/PricingCards.jsx';
import TokenForm from './components/TokenForm.jsx';
import RecentTokens from './components/RecentTokens.jsx';
import AuthorityInfo from './components/AuthorityInfo.jsx';
import Footer from './components/Footer.jsx';
export default function Main() {
const { publicKey, disconnect, connected } = useWallet();
const { setVisible } = useWalletModal();
const [selectedPackage, setSelectedPackage] = useState(null);
const [createdToken, setCreatedToken] = useState(null);
const [notification, setNotification] = useState(null);
const walletAddress = publicKey ? publicKey.toBase58() : null;
const notify = useCallback((msg, type) => {
const t = type || 'info';
setNotification({ msg, type: t, id: Date.now() });
setTimeout(() => setNotification(null), 5000);
}, []);
const connectWallet = useCallback(() => {
setVisible(true);
}, [setVisible]);
const disconnectWallet = useCallback(async () => {
await disconnect();
setSelectedPackage(null);
notify('Wallet disconnected', 'info');
}, [disconnect, notify]);
return (
<div className="app">
<div className="bg-grid" />
<div className="bg-glow" />
<Header
walletAddress={walletAddress}
onConnect={connectWallet}
onDisconnect={disconnectWallet}
/>
{notification && (
<div className={'notification notification--' + notification.type} key={notification.
<span>{notification.msg}</span>
</div>
)}
<main className="main">
<section className="hero animate-in">
<div className="hero__tag">Solana Mainnet - SPL Token Standard</div>
<h1 className="hero__title">
Launch Your<br />
<span className="hero__title-accent">SPL Token</span>
</h1>
<p className="hero__sub">
No coding required. Full authority control. Live in minutes.
</p>
</section>
{!selectedPackage && !createdToken && (
<section className="section animate-in" id="plans">
<PricingCards onSelect={setSelectedPackage} />
</section>
)}
{selectedPackage && !createdToken && (
<section className="section animate-in" id="plans">
<TokenForm
selectedPackage={selectedPackage}
walletAddress={walletAddress}
onConnect={connectWallet}
onTokenCreated={(token) => {
setCreatedToken(token);
setSelectedPackage(null);
notify('Token created!', 'success');
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
<section className="section animate-in" id="authority">
<AuthorityInfo />
</section>
<section className="section animate-in" id="recent">
<RecentTokens />
</section>
</main>
<Footer />
</div>
);
}
function TokenResult({ token, onDismiss }) {
return (
<div className="token-result">
<div className="token-result__header">
<div className="token-result__icon">V</div>
<h2>Token Created!</h2>
</div>
<div className="token-result__fields">
<div className="token-result__field">
<label>Mint Address</label>
<div className="token-result__value mono">
{token.mint}
<button className="copy-btn" onClick={() => navigator.clipboard.writeText(token.m
</div>
</div>
{token.signature && (
<div className="token-result__field">
<label>Transaction</label>
<div className="token-result__value mono">
{token.signature.slice(0, 20)}...
<button className="copy-btn" onClick={() => navigator.clipboard.writeText(token
</div>
</div>
)}
<div className="token-result__field">
<label>Mint Authority</label>
<div className="token-result__value">
{token.mintAuthority
? <span className="badge badge--warn">Retained</span>
: <span className="badge badge--safe">Revoked</span>}
</div>
</div>
<div className="token-result__field">
<label>Freeze Authority</label>
<div className="token-result__value">
{token.freezeAuthority
? <span className="badge badge--warn">Retained</span>
: <span className="badge badge--safe">Revoked</span>}
</div>
</div>
</div>
<div className="token-result__actions">
<a href={'https://solscan.io/token/' + token.mint} target="_blank" rel="noreferrer" c
{token.signature && (
<a href={'https://solscan.io/tx/' + token.signature} target="_blank" rel="noreferre
)}
</div>
</div>
<button className="btn btn--ghost" onClick={onDismiss}>Create Another</button>
);
}
