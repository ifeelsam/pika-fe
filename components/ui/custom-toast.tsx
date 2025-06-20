"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomWalletButton } from "./custom-wallet-button"
import { useWallet } from "@solana/wallet-adapter-react"

interface CustomToastProps {
  isVisible: boolean
  onClose: () => void
  onConnect: () => void
  type?: "wallet_required" | "success" | "error"
  message?: string
  secondaryMessage?: string
}

const CUSTOM_LABELS = {
  'change-wallet': 'Change wallet',
  connecting: 'Connecting ...',
  'copy-address': 'Copy address',
  copied: 'Copied',
  disconnect: 'Disconnect',
  'has-wallet': 'Connect',
  'no-wallet': 'Connect Wallet',
} as const;

export function CustomToast({
  isVisible,
  onClose,
  onConnect,
  type = "wallet_required",
  message = "WALLET NOT CONNECTED",
  secondaryMessage = "Connect your wallet to list cards",
}: CustomToastProps) {
  const toastRef = useRef<HTMLDivElement>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { connected } = useWallet()

  // Only show toast if wallet is not connected
  useEffect(() => {
    if (connected) {
      onClose()
    }
  }, [connected, onClose])

  useEffect(() => {
    if (toastRef.current) {
      if (isVisible && !connected) {
        // Entrance animation
        gsap.fromTo(
          toastRef.current,
          {
            x: 500,
            opacity: 0,
            scale: 0.8,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
          },
        )

        // Pulse animation every 2 seconds
        const pulseInterval = setInterval(() => {
          if (toastRef.current && !isSuccess) {
            gsap.to(toastRef.current, {
              scale: 1.05,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut",
            })
          }
        }, 2000)

        // Auto-dismiss after 6 seconds
        const dismissTimer = setTimeout(() => {
          if (!isSuccess) {
            handleClose()
          }
        }, 4000)

        return () => {
          clearInterval(pulseInterval)
          clearTimeout(dismissTimer)
        }
      }
    }
  }, [isVisible, isSuccess])

  const handleClose = () => {
    if (toastRef.current) {
      // Glitch exit animation
      const tl = gsap.timeline({
        onComplete: onClose,
      })

      tl.to(toastRef.current, {
        skewX: 10,
        duration: 0.2,
      })
        .to(toastRef.current, {
          skewX: -5,
          duration: 0.1,
        })
        .to(toastRef.current, {
          x: 500,
          opacity: 0,
          scale: 0.8,
          skewX: 0,
          duration: 0.3,
          ease: "power2.in",
        })
    }
  }

  const handleConnect = () => {
    setIsConnecting(true)
    
    onConnect()
    
    const connectionCheck = setTimeout(() => {
      setIsConnecting(false)
      if (!connected) {
        console.log("Connection attempt timed out")
      }
    }, 10000) // 10 second timeout for connection attempt
    
    return () => clearTimeout(connectionCheck)
  }

  // Monitor connection state changes
  useEffect(() => {
    if (connected && isConnecting) {
      setIsConnecting(false)
      setIsSuccess(true)

      // Transform to success state
      if (toastRef.current) {
        gsap.to(toastRef.current, {
          backgroundColor: "#00F5FF",
          borderColor: "#F6FF00",
          duration: 0.3,
        })
      }

      const successTimer = setTimeout(() => {
        localStorage.setItem("wallet_connected", "true")
        handleClose()
      }, 2000)
      
      return () => clearTimeout(successTimer)
    }
  }, [connected, isConnecting])

  const handleToastClick = () => {
    if (!isConnecting && !isSuccess) {
      handleConnect()
    }
  }

  if (!isVisible || connected) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        ref={toastRef}
        onClick={handleToastClick}
        className={`
          relative w-[400px] h-[120px] cursor-pointer transition-all duration-300
          ${isSuccess ? "bg-pikavault-cyan" : "bg-pikavault-pink/90"}
          border-4 ${isSuccess ? "border-pikavault-yellow" : "border-pikavault-yellow"}
          backdrop-blur-sm shadow-2xl
          hover:scale-105 hover:shadow-[0_0_30px_rgba(246,255,0,0.5)]
        `}
        style={{
          clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-white hover:text-pikavault-yellow transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex items-center h-full p-4 space-x-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            {isSuccess ? (
              <div className="w-8 h-8 bg-pikavault-yellow flex items-center justify-center transform rotate-45">
                <div className="w-4 h-4 bg-pikavault-cyan transform -rotate-45"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-8 h-8 border-4 border-pikavault-yellow transform rotate-45"></div>
                <AlertTriangle className="absolute inset-0 w-8 h-8 text-pikavault-yellow transform -rotate-45" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3
              className="text-white text-md font-black leading-tight"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              {isSuccess ? "WALLET CONNECTED" : isConnecting ? "CONNECTING..." : message}
            </h3>
            <p className="text-white/90 text-sm mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {isSuccess ? "Access granted to your collection" : isConnecting ? "Please wait..." : secondaryMessage}
            </p>
          </div>

          {/* Action Button */}
          {!isSuccess && !isConnecting && (
              <CustomWalletButton
                className="bg-pikavault-yellow text-pikavault-dark hover:bg-pikavault-yellow/90 text-sm font-bold rounded-none"
              />
          )}

          {isConnecting && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 border-4 border-pikavault-yellow border-t-transparent animate-spin"></div>
            </div>
          )}
        </div>

        {/* Animated Border Pulse */}
        {!isSuccess && (
          <div className="absolute inset-0 border-4 border-pikavault-yellow animate-pulse opacity-50 pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}
