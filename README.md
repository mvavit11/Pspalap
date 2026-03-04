# SolLaunch — Solana Token Launcher

Production-ready SaaS for launching Solana SPL tokens with atomic fee transactions.

---

## Project Structure

```
solana-token-launcher/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CountdownTimer.jsx    # Promo timer (-20% today)
│   │   ├── Header.jsx            # Nav + wallet button + token counter
│   │   ├── LaunchButton.jsx      # Launch CTA with status states
│   │   ├── PlanSelector.jsx      # 3-plan picker (Basic/Safe/Trusted)
│   │   ├── TokenForm.jsx         # Token config form
│   │   ├── WalletButton.jsx      # Custom wallet connect button
│   │   └── WalletModal.jsx       # Phantom/Solflare selector modal
│   ├── context/
│   │   └── TokenCountContext.jsx # Global token counter with local storage
│   ├── hooks/
│   │   └── useWalletModal.js     # Wallet modal hook
│   ├── pages/
│   │   ├── HomePage.jsx          # Main launch page
│   │   └── SuccessPage.jsx       # Post-launch success + Solscan links
│   ├── utils/
│   │   └── tokenLauncher.js      # Core: create token + atomic fee logic
│   ├── App.jsx                   # Providers + Router
│   ├── index.css                 # Tailwind + custom styles
│   └── main.jsx                  # Entry point
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Network: mainnet-beta | devnet
VITE_SOLANA_NETWORK=devnet

# RPC endpoint — use a paid provider for mainnet (Helius, QuickNode, Triton)
VITE_RPC_ENDPOINT=https://api.devnet.solana.com

# Your wallet that receives fees
VITE_FEE_WALLET=YourWalletPublicKeyHere

# Prices in SOL
VITE_PRICE_BASIC=0.3
VITE_PRICE_SAFE=0.8
VITE_PRICE_TRUSTED=1.5
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

---

## Deploy on Vercel (Recommended)

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars
vercel env add VITE_SOLANA_NETWORK
vercel env add VITE_RPC_ENDPOINT
vercel env add VITE_FEE_WALLET
vercel env add VITE_PRICE_BASIC
vercel env add VITE_PRICE_SAFE
vercel env add VITE_PRICE_TRUSTED

# Deploy to production
vercel --prod
```

### Method 2: GitHub + Vercel Dashboard

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Framework: **Vite** (auto-detected)
5. Add Environment Variables in the UI
6. Click **Deploy**

The `vercel.json` is already configured with SPA routing and security headers.

---

## Deploy on Railway

Railway is ideal if you want server-side features later (e.g., metadata API).

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

**Railway Dashboard steps:**
1. New Project → Deploy from GitHub Repo
2. Set Build Command: `npm run build`
3. Set Start Command: `npx serve dist -p $PORT`
4. Add environment variables in Settings → Variables
5. Add domain in Settings → Networking

**Note:** Railway needs a static file server. Install `serve`:
```bash
npm install -D serve
```

Add to `package.json`:
```json
"scripts": {
  "start": "serve dist -p 3000"
}
```

---

## Mainnet Launch Checklist

- [ ] Set `VITE_SOLANA_NETWORK=mainnet-beta`
- [ ] Use a paid RPC (Helius recommended): `https://rpc.helius.xyz/?api-key=YOUR_KEY`
- [ ] Set your real fee wallet in `VITE_FEE_WALLET`
- [ ] Test all 3 plans on devnet first
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Add custom domain + SSL

---

## Business Model

| Plan | Price | Features |
|------|-------|---------|
| LAUNCH BASIC | 0.3 SOL | Token creation, authorities retained |
| SAFE LAUNCH | 0.8 SOL | Custom decimals, optional revoke authorities |
| TRUSTED LAUNCH | 1.5 SOL | Auto-revoke, immutable metadata, ownership renounced |

All fees are sent atomically with token creation — if the fee fails, the token is not created.

---

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** (custom dark Web3 theme)
- **@solana/web3.js** — Blockchain interaction
- **@solana/spl-token** — Token creation
- **@solana/wallet-adapter-react** — Wallet integration
- **react-router-dom** — SPA routing

## Supported Wallets

- Phantom
- Solflare

---

## Security Notes

- Private keys are NEVER exposed — all signing is done in user wallets
- Fee and token creation are in ONE atomic transaction
- Vite env vars are build-time only (`VITE_` prefix)
- Never commit `.env` to git
