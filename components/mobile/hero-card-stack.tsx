"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export function HeroCardStack() {
  const [electricActive, setElectricActive] = useState(false)
  const [cardHover, setCardHover] = useState<number | null>(null)
  const router = useRouter()

  // Trigger electric current animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setElectricActive(true)
      setTimeout(() => setElectricActive(false), 2000)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const cards = [
    {
      id: 1,
      color: "pikavault-pink",
      borderColor: "border-pikavault-pink",
      image: "/electric-pokemon-card.png",
      rotation: -12,
      zIndex: 30,
      x: -20,
      y: 0,
    },
    {
      id: 2,
      color: "pikavault-teal",
      borderColor: "border-pikavault-teal",
      image: "/cyber-pokemon-card.png",
      rotation: 0,
      zIndex: 20,
      x: 0,
      y: 10,
    },
    {
      id: 3,
      color: "pikavault-yellow",
      borderColor: "border-pikavault-yellow",
      image: "/digital-wave-pokemon-card.png",
      rotation: 15,
      zIndex: 10,
      x: 20,
      y: 20,
    },
  ]

  const splitTextWithElectric = (text: string) => {
    return text.split("").map((char, index) => (
      <motion.span
        key={index}
        className="inline-block relative"
        animate={electricActive ? {
          color: ["#FFFFFF", "#F6FF00", "#FFFFFF"],
          textShadow: [
            "0 0 0px rgba(246,255,0,0)",
            "0 0 20px rgba(246,255,0,1)",
            "0 0 0px rgba(246,255,0,0)"
          ],
          y: [0, -2, 0],
        } : {}}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          repeat: electricActive ? 2 : 0 
        }}
      >
        {char === " " ? "\u00A0" : char}
        
        {/* Electric current effect */}
        {electricActive && (
          <motion.div
            className="absolute -top-1 -left-1 w-full h-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <svg className="w-full h-full" viewBox="0 0 20 20">
              <path
                d="M2,10 Q10,2 18,10 Q10,18 2,10"
                stroke="rgba(246,255,0,0.8)"
                strokeWidth="0.5"
                fill="none"
              />
            </svg>
          </motion.div>
        )}
      </motion.span>
    ))
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-32">
      {/* Animated Card Stack */}
      <div className="relative h-80 mb-12 mx-auto max-w-sm">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="absolute w-64 aspect-[3/4] cursor-pointer"
            style={{
              zIndex: card.zIndex,
              left: `calc(50% - 128px + ${card.x}px)`,
              top: `calc(50% - 160px + ${card.y}px)`,
            }}
            initial={{ opacity: 0, y: 100, rotateX: -90 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotateX: 0,
              rotateZ: card.rotation,
              rotateY: cardHover === card.id ? 15 : 0,
            }}
            transition={{ 
              duration: 1, 
              delay: index * 0.2,
              type: "spring",
              stiffness: 100 
            }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 15,
              transition: { duration: 0.3 }
            }}
            onHoverStart={() => setCardHover(card.id)}
            onHoverEnd={() => setCardHover(null)}
          >
            {/* Card Container */}
            <div className={`relative w-full h-full ${card.borderColor} border-4 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden group`}>
              {/* Card Image */}
              <div className="absolute inset-2 bg-black">
                <img
                  src={card.image}
                  alt="Pokemon Card"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Holographic Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 sm:group-hover:opacity-100"
                initial={{ x: "-100%" }}
                animate={{ x: cardHover === card.id ? "100%" : "-100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              {/* Deep Black Shadow */}
              <div 
                className="absolute inset-0 bg-black/60 -z-10"
                style={{
                  transform: `translate(${card.rotation > 0 ? 8 : -8}px, 8px)`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Headline with Electric Effects */}
      <motion.h1
        className="text-[40px] font-black mb-6 text-center leading-none font-monument"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        onTap={() => {
          setElectricActive(true)
          setTimeout(() => setElectricActive(false), 2000)
        }}
      >
        <div className="text-pikavault-yellow mb-2">
          {splitTextWithElectric("PIKAVAULT")}
        </div>
      </motion.h1>

      {/* Tagline with Flickering Effect */}
      <motion.p
        className="text-xl text-center mb-12 max-w-xs mx-auto font-space-grotesk"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.span
          className="text-pikavault-teal"
          animate={{
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Tokenized Pokémon Cards.
        </motion.span>
        <br />
        <span className="text-white">Real Ownership.</span>
      </motion.p>

      {/* Get Started Button */}
      <motion.div
        className="w-full px-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <button
          className="w-full h-16 bg-pikavault-pink text-white font-black text-xl font-monument relative overflow-hidden group active:scale-95 transition-transform"
          onClick={() => router.push("/marketplace")}
        >
          {/* Lightning Bolt Animation */}
          <motion.div
            className="absolute pl-4 top-1/4 -translate-y-1/2 text-2xl"
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ⚡
          </motion.div>
          
          <span className="relative z-10">GET STARTED</span>
          
          {/* Geometric Lightning Animation on Tap */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-pikavault-yellow/30 via-transparent to-pikavault-yellow/30 opacity-0 group-active:opacity-100"
            transition={{ duration: 0.2 }}
          />
          
          {/* Border flash effect */}
          <div className="absolute inset-0 border-4 border-pikavault-yellow opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
        </button>
      </motion.div>
    </section>
  )
} 