require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} = require('@solana/web3.js');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── In-memory storage ────────────────────────────────────────────────────────
const recentTokens = [];
const transactionLogs = [];
const pendingPayments = new Map(); // sessionId -> { package, amount, timestamp }

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Solana Connection ────────────────────────────────────────────────────────
const getRpcUrl = () => {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL;
  const network = process.env.SOLANA_NETWORK || 'mainnet-beta';
  return clusterApiUrl(network);
};

const connection = new Connection(getRpcUrl(), 'confirmed');

// ─── Package Prices ───────────────────────────────────────────────────────────
const PACKAGES = {
  starter: {
    name: 'Starter',
    price: 0.25,
    lamports: 0.25 * LAMPORTS_PER_SOL,
  },
  pro: {
    name: 'Pro',
    price: 0.45,
    lamports: 0.45 * LAMPORTS_PER_SOL,
  },
  launch: {
    name: 'Launch',
    price: 0.85,
    lamports: 0.85 * LAMPORTS_PER_SOL,
  },
};

// ─── Helper: log transaction ──────────────────────────────────────────────────
function logTransaction(type, data) {
  const entry = {
    id: uuidv4(),
    type,
    timestamp: new Date().toISOString(),
    ...data,
  };
  transactionLogs.unshift(entry);
  if (transactionLogs.length > 500) transactionLogs.pop();
  console.log(`[TX LOG] ${type}:`, JSON.stringify(entry, null, 2));
  return entry;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', network: process.env.SOLANA_NETWORK || 'mainnet-beta' });
});

// Get package info
app.get('/api/packages', (req, res) => {
  res.json({ packages: PACKAGES });
});

// Get platform wallet address
app.get('/api/platform-wallet', (req, res) => {
  const address = process.env.PLATFORM_WALLET_ADDRESS;
  if (!address) {
    return res.status(500).json({ error: 'Platform wallet not configured' });
  }
  res.json({ address });
});

// Initiate payment session
app.post('/api/payment/initiate', (req, res) => {
  const { packageId, userWallet } = req.body;

  if (!packageId || !PACKAGES[packageId]) {
    return res.status(400).json({ error: 'Invalid package ID' });
  }
  if (!userWallet) {
    return res.status(400).json({ error: 'User wallet address required' });
  }

  // Validate wallet address
  try {
    new PublicKey(userWallet);
  } catch {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const sessionId = uuidv4();
  const pkg = PACKAGES[packageId];

  pendingPayments.set(sessionId, {
    packageId,
    packageName: pkg.name,
    amount: pkg.lamports,
    amountSol: pkg.price,
    userWallet,
    timestamp: Date.now(),
    verified: false,
  });

  // Clean expired sessions (older than 30 mins)
  for (const [id, data] of pendingPayments.entries()) {
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      pendingPayments.delete(id);
    }
  }

  res.json({
    sessionId,
    platformWallet: process.env.PLATFORM_WALLET_ADDRESS,
    amount: pkg.price,
    amountLamports: pkg.lamports,
    package: pkg.name,
  });
});

// Verify payment transaction
app.post('/api/payment/verify', async (req, res) => {
  const { sessionId, txSignature } = req.body;

  if (!sessionId || !txSignature) {
    return res.status(400).json({ error: 'sessionId and txSignature required' });
  }

  const session = pendingPayments.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Payment session not found or expired' });
  }

  if (session.verified) {
    return res.json({ verified: true, sessionId });
  }

  try {
    // Fetch transaction from chain
    const tx = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found on chain. Please wait a moment and try again.' });
    }

    if (tx.meta?.err) {
      return res.status(400).json({ error: 'Transaction failed on chain' });
    }

    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
    if (!platformWallet) {
      return res.status(500).json({ error: 'Platform wallet not configured' });
    }

    // Verify recipient and amount
    const accountKeys = tx.transaction.message.staticAccountKeys ||
      tx.transaction.message.accountKeys;

    const platformPubkey = new PublicKey(platformWallet);
    let platformIndex = -1;

    for (let i = 0; i < accountKeys.length; i++) {
      const key = accountKeys[i];
      const keyStr = key.toBase58 ? key.toBase58() : key.toString();
      if (keyStr === platformWallet) {
        platformIndex = i;
        break;
      }
    }

    if (platformIndex === -1) {
      logTransaction('PAYMENT_VERIFY_FAIL', {
        sessionId,
        txSignature,
        reason: 'Platform wallet not found in transaction',
      });
      return res.status(400).json({ error: 'Payment not sent to platform wallet' });
    }

    const preBalance = tx.meta.preBalances[platformIndex];
    const postBalance = tx.meta.postBalances[platformIndex];
    const received = postBalance - preBalance;

    // Allow 5000 lamport tolerance for fees
    const tolerance = 5000;
    if (received < session.amount - tolerance) {
      logTransaction('PAYMENT_VERIFY_FAIL', {
        sessionId,
        txSignature,
        expected: session.amount,
        received,
        reason: 'Insufficient amount',
      });
      return res.status(400).json({
        error: `Insufficient payment. Expected ${session.amountSol} SOL, received ${received / LAMPORTS_PER_SOL} SOL`,
      });
    }

    // Payment verified!
    session.verified = true;
    session.txSignature = txSignature;
    pendingPayments.set(sessionId, session);

    logTransaction('PAYMENT_VERIFIED', {
      sessionId,
      txSignature,
      packageId: session.packageId,
      userWallet: session.userWallet,
      amount: session.amountSol,
    });

    res.json({
      verified: true,
      sessionId,
      package: session.packageName,
      txSignature,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    logTransaction('PAYMENT_VERIFY_ERROR', {
      sessionId,
      txSignature,
      error: err.message,
    });
    res.status(500).json({ error: 'Failed to verify transaction: ' + err.message });
  }
});

// Check payment session status
app.get('/api/payment/status/:sessionId', (req, res) => {
  const session = pendingPayments.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ verified: session.verified, packageId: session.packageId });
});

// Register created token (called after frontend completes token creation)
app.post('/api/tokens/register', (req, res) => {
  const { sessionId, tokenMint, tokenName, tokenSymbol, decimals, supply, userWallet, txSignature, packageId } = req.body;

  if (!sessionId || !tokenMint) {
    return res.status(400).json({ error: 'sessionId and tokenMint required' });
  }

  const session = pendingPayments.get(sessionId);
  if (!session || !session.verified) {
    return res.status(403).json({ error: 'Payment not verified for this session' });
  }

  // Validate mint address
  try {
    new PublicKey(tokenMint);
  } catch {
    return res.status(400).json({ error: 'Invalid token mint address' });
  }

  const tokenEntry = {
    id: uuidv4(),
    mint: tokenMint,
    name: tokenName || 'Unknown',
    symbol: tokenSymbol || '???',
    decimals: decimals ?? 9,
    supply: supply || 0,
    creator: userWallet,
    txSignature,
    packageId: session.packageId,
    createdAt: new Date().toISOString(),
  };

  recentTokens.unshift(tokenEntry);
  if (recentTokens.length > 50) recentTokens.pop();

  logTransaction('TOKEN_CREATED', tokenEntry);

  // Invalidate session
  pendingPayments.delete(sessionId);

  res.json({ success: true, token: tokenEntry });
});

// Get recent tokens (public)
app.get('/api/tokens/recent', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  res.json({ tokens: recentTokens.slice(0, limit) });
});

// Get transaction logs (could be protected in production)
app.get('/api/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  res.json({ logs: transactionLogs.slice(0, limit) });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Solana Token Creator Backend running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.SOLANA_NETWORK || 'mainnet-beta'}`);
  console.log(`💳 Platform wallet: ${process.env.PLATFORM_WALLET_ADDRESS || 'NOT SET'}\n`);
});
