"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function Features() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const features = [
    {
      id: 1,
      icon: "vault",
      title: "SECURE VAULT",
      description: "Military-grade encryption protects your digital assets with multi-signature security protocols.",
      color: "pikavault-yellow",
    },
    {
      id: 2,
      icon: "shield",
      title: "AUTHENTICITY VERIFIED",
      description: "Blockchain verification ensures every card is genuine with immutable proof of ownership.",
      color: "pikavault-pink",
    },
    {
      id: 3,
      icon: "lightning",
      title: "INSTANT TRADING",
      description: "Lightning-fast transactions on Solana blockchain with near-zero fees and instant settlement.",
      color: "pikavault-teal",
    },
    {
      id: 4,
      icon: "network",
      title: "GLOBAL MARKETPLACE",
      description: "Connect with collectors worldwide in our decentralized trading ecosystem.",
      color: "pikavault-cyan",
    },
  ]

  const GeometricIcon = ({ type, isActive }: { type: string; isActive: boolean }) => {
    const iconProps = {
      className: "w-12 h-12",
      viewBox: "0 0 48 48",
      fill: "currentColor",
    }

    const animations = isActive ? {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
    } : {}

    const transition = {
      duration: 0.6,
      ease: "easeInOut"
    }

    switch (type) {
      case "vault":
        return (
          <motion.svg {...iconProps} animate={animations} transition={transition}>
            <rect x="8" y="12" width="32" height="28" stroke="currentColor" strokeWidth="3" fill="none" />
            <rect x="12" y="16" width="24" height="20" fill="currentColor" />
            <circle cx="24" cy="26" r="4" fill="black" />
            <rect x="6" y="8" width="36" height="8" fill="currentColor" />
            <rect x="10" y="4" width="28" height="8" fill="currentColor" />
          </motion.svg>
        )
      case "shield":
        return (
          <motion.svg {...iconProps} animate={animations} transition={transition}>
            <path d="M24 4 L36 12 L36 28 L24 44 L12 28 L12 12 Z" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M24 8 L32 14 L32 26 L24 38 L16 26 L16 14 Z" fill="currentColor" />
            <path d="M20 20 L22 22 L28 16" stroke="black" strokeWidth="2" fill="none" />
          </motion.svg>
        )
      case "lightning":
        return (
          <motion.svg {...iconProps} animate={animations} transition={transition}>
            <path d="M16 4 L28 20 L22 20 L32 44 L20 28 L26 28 L16 4 Z" fill="currentColor" />
            <rect x="14" y="2" width="4" height="4" fill="currentColor" />
            <rect x="30" y="42" width="4" height="4" fill="currentColor" />
          </motion.svg>
        )
      case "network":
        return (
          <motion.svg {...iconProps} animate={animations} transition={transition}>
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <circle cx="36" cy="12" r="4" fill="currentColor" />
            <circle cx="12" cy="36" r="4" fill="currentColor" />
            <circle cx="36" cy="36" r="4" fill="currentColor" />
            <circle cx="24" cy="24" r="6" fill="currentColor" />
            <line x1="16" y1="12" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="32" y1="12" x2="28" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="36" x2="20" y2="28" stroke="currentColor" strokeWidth="2" />
            <line x1="32" y1="36" x2="28" y2="28" stroke="currentColor" strokeWidth="2" />
          </motion.svg>
        )
      default:
        return <div className="w-12 h-12" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "pikavault-yellow":
        return {
          border: "border-pikavault-yellow",
          text: "text-pikavault-yellow",
          bg: "bg-pikavault-yellow/10",
        }
      case "pikavault-pink":
        return {
          border: "border-pikavault-pink",
          text: "text-pikavault-pink",
          bg: "bg-pikavault-pink/10",
        }
      case "pikavault-teal":
        return {
          border: "border-pikavault-teal",
          text: "text-pikavault-teal",
          bg: "bg-pikavault-teal/10",
        }
      case "pikavault-cyan":
        return {
          border: "border-pikavault-cyan",
          text: "text-pikavault-cyan",
          bg: "bg-pikavault-cyan/10",
        }
      default:
        return {
          border: "border-white",
          text: "text-white",
          bg: "bg-white/10",
        }
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
          VAULT <span className="text-pikavault-yellow">FEATURES</span>
        </h2>
        <p className="text-white/70 text-lg font-space-grotesk">
          Advanced security meets seamless trading
        </p>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="space-y-6">
        {features.map((feature, index) => {
          const colorClasses = getColorClasses(feature.color)
          const isActive = activeFeature === feature.id

          return (
            <motion.div
              key={feature.id}
              className={`relative p-6 bg-pikavault-dark ${colorClasses.border} border-4 overflow-hidden cursor-pointer group`}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileTap={{ scale: 0.98 }}
              onTap={() => {
                setActiveFeature(feature.id)
                setTimeout(() => setActiveFeature(null), 1000)
              }}
            >
              {/* Brutalist slab background effect */}
              <div className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-active:opacity-100 transition-opacity duration-200`} />
              
              {/* Geometric corner cuts */}
              <div className={`absolute top-0 left-0 w-6 h-6 ${colorClasses.border} border-b-4 border-r-4 bg-pikavault-dark`} />
              <div className={`absolute top-0 right-0 w-6 h-6 ${colorClasses.border} border-b-4 border-l-4 bg-pikavault-dark`} />
              <div className={`absolute bottom-0 left-0 w-6 h-6 ${colorClasses.border} border-t-4 border-r-4 bg-pikavault-dark`} />
              <div className={`absolute bottom-0 right-0 w-6 h-6 ${colorClasses.border} border-t-4 border-l-4 bg-pikavault-dark`} />

              <div className="relative z-10 flex items-start gap-4">
                {/* Animated Icon */}
                <div className={`${colorClasses.text} flex-shrink-0`}>
                  <GeometricIcon type={feature.icon} isActive={isActive} />
                </div>

                <div className="flex-1">
                  {/* Title with micro-glitch effect */}
                  <motion.h3
                    className={`text-xl font-black ${colorClasses.text} mb-3 font-monument`}
                    animate={isActive ? {
                      x: [0, -2, 2, 0],
                      textShadow: [
                        "0 0 0px currentColor",
                        "2px 0 0px currentColor, -2px 0 0px currentColor",
                        "0 0 0px currentColor"
                      ]
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description with animated underline */}
                  <div className="relative">
                    <p className="text-white text-sm leading-relaxed font-space-grotesk">
                      {feature.description}
                    </p>
                    
                    {/* Animated underline that grows on interaction */}
                    <motion.div
                      className={`h-1 ${colorClasses.border} border-t-2 mt-2`}
                      initial={{ width: 0 }}
                      animate={{ width: isActive ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Pop-in effect indicator */}
              {isActive && (
                <motion.div
                  className={`absolute top-2 right-2 w-3 h-3 ${colorClasses.bg} ${colorClasses.border} border-2`}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 45 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Interaction hint */}
      <motion.p
        className="text-center text-white/50 text-sm mt-8 font-space-grotesk"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1 }}
        viewport={{ once: true }}
      >
        Tap any feature to activate
      </motion.p>
    </section>
  )
} 