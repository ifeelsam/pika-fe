"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Lock, Eye } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export function DisconnectedState() {
  const containerRef = useRef<HTMLDivElement>(null)
  const vaultRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (containerRef.current && vaultRef.current) {
      // Initial animation setup
      gsap.set(".floating-shape", {
        opacity: 0.1,
        scale: 0.8,
      })

      gsap.set(".card-silhouette", {
        opacity: 0.3,
        filter: "blur(8px)",
      })

      // Glitch animation for main title
      const glitchTitle = () => {
        const title = containerRef.current?.querySelector(".glitch-title")
        if (!title) return

        gsap.to(title, {
          skewX: 5,
          duration: 0.1,
          onComplete: () => {
            gsap.to(title, {
              skewX: -2,
              duration: 0.1,
              onComplete: () => {
                gsap.to(title, {
                  skewX: 0,
                  duration: 0.1,
                })
              },
            })
          },
        })
      }

      // Scanning lines animation
      const scanningAnimation = () => {
        const scanLines = containerRef.current?.querySelectorAll(".scan-line")
        if (!scanLines) return

        scanLines.forEach((line, index) => {
          gsap.fromTo(
            line,
            { x: "-100%", opacity: 0 },
            {
              x: "200%",
              opacity: 1,
              duration: 2,
              delay: index * 0.3,
              ease: "power2.inOut",
              onComplete: () => {
                gsap.set(line, { opacity: 0 })
              },
            },
          )
        })
      }

      // Floating shapes animation
      const animateFloatingShapes = () => {
        const shapes = containerRef.current?.querySelectorAll(".floating-shape")
        shapes?.forEach((shape) => {
          const randomX = Math.random() * 100 - 50
          const randomY = Math.random() * 100 - 50
          const randomRotation = Math.random() * 360

          gsap.to(shape, {
            x: randomX,
            y: randomY,
            rotation: randomRotation,
            duration: 8 + Math.random() * 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        })
      }

      // Question mark animation for stats
      const animateQuestionMarks = () => {
        const questionMarks = containerRef.current?.querySelectorAll(".question-mark")
        questionMarks?.forEach((mark) => {
          gsap.to(mark, {
            scale: 1.2,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut",
          })
        })
      }

      // Start animations
      glitchTitle()
      scanningAnimation()
      animateFloatingShapes()
      animateQuestionMarks()

      // Set up intervals
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.7) glitchTitle()
      }, 3000)

      const scanInterval = setInterval(scanningAnimation, 5000)

      return () => {
        clearInterval(glitchInterval)
        clearInterval(scanInterval)
      }
    }
  }, [])

  const handleConnectWallet = () => {
    setIsAnimating(true)
    // Simulate wallet connection
    setTimeout(() => {
      localStorage.setItem("wallet_connected", "true")
      window.location.reload()
    }, 2000)
  }

  const handleViewSample = () => {
    // Navigate to sample collection or show preview
    console.log("Showing sample collection")
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-pikavault-dark text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="floating-shape absolute top-20 left-20 w-16 h-16 bg-pikavault-pink/20 transform rotate-45"></div>
      <div className="floating-shape absolute top-40 right-32 w-24 h-8 bg-pikavault-yellow/20"></div>
      <div className="floating-shape absolute bottom-32 left-40 w-12 h-12 bg-pikavault-cyan/20 rounded-full"></div>
      <div className="floating-shape absolute bottom-20 right-20 w-20 h-20 border-4 border-white/20"></div>
      <div className="floating-shape absolute top-1/3 left-1/4 w-14 h-14 bg-pikavault-pink/20 transform -rotate-12"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 md:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1
            className="glitch-title text-6xl md:text-[120px] font-black mb-4 tracking-tight leading-none"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            VAULT <span className="text-pikavault-pink">LOCKED</span>
          </h1>

          <p className="text-xl md:text-2xl mb-6 max-w-7xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CONNECT WALLET TO ACCESS <span className="text-pikavault-yellow font-bold">YOUR COLLECTION</span>
          </p>
        </div>

        {/* Locked Vault Graphic */}
        <div ref={vaultRef} className="relative mb-8">
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            {/* Main Vault Shape */}
            <div className="absolute inset-0 bg-pikavault-pink/30 transform rotate-12 border-8 border-pikavault-pink"></div>
            <div className="absolute inset-4 bg-pikavault-dark border-4 border-pikavault-yellow"></div>

            {/* Lock Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-16 h-16 text-pikavault-yellow" strokeWidth={3} />
            </div>

            {/* Scanning Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="scan-line absolute top-0 w-full h-1 bg-pikavault-cyan opacity-0"></div>
              <div className="scan-line absolute top-1/3 w-full h-1 bg-pikavault-yellow opacity-0"></div>
              <div className="scan-line absolute top-2/3 w-full h-1 bg-pikavault-pink opacity-0"></div>
            </div>

            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-pikavault-dark/50"></div>
          </div>
        </div>

        {/* Connection Benefits */}
        <div className="mb-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-pikavault-yellow transform rotate-45"></div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                VIEW YOUR CARDS
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-pikavault-cyan transform rotate-45"></div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                TRACK PORTFOLIO
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-pikavault-pink transform rotate-45"></div>
              <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                LIST FOR SALE
              </span>
            </div>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        {/* <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <div className="wallet-adapter-button-trigger">
              <WalletMultiButton className="w-64 h-16 text-xl font-black rounded-none relative overflow-hidden bg-gradient-to-r from-pikavault-yellow to-pikavault-cyan text-pikavault-dark sm:hover:from-pikavault-yellow/90 sm:hover:to-pikavault-cyan/90" />
            </div>
            <div className="absolute inset-0 border-4 border-pikavault-yellow -z-10 translate-x-2 translate-y-2 animate-pulse"></div>
          </motion.div>
        </div> */}
      </div>
    </div>
  )
}
