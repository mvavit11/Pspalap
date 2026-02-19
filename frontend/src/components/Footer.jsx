import React from 'react';
import './Footer.css';
export default function Footer() {
return (
<footer className="footer">
<div className="footer__inner">
<div className="footer__brand">
<span className="footer__logo">LaunchSol</span>
<span className="footer__tagline">SPL Token Creator on Solana</span>
</div>
<div className="footer__links">
<a href="https://solana.com" target="_blank" rel="noreferrer">Solana</a>
<a href="https://phantom.app" target="_blank" rel="noreferrer">Phantom</a>
</div>
<div className="footer__disclaimer">
Not financial or legal advice.
</div>
</div>
</footer>
);
}
