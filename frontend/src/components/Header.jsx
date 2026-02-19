import React from 'react';
import './Header.css';
export default function Header({ walletAddress, onConnect, onDisconnect }) {
const short = walletAddress
? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4)
: null;
return (
<header className="header">
<div className="header__inner">
<div className="header__logo">
<div className="header__logo-icon">o</div>
<span className="header__logo-text">LaunchSol</span>
</div>
<nav className="header__nav">
<a href="#plans" className="header__nav-link">Create</a>
<a href="#authority" className="header__nav-link">Learn</a>
<a href="#recent" className="header__nav-link">Recent</a>
</nav>
<div className="header__wallet">
{walletAddress ? (
<div className="wallet-info">
<div className="wallet-dot" />
<span className="wallet-addr">{short}</span>
<button className="wallet-disconnect" onClick={onDisconnect}>x</button>
</div>
) : (
<button className="btn-connect" onClick={onConnect}>
Connect Phantom
</button>
)}
</div>
</div>
</header>
);
}
