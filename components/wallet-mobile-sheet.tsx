"use client"

import { useEffect, useRef } from "react"
import { Copy, ExternalLink, Check, X } from "lucide-react"

interface WalletMobileSheetProps {
  isOpen: boolean
  onClose: () => void
  walletData: {
    address: string
    balance: number
    network: string
    usdBalance: number
  }
  onDisconnect: () => void
  onCopy: () => void
  isCopied: boolean
}

export function WalletMobileSheet({
  isOpen,
  onClose,
  walletData,
  onDisconnect,
  onCopy,
  isCopied,
}: WalletMobileSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close sheet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Sound effects
  const playSound = (type: "hover" | "click" | "success") => {
    // In a real app, you would implement actual sound effects here
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      {/* Mobile Sheet */}
      <div
        ref={sheetRef}
        className={`
          fixed bottom-0 left-0 right-0 bg-pikavault-dark border-t-4 border-pikavault-cyan z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/20">
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
            WALLET
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-white/70 sm:hover:text-white"
            onMouseEnter={() => playSound("hover")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallet Address */}
          <div className="space-y-2">
            <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              WALLET ADDRESS
            </p>
            <div className="flex items-center justify-between bg-pikavault-dark border border-white/20 p-3">
              <p className="font-mono text-white truncate">{walletData.address}</p>
              <button
                onClick={onCopy}
                className="p-2 sm:hover:text-pikavault-yellow transition-colors"
                onMouseEnter={() => playSound("hover")}
              >
                {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex justify-between items-center">
            <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              NETWORK
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {walletData.network}
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              BALANCE
            </p>
            <div className="flex justify-between items-baseline">
              <p
                className="text-3xl font-black text-pikavault-yellow"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {walletData.balance.toFixed(4)} SOL
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <button
              className="w-full p-4 bg-transparent border-2 border-white/30 text-white sm:hover:border-white/60 transition-colors flex items-center justify-center space-x-2"
              onMouseEnter={() => playSound("hover")}
              onClick={() => {
                window.open(`https://explorer.solana.com/address/${walletData.address}?cluster=devnet`, "_blank")
                playSound("click")
              }}
            >
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VIEW ON EXPLORER</span>
              <ExternalLink className="w-5 h-5" />
            </button>

            <button
              className="w-full p-4 bg-transparent border-2 border-pikavault-pink text-pikavault-pink sm:hover:bg-pikavault-pink sm:hover:text-white transition-colors"
              onMouseEnter={() => playSound("hover")}
              onClick={onDisconnect}
            >
              <span style={{ fontFamily: "'Monument Extended', sans-serif" }}>DISCONNECT</span>
            </button>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-6 bg-pikavault-dark"></div>
      </div>
    </>
  )
}
