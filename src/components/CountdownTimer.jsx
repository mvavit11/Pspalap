import React, { useState, useEffect } from 'react'

function getEndOfDay() {
  const stored = localStorage.getItem('promo_end')
  if (stored) return parseInt(stored)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  localStorage.setItem('promo_end', end.getTime())
  return end.getTime()
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const endTime = getEndOfDay()

    const update = () => {
      const now = Date.now()
      const diff = Math.max(0, endTime - now)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ h, m, s, diff })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-accent/10 border border-accent/30 rounded-xl">
      <span className="text-xs font-mono text-accent/80 uppercase tracking-widest">🔥 -20% TODAY</span>
      <span className="text-white/30 font-mono text-xs">ends in</span>
      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="text-white font-bold tabular-nums">{pad(timeLeft.h)}</span>
        <span className="text-white/30">:</span>
        <span className="text-white font-bold tabular-nums">{pad(timeLeft.m)}</span>
        <span className="text-white/30">:</span>
        <span className="text-white font-bold tabular-nums">{pad(timeLeft.s)}</span>
      </div>
    </div>
  )
}
