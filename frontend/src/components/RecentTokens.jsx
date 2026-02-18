import React, { useState, useEffect } from 'react';
import { apiGet } from '../utils/api.js';
import './RecentTokens.css';

export default function RecentTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const network = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';
  const clusterParam = network === 'devnet' ? '?cluster=devnet' : '';

  useEffect(() => {
    const load = async () => {
      try {
        const { tokens } = await apiGet('/api/tokens/recent?limit=10');
        setTokens(tokens);
      } catch (e) {
        console.error('Failed to load recent tokens', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const packageBadge = (pkg) => {
    const map = { starter: { label: '🥉 Starter', color: '#e07a44' }, pro: { label: '🥈 Pro', color: '#aac8e8' }, launch: { label: '🥇 Launch', color: '#ffd166' } };
    return map[pkg] || { label: pkg, color: '#888' };
  };

  return (
    <div id="recent" className="recent-tokens">
      <div className="recent-tokens__header">
        <h2 className="recent-tokens__title">Recently Created Tokens</h2>
        <div className="recent-tokens__live">
          <div className="live-dot" />
          <span>Live</span>
        </div>
      </div>

      {loading ? (
        <div className="recent-tokens__loading">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      ) : tokens.length === 0 ? (
        <div className="recent-tokens__empty">
          <span>🪙</span>
          <span>No tokens created yet. Be the first!</span>
        </div>
      ) : (
        <div className="recent-tokens__list">
          {tokens.map(token => {
            const badge = packageBadge(token.packageId);
            return (
              <a
                key={token.id}
                href={`https://solscan.io/token/${token.mint}${clusterParam}`}
                target="_blank"
                rel="noreferrer"
                className="token-item"
              >
                <div className="token-item__symbol">{token.symbol.slice(0, 3)}</div>
                <div className="token-item__info">
                  <div className="token-item__name">{token.name}
                    <span className="token-item__sym">({token.symbol})</span>
                  </div>
                  <div className="token-item__meta">
                    <span className="token-item__mint mono">{token.mint.slice(0, 8)}...{token.mint.slice(-8)}</span>
                    <span className="token-item__time">{formatTime(token.createdAt)}</span>
                  </div>
                </div>
                <div className="token-item__right">
                  <span className="token-item__badge" style={{ color: badge.color }}>
                    {badge.label}
                  </span>
                  <span className="token-item__supply">
                    {Number(token.supply).toLocaleString()} supply
                  </span>
                </div>
                <span className="token-item__arrow">↗</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
