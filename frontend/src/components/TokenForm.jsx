import React, { useState } from 'react';
import { apiGet, apiPost } from '../utils/api.js';
import { createSPLToken, sendPayment } from '../utils/solana.js';
import './TokenForm.css';

const STEPS = {
  FORM: 'form',
  PAYMENT: 'payment',
  PAYING: 'paying',
  CREATING: 'creating',
  DONE: 'done',
};

export default function TokenForm({
  selectedPackage,
  wallet,
  walletAddress,
  onConnect,
  onTokenCreated,
  onBack,
  onNotify,
}) {
  const [step, setStep] = useState(STEPS.FORM);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [paymentTx, setPaymentTx] = useState(null);
  const [createdToken, setCreatedToken] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000000,
    description: '',
    logoUrl: '',
    keepMintAuthority: false,
    keepFreezeAuthority: false,
  });

  const canKeepAuthorities = selectedPackage?.id === 'pro' || selectedPackage?.id === 'launch';

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateForm = () => {
    if (!form.name.trim()) return 'Token name is required';
    if (!form.symbol.trim()) return 'Token symbol is required';
    if (form.symbol.length > 10) return 'Symbol must be 10 chars or less';
    if (form.decimals < 0 || form.decimals > 9) return 'Decimals must be 0-9';
    if (form.supply <= 0) return 'Supply must be greater than 0';
    if (!walletAddress) return 'Please connect your wallet';
    return null;
  };

  const handleProceedToPayment = async () => {
    const err = validateForm();
    if (err) { setError(err); return; }
    setError('');
    setStep(STEPS.PAYMENT);
  };

  const handlePay = async () => {
    setError('');
    setStep(STEPS.PAYING);
    setStatus('Initiating payment session...');

    try {
      // Get platform wallet and create session
      const { address: platformWallet } = await apiGet('/api/platform-wallet');
      const session = await apiPost('/api/payment/initiate', {
        packageId: selectedPackage.id,
        userWallet: walletAddress,
      });

      setSessionId(session.sessionId);
      setStatus(`Please send ${selectedPackage.price} SOL to platform wallet...`);

      // Send payment via Phantom
      const txSig = await sendPayment({
        wallet,
        recipientAddress: platformWallet,
        amountSol: parseFloat(selectedPackage.price),
        onStatus: setStatus,
      });

      setPaymentTx(txSig);
      setStatus('Verifying payment on-chain...');

      // Verify payment on backend
      const verification = await apiPost('/api/payment/verify', {
        sessionId: session.sessionId,
        txSignature: txSig,
      });

      if (!verification.verified) {
        throw new Error('Payment verification failed');
      }

      setStatus('Payment verified! ✓ Creating your token...');
      setStep(STEPS.CREATING);

      // Now create the token
      const result = await createSPLToken({
        wallet,
        name: form.name,
        symbol: form.symbol,
        decimals: parseInt(form.decimals),
        supply: parseFloat(form.supply),
        packageId: selectedPackage.id,
        keepMintAuthority: canKeepAuthorities && form.keepMintAuthority,
        keepFreezeAuthority: canKeepAuthorities && form.keepFreezeAuthority,
        onStatus: setStatus,
      });

      // Register token on backend
      await apiPost('/api/tokens/register', {
        sessionId: session.sessionId,
        tokenMint: result.mint,
        tokenName: form.name,
        tokenSymbol: form.symbol,
        decimals: parseInt(form.decimals),
        supply: parseFloat(form.supply),
        userWallet: walletAddress,
        txSignature: result.signature,
        packageId: selectedPackage.id,
      });

      const tokenData = {
        ...result,
        name: form.name,
        symbol: form.symbol,
      };
      setCreatedToken(tokenData);
      setStep(STEPS.DONE);
      onTokenCreated(tokenData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred');
      setStep(STEPS.FORM);
      setStatus('');
    }
  };

  const network = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';
  const clusterParam = network === 'devnet' ? '?cluster=devnet' : '';

  return (
    <div className="token-form-wrapper">
      {/* Back + selected plan */}
      <div className="token-form__top">
        <button className="back-btn" onClick={onBack}>
          ← Back to plans
        </button>
        <div className="selected-plan" style={{ '--plan-accent': selectedPackage?.accent }}>
          <span>{selectedPackage?.icon}</span>
          <span>{selectedPackage?.tier} Plan</span>
          <span className="selected-plan__price">{selectedPackage?.price} SOL</span>
        </div>
      </div>

      {step === STEPS.FORM && (
        <div className="token-form animate-in">
          <h2 className="token-form__title">Configure Your Token</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Token Name *</label>
              <input
                type="text"
                placeholder="e.g. My Awesome Token"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                maxLength={32}
              />
            </div>

            <div className="form-group">
              <label>Token Symbol *</label>
              <input
                type="text"
                placeholder="e.g. MAT"
                value={form.symbol}
                onChange={e => updateForm('symbol', e.target.value.toUpperCase())}
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>Decimals</label>
              <input
                type="number"
                min={0}
                max={9}
                value={form.decimals}
                onChange={e => updateForm('decimals', e.target.value)}
              />
              <span className="form-hint">Standard: 9 (like SOL), 6 (like USDC)</span>
            </div>

            <div className="form-group">
              <label>Initial Supply</label>
              <input
                type="number"
                min={1}
                value={form.supply}
                onChange={e => updateForm('supply', e.target.value)}
              />
              <span className="form-hint">Total tokens to mint at creation</span>
            </div>

            <div className="form-group form-group--full">
              <label>Logo URL</label>
              <input
                type="url"
                placeholder="https://your-logo-url.com/logo.png"
                value={form.logoUrl}
                onChange={e => updateForm('logoUrl', e.target.value)}
              />
            </div>

            <div className="form-group form-group--full">
              <label>Description</label>
              <textarea
                placeholder="Describe your token..."
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          {/* Authority toggles */}
          <div className="authority-section">
            <h3>Authority Settings</h3>

            <div className={`authority-toggle ${!canKeepAuthorities ? 'authority-toggle--disabled' : ''}`}>
              <div className="authority-toggle__info">
                <div className="authority-toggle__title">
                  Keep Mint Authority
                  {!canKeepAuthorities && <span className="badge-lock">Pro+</span>}
                </div>
                <div className="authority-toggle__sub">
                  Allows minting more tokens after creation.
                  {!canKeepAuthorities && ' Auto-revoked in Starter (Safe Mode).'}
                </div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={canKeepAuthorities ? form.keepMintAuthority : false}
                  onChange={e => canKeepAuthorities && updateForm('keepMintAuthority', e.target.checked)}
                  disabled={!canKeepAuthorities}
                />
                <span className="toggle__slider" />
              </label>
            </div>

            <div className={`authority-toggle ${!canKeepAuthorities ? 'authority-toggle--disabled' : ''}`}>
              <div className="authority-toggle__info">
                <div className="authority-toggle__title">
                  Keep Freeze Authority
                  {!canKeepAuthorities && <span className="badge-lock">Pro+</span>}
                </div>
                <div className="authority-toggle__sub">
                  Allows freezing token accounts.
                  {!canKeepAuthorities && ' Auto-revoked in Starter (Safe Mode).'}
                </div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={canKeepAuthorities ? form.keepFreezeAuthority : false}
                  onChange={e => canKeepAuthorities && updateForm('keepFreezeAuthority', e.target.checked)}
                  disabled={!canKeepAuthorities}
                />
                <span className="toggle__slider" />
              </label>
            </div>

            {!canKeepAuthorities && (
              <div className="safe-mode-banner">
                <span>🔒</span>
                <span>Safe Mode: Both authorities will be automatically revoked after minting. Upgrade to Pro to control authorities.</span>
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          {!walletAddress ? (
            <button className="btn btn--accent btn--full" onClick={onConnect}>
              Connect Phantom to Continue
            </button>
          ) : (
            <button className="btn btn--accent btn--full" onClick={handleProceedToPayment}>
              Continue to Payment →
            </button>
          )}
        </div>
      )}

      {step === STEPS.PAYMENT && (
        <div className="payment-confirm animate-in">
          <h2>Confirm Payment</h2>

          <div className="payment-summary">
            <div className="payment-row">
              <span>Package</span>
              <span>{selectedPackage?.tier}</span>
            </div>
            <div className="payment-row">
              <span>Token Name</span>
              <span>{form.name} ({form.symbol})</span>
            </div>
            <div className="payment-row">
              <span>Supply</span>
              <span>{Number(form.supply).toLocaleString()}</span>
            </div>
            <div className="payment-row">
              <span>Decimals</span>
              <span>{form.decimals}</span>
            </div>
            {canKeepAuthorities && (
              <>
                <div className="payment-row">
                  <span>Mint Authority</span>
                  <span>{form.keepMintAuthority ? 'Retained' : 'Revoked'}</span>
                </div>
                <div className="payment-row">
                  <span>Freeze Authority</span>
                  <span>{form.keepFreezeAuthority ? 'Retained' : 'Revoked'}</span>
                </div>
              </>
            )}
            <div className="payment-row payment-row--total">
              <span>Total</span>
              <span>{selectedPackage?.price} SOL</span>
            </div>
          </div>

          <div className="payment-wallet-info">
            <span>Paying from:</span>
            <span className="mono">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}</span>
          </div>

          <div className="payment-actions">
            <button className="btn btn--ghost" onClick={() => setStep(STEPS.FORM)}>← Edit</button>
            <button className="btn btn--accent" onClick={handlePay}>
              Pay {selectedPackage?.price} SOL & Create Token
            </button>
          </div>
        </div>
      )}

      {(step === STEPS.PAYING || step === STEPS.CREATING) && (
        <div className="tx-progress animate-in">
          <div className="tx-progress__spinner">
            <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          </div>
          <div className="tx-progress__step">
            {step === STEPS.PAYING ? 'Processing Payment' : 'Creating Token'}
          </div>
          <div className="tx-progress__status">{status}</div>
          {paymentTx && (
            <a
              href={`https://solscan.io/tx/${paymentTx}${clusterParam}`}
              target="_blank"
              rel="noreferrer"
              className="tx-progress__link"
            >
              View payment on Solscan ↗
            </a>
          )}
          <div className="tx-progress__note">
            Do not close this window or refresh the page.
          </div>
        </div>
      )}
    </div>
  );
}
