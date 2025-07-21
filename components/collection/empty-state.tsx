"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { redirect } from "next/navigation"

export function LockedState() {
  const emptyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (emptyRef.current) {
      // Glitching animation for text
      const glitchText = () => {
        const text = emptyRef.current?.querySelector(".glitch-text")
        if (!text) return

        gsap.to(text, {
          skewX: 20,
          duration: 0.1,
          onComplete: () => {
            gsap.to(text, {
              skewX: 0,
              duration: 0.1,
            })
          },
        })

        // Random opacity flicker
        gsap.to(text, {
          opacity: 0.7,
          duration: 0.1,
          onComplete: () => {
            gsap.to(text, {
              opacity: 1,
              duration: 0.1,
            })
          },
        })
      }

      // Run glitch effect periodically
      const glitchInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          glitchText()
        }
      }, 2000)

      // Animate shapes
      const shapes = emptyRef.current.querySelectorAll(".shape")
      shapes.forEach((shape) => {
        const randomX = Math.random() * 40 - 20
        const randomY = Math.random() * 40 - 20
        const randomRotation = Math.random() * 40 - 20

        gsap.to(shape, {
          x: randomX,
          y: randomY,
          rotation: randomRotation,
          duration: 10 + Math.random() * 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      })

      return () => {
        clearInterval(glitchInterval)
      }
    }
  }, [])

  return (
    <div ref={emptyRef} className="flex flex-col items-center justify-center py-24 relative">
      {/* Abstract shapes */}
      <div className="shape absolute top-1/4 left-1/4 w-16 h-16 bg-pikavault-yellow/20 transform rotate-45"></div>
      <div className="shape absolute top-1/3 right-1/3 w-24 h-8 bg-pikavault-pink/20"></div>
      <div className="shape absolute bottom-1/4 right-1/4 w-12 h-12 bg-pikavault-cyan/20 rounded-full"></div>
      <div className="shape absolute bottom-1/3 left-1/3 w-20 h-20 border-4 border-white/20 transform -rotate-15"></div>

      <h2
        className="glitch-text text-7xl md:text-9xl font-black text-white mb-12 tracking-tight font-monument flex items-center h-36"
        // style={{
        //   height: "200px",
        //   display: "flex",
        //   alignItems: "center",
        // }}
      >
        VAULT <span className="text-pikavault-yellow">EMPTY</span>
      </h2>

      <p
        className="text-white/70 text-xl md:text-2xl max-w-2xl text-center mb-12 font-space-grotesk"
      >
        Your collection is empty. Connect your wallet or purchase your first card to get started.
      </p>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        {/* <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <Button
            className="bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg md:text-xl font-bold font-monument py-6 px-12 rounded-none"
          >
            CONNECT WALLET
          </Button>
          <div className="absolute inset-0 border-2 border-pikavault-yellow -z-10 translate-x-2 translate-y-2"></div>
        </motion.div> */}

        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <Button
            onClick={() => redirect("/marketplace")}
            className="bg-pikavault-pink sm:hover:bg-pikavault-pink/90 text-white text-lg md:text-xl font-bold font-monument py-6 px-12 rounded-none"
          >
            BUY FIRST CARD
          </Button>
          <div className="absolute inset-0 border-2 border-pikavault-pink -z-10 translate-x-2 translate-y-2"></div>
        </motion.div>
      </div>
    </div>
  )
}
