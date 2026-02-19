import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import Header from '../components/Header.jsx'
import PlanSelector from '../components/PlanSelector.jsx'
import TokenForm from '../components/TokenForm.jsx'
import LaunchButton from '../components/LaunchButton.jsx'
import CountdownTimer from '../components/CountdownTimer.jsx'
import WalletModal from '../components/WalletModal.jsx'
import { createToken, PLAN_CONFIG } from '../utils/tokenLauncher.js'
import { useTokenCount } from '../context/TokenCountContext.jsx'

const DEFAULT_FORM = {
  name: '',
  symbol: '',
  description: '',
  supply: '1000000000',
  decimals: '9',
  image: '',
  revokeMint: false,
  revokeFreeze: false,
}

const STATUS_MAP = {
  'Preparing transaction...': 'preparing',
  'Please approve in your wallet...': 'approving',
  'Sending transaction...': 'sending',
  'Confirming transaction...': 'confirming',
}

export default function HomePage() {
  const [plan, setPlan] = useState('safe')
  const [form, setForm] = useState(DEFAULT_FORM)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  // Флаг: пользователь нажал Launch, но кошелёк ещё не подключён
  const [pendingLaunch, setPendingLaunch] = useState(false)

  const navigate = useNavigate()
  const { connection } = useConnection()

  // ✅ Деструктурируем каждое поле отдельно — это обеспечивает правильный ре-рендер
  const { connected, publicKey, sendTransaction, signTransaction, wallet, connecting } = useWallet()
  const walletAdapter = useWallet() // полный объект нужен для createToken

  const { increment } = useTokenCount()

  const planConfig = PLAN_CONFIG[plan]

  const handleStatus = (msg) => {
    setStatus(STATUS_MAP[msg] || 'preparing')
  }

  const validate = () => {
    if (!form.name.trim()) return 'Token name is required'
    if (!form.symbol.trim()) return 'Token symbol is required'
    if (!form.supply || parseFloat(form.supply) <= 0) return 'Valid supply is required'
    return null
  }

  const executeLaunch = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setStatus('preparing')

    try {
      const result = await createToken({
        connection,
        wallet: walletAdapter,
        plan,
        tokenConfig: form,
        onStatus: handleStatus,
      })

      increment()
      setStatus('success')

      setTimeout(() => {
        navigate('/success', { state: result })
      }, 800)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setError(err.message || 'Transaction failed. Please try again.')
    }
  }

  // ✅ Если был pendingLaunch и кошелёк подключился — автоматически запускаем
  useEffect(() => {
    if (pendingLaunch && connected && publicKey) {
      setPendingLaunch(false)
      executeLaunch()
    }
  }, [connected, publicKey, pendingLaunch])

  const handleLaunch = async () => {
    if (!connected) {
      setPendingLaunch(true)
      setShowWalletModal(true)
      return
    }

    await executeLaunch()
  }

  // ✅ Если модалка закрыта без подключения — сбрасываем pendingLaunch
  const handleCloseModal = () => {
    setShowWalletModal(false)
    if (!connected) {
      setPendingLaunch(false)
    }
  }

  const isLoading = ['preparing', 'approving', 'sending', 'confirming'].includes(status)
  // ✅ Кнопка задизейблена только во время активной транзакции, НЕ из-за connected
  const isDisabled = isLoading

  return (
    <div className="min-h-screen bg-dark-50 bg-grid-pattern noise-bg">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <CountdownTimer />

          <h1 className="font-display text-6xl sm:text-8xl text-white mt-6 mb-4 leading-none tracking-widest">
            LAUNCH YOUR<br />
            <span className="text-gradient">SOLANA TOKEN</span>
          </h1>
          <p className="text-white/40 text-lg font-body max-w-xl mx-auto">
            Create and deploy your SPL token in under 60 seconds.
            Atomic transactions — fee + token creation in one click.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {['⚡ Instant Deploy', '🔒 Atomic TX', '✓ Non-custodial', '📊 12,800+ Tokens Launched'].map((badge) => (
              <span key={badge} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs font-mono">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Form */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Step 1: Choose Plan */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-primary text-dark-50 text-sm font-bold flex items-center justify-center">1</div>
              <h2 className="font-display text-xl text-white tracking-wider">CHOOSE PLAN</h2>
            </div>
            <PlanSelector selected={plan} onChange={setPlan} />
          </div>

          {/* Step 2: Token Details */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-primary text-dark-50 text-sm font-bold flex items-center justify-center">2</div>
              <h2 className="font-display text-xl text-white tracking-wider">TOKEN DETAILS</h2>
            </div>
            <TokenForm plan={plan} values={form} onChange={setForm} />
          </div>

          {/* Step 3: Launch */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-full bg-primary text-dark-50 text-sm font-bold flex items-center justify-center">3</div>
              <h2 className="font-display text-xl text-white tracking-wider">LAUNCH</h2>
            </div>

            {/* Summary */}
            <div className="bg-dark-200/60 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-mono">Plan</span>
                <span className="text-white font-semibold">{planConfig.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-mono">Token</span>
                <span className="text-white font-mono">{form.name || '—'} ({form.symbol || '—'})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-mono">Supply</span>
                <span className="text-white font-mono">{form.supply ? parseInt(form.supply).toLocaleString() : '—'}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-white/40 font-mono">Total Fee</span>
                <span className="text-primary font-bold font-mono">{planConfig.price} SOL</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-mono animate-fade-in">
                ⚠ {error}
              </div>
            )}

            {/* Wallet status */}
            {!connected && !connecting && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400/80 text-sm font-mono">
                Connect wallet to launch your token
              </div>
            )}

            {connecting && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-mono flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Connecting wallet...
              </div>
            )}

            {pendingLaunch && connected && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-mono">
                ✓ Wallet connected — launching...
              </div>
            )}

            <LaunchButton
              onClick={handleLaunch}
              status={status}
              disabled={isDisabled}
              plan={plan}
              price={planConfig.price}
            />

            <p className="text-white/20 text-xs text-center font-mono mt-3">
              Fee is sent atomically with token creation. No fee = no token.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-white text-center mb-8 tracking-wider">FAQ</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Is the transaction atomic?',
                a: 'Yes. The fee payment and token creation are in a single transaction. If either fails, nothing happens.',
              },
              {
                q: 'What is Revoke Authority?',
                a: 'Revoking Mint Authority means no new tokens can be minted. Revoking Freeze Authority means accounts cannot be frozen. Both increase community trust.',
              },
              {
                q: 'What network do you support?',
                a: 'Mainnet-beta and Devnet. Test on Devnet for free before launching on Mainnet.',
              },
              {
                q: 'Do you store my private keys?',
                a: 'Never. All signing happens in your wallet (Phantom, Solflare). We are fully non-custodial.',
              },
            ].map((item, i) => (
              <div key={i} className="glass-card p-5">
                <p className="text-white font-semibold mb-1.5">{item.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showWalletModal && (
        <WalletModal onClose={handleCloseModal} />
      )}
    </div>
  )
}
