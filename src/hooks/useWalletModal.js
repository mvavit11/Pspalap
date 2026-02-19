import { useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function useWalletModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { select, wallets, disconnect, connecting } = useWallet()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const connect = useCallback(async (walletName) => {
    select(walletName)
    close()
  }, [select, close])

  return { isOpen, open, close, connect, wallets, disconnect, connecting }
}
