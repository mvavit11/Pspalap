import React from 'react';
import './Header.css';

export default function Header({ walletAddress, onConnect, onDisconnect }) {
  const short = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo">
          <div className="header__logo-icon">⬡</div>
          <span className="header__logo-text">SolForge</span>
        </div>

        <nav className="header__nav">
          <a href="#" className="header__nav-link">Create</a>
          <a href="#authority" className="header__nav-link">Learn</a>
          <a href="#recent" className="header__nav-link">Recent</a>
        </nav>

        <div className="header__wallet">
          {walletAddress ? (
            <div className="wallet-info">
              <div className="wallet-dot" />
              <span className="wallet-addr">{short}</span>
              <button className="wallet-disconnect" onClick={onDisconnect} title="Disconnect">×</button>
            </div>
          ) : (
            <button className="btn-connect" onClick={onConnect}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Connect Phantom
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
