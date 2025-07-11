"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function ProcessTimeline() {
  const [unlockedSteps, setUnlockedSteps] = useState<number[]>([])

  const steps = [
    {
      id: 1,
      number: "01",
      title: "CONNECT WALLET",
      description: "Link your Solana wallet to access the PikaVault ecosystem. Phantom, Solflare, and other major wallets supported.",
      icon: "wallet",
    },
    {
      id: 2,
      number: "02", 
      title: "BROWSE COLLECTION",
      description: "Explore thousands of verified digital Pokémon cards with detailed authenticity certificates and ownership history.",
      icon: "browse",
    },
    {
      id: 3,
      number: "03",
      title: "SECURE PURCHASE",
      description: "Buy instantly with SOL or list your own cards. All transactions are secured by blockchain technology.",
      icon: "purchase",
    },
    {
      id: 4,
      number: "04",
      title: "OWN & TRADE",
      description: "Cards are stored in your vault forever. Trade, sell, or showcase your collection with verified ownership.",
      icon: "trade",
    },
  ]

  const handleStepUnlock = (stepId: number) => {
    if (!unlockedSteps.includes(stepId)) {
      setUnlockedSteps([...unlockedSteps, stepId])
    }
  }

  const GeometricStepIcon = ({ type, isUnlocked }: { type: string; isUnlocked: boolean }) => {
    const iconProps = {
      className: "w-8 h-8",
      viewBox: "0 0 32 32",
      fill: "currentColor",
    }

    const animations = isUnlocked ? {
      scale: [1, 1.3, 1],
      rotate: [0, 15, -15, 0],
    } : {}

    switch (type) {
      case "wallet":
        return (
          <motion.svg {...iconProps} animate={animations} transition={{ duration: 0.8 }}>
            <rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="8" y="12" width="16" height="10" fill="currentColor" />
            <circle cx="22" cy="17" r="2" fill="black" />
            <rect x="6" y="8" width="20" height="4" fill="currentColor" />
          </motion.svg>
        )
      case "browse":
        return (
          <motion.svg {...iconProps} animate={animations} transition={{ duration: 0.8 }}>
            <rect x="4" y="6" width="8" height="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            <rect x="14" y="6" width="8" height="12" stroke="currentColor" strokeWidth="2" fill="currentColor" />
            <rect x="24" y="6" width="4" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="6" y="8" width="4" height="8" fill="black" />
            <rect x="16" y="8" width="4" height="8" fill="black" />
          </motion.svg>
        )
      case "purchase":
        return (
          <motion.svg {...iconProps} animate={animations} transition={{ duration: 0.8 }}>
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="8" fill="currentColor" />
            <path d="M12 16 L14 18 L20 12" stroke="black" strokeWidth="2" fill="none" />
          </motion.svg>
        )
      case "trade":
        return (
          <motion.svg {...iconProps} animate={animations} transition={{ duration: 0.8 }}>
            <path d="M6 12 L20 12 L18 10 M18 10 L20 12 L18 14" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M26 20 L12 20 L14 18 M14 18 L12 20 L14 22" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="8" cy="12" r="3" fill="currentColor" />
            <circle cx="24" cy="20" r="3" fill="currentColor" />
          </motion.svg>
        )
      default:
        return <div className="w-8 h-8" />
    }
  }

  return (
    <section className="relative py-16 px-6">
      {/* Section Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-black text-white mb-4 font-monument">
          HOW IT <span className="text-pikavault-yellow">WORKS</span>
        </h2>
        <p className="text-white/70 text-lg font-space-grotesk">
          Four steps to digital card ownership
        </p>
      </motion.div>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-pikavault-teal"></div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const isUnlocked = unlockedSteps.includes(step.id)
            const isLastStep = index === steps.length - 1

            return (
              <div key={step.id} className="relative">
                {/* Step Number Circle */}
                <motion.div
                  className="absolute left-0 top-0 w-16 h-16 bg-pikavault-dark border-4 border-pikavault-pink flex items-center justify-center cursor-pointer z-10"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileTap={{ scale: 0.9 }}
                  onTap={() => handleStepUnlock(step.id)}
                >
                  <motion.span
                    className="text-2xl font-black text-pikavault-pink font-monument"
                    animate={isUnlocked ? {
                      textShadow: [
                        "0 0 0px rgba(255,45,85,0)",
                        "0 0 20px rgba(255,45,85,0.8)",
                        "0 0 0px rgba(255,45,85,0)"
                      ]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {step.number}
                  </motion.span>

                  {/* Unlock animation - lightning bolt through number */}
                  <AnimatePresence>
                    {isUnlocked && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <svg className="w-full h-full text-pikavault-yellow" viewBox="0 0 64 64">
                          <path 
                            d="M20 10 L30 28 L26 28 L44 54 L34 36 L38 36 L20 10 Z" 
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="ml-24 pb-8"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Title and Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      className={`${isUnlocked ? "text-pikavault-yellow" : "text-pikavault-teal"} transition-colors duration-300`}
                      animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <GeometricStepIcon type={step.icon} isUnlocked={isUnlocked} />
                    </motion.div>
                    
                    <motion.h3
                      className={`text-xl font-black font-monument ${isUnlocked ? "text-pikavault-yellow" : "text-white"} transition-colors duration-300`}
                      animate={isUnlocked ? {
                        x: [0, -1, 1, 0],
                        textShadow: [
                          "0 0 0px rgba(246,255,0,0)",
                          "0 0 10px rgba(246,255,0,0.8)",
                          "0 0 0px rgba(246,255,0,0)"
                        ]
                      } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {step.title}
                    </motion.h3>
                  </div>

                  {/* Description with typewriter effect when unlocked */}
                  <div className="relative">
                    <p className="text-white/80 leading-relaxed font-space-grotesk">
                      {step.description}
                    </p>
                    
                    {/* Unlocked indicator line */}
                    {isUnlocked && (
                      <motion.div
                        className="absolute -left-4 top-0 bottom-0 w-1 bg-pikavault-yellow"
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    )}
                  </div>
                </motion.div>

                {/* Lightning Slash Divider */}
              </div>
            )
          })}
        </div>
      </div>

      {/* Unlock Progress */}
      {/* <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-white/50 text-sm mb-4 font-space-grotesk">
          Tap steps to unlock: {unlockedSteps.length}/{steps.length}
        </p>
        
        {/* Progress Bar */}
        {/* <div className="w-full max-w-xs mx-auto h-2 bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pikavault-pink to-pikavault-yellow"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedSteps.length / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div> */}

        {/* All unlocked message */}
        {/* {unlockedSteps.length === steps.length && (
          <motion.p
            className="text-pikavault-yellow font-bold mt-4 font-monument"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            ⚡ ALL STEPS UNLOCKED ⚡
          </motion.p>
        )}
      </motion.div> */}
    </section>
  )
} 