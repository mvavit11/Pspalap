import React from ‘react’;
import ‘./Footer.css’;

export default function Footer() {
return (
<footer className="footer">
<div className="footer__inner">
<div className="footer__brand">
<span className="footer__logo">◎ CreateToken</span>
<span className="footer__tag">SPL Token Creator on Solana</span>
</div>
<div className="footer__links">
<a href="https://solana.com" target="_blank" rel="noreferrer">Solana</a>
<a href="https://spl.solana.com/token" target="_blank" rel="noreferrer">SPL Docs</a>
<a href="https://phantom.app" target="_blank" rel="noreferrer">Phantom</a>
</div>
<p className="footer__disc">
This tool is provided as-is. You are solely responsible for your token and its usage. Not financial or legal advice.
</p>
</div>
</footer>
);
}
