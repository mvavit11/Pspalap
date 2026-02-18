import React, { useState } from 'react';
import './AuthorityInfo.css';

export default function AuthorityInfo() {
  const [open, setOpen] = useState(null);

  const items = [
    {
      id: 'mint',
      icon: '🪙',
      title: 'Mint Authority',
      color: '#ffd166',
      short: 'Controls the ability to create new tokens.',
      long: `The Mint Authority is the entity that controls whether additional tokens can be minted (created) after the token's initial supply is established. If you keep the Mint Authority, you can create more tokens at any time, which can affect the total supply and potentially the token's value. If you revoke it, the supply is forever fixed — this is often seen as a trust signal by investors and the community. In Starter Plan (Safe Mode), mint authority is always revoked automatically.`,
    },
    {
      id: 'freeze',
      icon: '❄️',
      title: 'Freeze Authority',
      color: '#aac8e8',
      short: 'Controls the ability to freeze token accounts.',
      long: `The Freeze Authority allows the holder to freeze any token account, preventing it from transferring tokens. This can be used for compliance purposes (e.g., regulated assets), but it also means the authority holder can restrict anyone from moving their tokens. Projects seeking maximum decentralization and community trust typically revoke this authority. In Starter Plan, freeze authority is always revoked automatically for user safety.`,
    },
    {
      id: 'disclaimer',
      icon: '⚠️',
      title: 'User Responsibility',
      color: '#ff3d71',
      short: 'You are solely responsible for using this tool.',
      long: `SolForge is a technical tool that facilitates SPL token creation on the Solana blockchain. By using this platform, you acknowledge that: (1) You are solely responsible for how you use your token and any activities related to it. (2) Creating a token does not guarantee its value, liquidity, or legal status in your jurisdiction. (3) You must comply with all applicable laws and regulations. (4) This tool does not provide financial, legal, or investment advice. (5) Smart contract interactions are irreversible on the blockchain. Use this tool responsibly.`,
    },
  ];

  return (
    <div id="authority" className="authority-info">
      <h2 className="authority-info__title">Understanding Token Authorities</h2>
      <div className="authority-info__grid">
        {items.map(item => (
          <div
            key={item.id}
            className={`authority-card ${open === item.id ? 'authority-card--open' : ''}`}
            style={{ '--card-color': item.color }}
          >
            <div className="authority-card__header" onClick={() => setOpen(open === item.id ? null : item.id)}>
              <div className="authority-card__icon">{item.icon}</div>
              <div className="authority-card__text">
                <div className="authority-card__name">{item.title}</div>
                <div className="authority-card__short">{item.short}</div>
              </div>
              <div className="authority-card__arrow">{open === item.id ? '▲' : '▼'}</div>
            </div>
            {open === item.id && (
              <div className="authority-card__body">
                {item.long}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
