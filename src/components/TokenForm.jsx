import React, { useRef, useState, useCallback } from 'react'
import { PLAN_CONFIG } from '../utils/tokenLauncher.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']

export default function TokenForm({ plan, values, onChange }) {
  const planConfig = PLAN_CONFIG[plan]
  const showDecimals = planConfig.customDecimals
  const fileRef = useRef(null)
  const [imageMode, setImageMode] = useState('upload') // 'upload' | 'url'
  const [dragOver, setDragOver] = useState(false)
  const [imageError, setImageError] = useState('')

  const handleChange = (field) => (e) => {
    onChange({ ...values, [field]: e.target.value })
  }

  const processFile = useCallback((file) => {
    setImageError('')
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setImageError('Unsupported format. Use PNG, JPG, GIF, WebP or SVG.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError('File too large. Max size is 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange({ ...values, image: e.target.result, imageFile: file, imageName: file.name })
    }
    reader.readAsDataURL(file)
  }, [values, onChange])

  const handleFileInput = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  const clearImage = () => {
    onChange({ ...values, image: '', imageFile: null, imageName: '' })
    setImageError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const isDataUrl = values.image?.startsWith('data:')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Token Name */}
        <div>
          <label className="label-field">Token Name *</label>
          <input
            type="text"
            placeholder="e.g. Doge King"
            value={values.name}
            onChange={handleChange('name')}
            className="input-field"
            maxLength={32}
          />
        </div>

        {/* Symbol */}
        <div>
          <label className="label-field">Symbol *</label>
          <input
            type="text"
            placeholder="e.g. DGKING"
            value={values.symbol}
            onChange={handleChange('symbol')}
            className="input-field uppercase"
            maxLength={10}
          />
        </div>
      </div>

      {/* Description (Trusted only) */}
      {plan === 'trusted' && (
        <div>
          <label className="label-field">
            Description
            <span className="ml-2 px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400 text-[10px] rounded font-mono">TRUSTED</span>
          </label>
          <textarea
            placeholder="Describe your token project..."
            value={values.description}
            onChange={handleChange('description')}
            className="input-field resize-none h-20"
            maxLength={200}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Supply */}
        <div>
          <label className="label-field">Total Supply *</label>
          <input
            type="number"
            placeholder="1,000,000,000"
            value={values.supply}
            onChange={handleChange('supply')}
            className="input-field"
            min="1"
          />
        </div>

        {/* Decimals */}
        <div>
          <label className="label-field">
            Decimals
            {!showDecimals && <span className="ml-2 text-white/20">(locked)</span>}
          </label>
          <select
            value={values.decimals}
            onChange={handleChange('decimals')}
            disabled={!showDecimals}
            className="input-field disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="0">0 — Meme / No fractional</option>
            <option value="2">2 — Cents style</option>
            <option value="6">6 — USDC style</option>
            <option value="9">9 — SOL style (default)</option>
          </select>
        </div>
      </div>

      {/* ── IMAGE UPLOAD ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label-field mb-0">Token Logo <span className="text-white/30">(optional)</span></label>
          {/* Toggle upload / URL */}
          <div className="flex bg-dark-200 border border-white/8 rounded-lg p-0.5 gap-0.5">
            {['upload', 'url'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setImageMode(mode); clearImage() }}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                  imageMode === mode
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {mode === 'upload' ? '⬆ Upload' : '🔗 URL'}
              </button>
            ))}
          </div>
        </div>

        {imageMode === 'upload' ? (
          <div>
            {/* Preview or dropzone */}
            {values.image && isDataUrl ? (
              <div className="relative flex items-center gap-4 p-4 bg-dark-200 border border-white/10 rounded-xl">
                <img
                  src={values.image}
                  alt="Token logo preview"
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{values.imageName}</p>
                  <p className="text-white/30 text-xs font-mono mt-0.5">
                    {values.imageFile ? `${(values.imageFile.size / 1024).toFixed(0)} KB` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-accent text-xs font-mono mt-1.5 hover:text-accent/80 transition-colors"
                  >
                    Change image
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  dragOver
                    ? 'border-accent/60 bg-accent/8'
                    : 'border-white/10 hover:border-white/20 bg-dark-200/40 hover:bg-dark-200/60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-dark-300 border border-white/10 flex items-center justify-center text-2xl">
                  🖼
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">
                    {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-white/25 text-xs font-mono mt-1">PNG, JPG, GIF, WebP, SVG · Max 5MB</p>
                </div>
                <div className="absolute inset-0 rounded-xl" />
              </div>
            )}

            {/* Hidden file input — accepts camera on mobile */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
              capture={false}
              onChange={handleFileInput}
              className="hidden"
            />

            {/* Mobile: also offer camera */}
            {!values.image && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/20 text-xs font-mono">or</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}
            {!values.image && (
              <button
                type="button"
                onClick={() => {
                  if (fileRef.current) {
                    fileRef.current.setAttribute('capture', 'environment')
                    fileRef.current.click()
                    fileRef.current.removeAttribute('capture')
                  }
                }}
                className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 bg-dark-200/60 border border-white/8 rounded-xl text-white/35 text-sm font-mono hover:text-white/55 hover:border-white/15 transition-all"
              >
                📷 Take a photo
              </button>
            )}
          </div>
        ) : (
          <div>
            <input
              type="url"
              placeholder="https://your-cdn.com/token-logo.png"
              value={isDataUrl ? '' : values.image}
              onChange={handleChange('image')}
              className="input-field"
            />
            {values.image && !isDataUrl && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-dark-200 border border-white/8 rounded-xl">
                <img
                  src={values.image}
                  alt="preview"
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <p className="text-white/40 text-xs font-mono truncate flex-1">{values.image}</p>
                <button type="button" onClick={clearImage} className="text-white/30 hover:text-red-400 transition-colors text-xs">✕</button>
              </div>
            )}
            <p className="text-white/25 text-xs font-mono mt-1.5">Recommended: 500×500px image hosted on IPFS or CDN</p>
          </div>
        )}

        {imageError && (
          <p className="text-red-400 text-xs font-mono mt-2">⚠ {imageError}</p>
        )}
      </div>

      {/* Revoke options for SAFE plan */}
      {plan === 'safe' && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <p className="text-xs font-mono text-accent/70 uppercase tracking-widest mb-3">Authority options</p>
          <div className="space-y-3">
            {[
              { key: 'revokeMint', label: 'Revoke Mint Authority', desc: 'No new tokens can ever be minted' },
              { key: 'revokeFreeze', label: 'Revoke Freeze Authority', desc: 'Token accounts cannot be frozen' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-5 h-5 flex-shrink-0 rounded border transition-all ${values[key] ? 'bg-accent border-accent' : 'bg-dark-200 border-white/20 group-hover:border-white/40'}`}>
                  {values[key] && (
                    <svg className="absolute inset-0 w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" className="sr-only" checked={values[key]} onChange={(e) => onChange({ ...values, [key]: e.target.checked })} />
                <div>
                  <span className="text-sm text-white/80 font-medium">{label}</span>
                  <p className="text-xs text-white/30 font-mono">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Trusted auto-revoke badge */}
      {plan === 'trusted' && (
        <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl flex items-start gap-3">
          <span className="text-yellow-400 text-lg flex-shrink-0">✓</span>
          <div>
            <p className="text-yellow-400 text-sm font-semibold">Auto-Revoke Enabled</p>
            <p className="text-white/40 text-xs font-mono mt-1">Both Mint and Freeze authorities will be automatically revoked in the same transaction as token creation.</p>
          </div>
        </div>
      )}
    </div>
  )
}
