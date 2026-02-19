import React, { createContext, useContext, useState, useEffect } from 'react'

const TokenCountContext = createContext(null)

const STORAGE_KEY = 'sol_launch_token_count'
const BASE_COUNT = 12847 // seed number for social proof

export function TokenCountProvider({ children }) {
  const [count, setCount] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored) : BASE_COUNT
  })

  const increment = () => {
    setCount(prev => {
      const next = prev + 1
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }

  // Simulate organic growth
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount(prev => {
          const next = prev + 1
          localStorage.setItem(STORAGE_KEY, next)
          return next
        })
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TokenCountContext.Provider value={{ count, increment }}>
      {children}
    </TokenCountContext.Provider>
  )
}

export const useTokenCount = () => useContext(TokenCountContext)
