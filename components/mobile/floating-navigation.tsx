"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WalletConnection } from "@/components/wallet-connection"
import Link from "next/link"

interface MenuLinkProps {
  href: string
  children: string
  onClick: () => void
}

interface HamburgerMenuProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export function FloatingNavigation() {
  const [logoAnimating, setLogoAnimating] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Trigger logo animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLogoAnimating(true)
      setTimeout(() => setLogoAnimating(false), 1000)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const splitText = (text: string) => {
    return text.split("").map((char, index) => (
      <motion.span
        key={index}
        className="inline-block"
        initial={{ opacity: 1, y: 0 }}
        animate={logoAnimating ? {
          opacity: [1, 0.5, 1],
          y: [0, -2, 0],
          textShadow: [
            "0 0 0px rgba(246,255,0,0)",
            "0 0 10px rgba(246,255,0,0.8)",
            "0 0 0px rgba(246,255,0,0)"
          ]
        } : {}}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.05,
          repeat: logoAnimating ? 1 : 0 
        }}
      >
        {char}
      </motion.span>
    ))
  }

  return (
    <motion.header
      className="fixed top-4 left-4 right-4 z-40 h-14"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {/* Translucent Glassy Bar */}
      <div className="relative h-full bg-black/20 backdrop-blur-md border-4 border-pikavault-yellow rounded-none">
        {/* Geometric Notches */}
        <div className="absolute -top-2 left-6 w-6 h-3 bg-pikavault-yellow"></div>
        <div className="absolute -top-2 right-6 w-6 h-3 bg-pikavault-yellow"></div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-pikavault-yellow"></div>

        <div className="flex items-center justify-between h-full px-4">
          {/* Animated Logo */}
          <motion.div 
            className="text-lg font-black font-monument cursor-pointer"
            onTap={() => {
              setLogoAnimating(true)
              setTimeout(() => setLogoAnimating(false), 1000)
            }}
          >
            <span className="text-pikavault-yellow">
              {splitText("PIKA")}
            </span>
            <span className="text-white">
              {splitText("VAULT")}
            </span>
          </motion.div>

          <div className="flex items-center gap-3"> 
            <HamburgerMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </div>
        </div>

        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20 pointer-events-none rounded-none"></div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-pikavault-dark/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTap={() => setMenuOpen(false)}
          >
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `linear-gradient(rgba(246,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(246,255,0,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            <motion.div
              className="relative z-10 flex flex-col px-20 items-end justify-end pb-20 h-full space-y-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onTap={(e) => e.stopPropagation()}
            >
              {/* Menu Items */}
              <MenuLink href="/marketplace" onClick={() => setMenuOpen(false)}>
                MARKETPLACE
              </MenuLink>
              <MenuLink href="/collection" onClick={() => setMenuOpen(false)}>
                COLLECTION
              </MenuLink>
              <MenuLink href="/list" onClick={() => setMenuOpen(false)}>
                LIST CARDS
              </MenuLink>
              <MenuLink href="/about" onClick={() => setMenuOpen(false)}>
                ABOUT
              </MenuLink>
              
              {/* Wallet Connection - prevents menu from closing */}
              <motion.div
                onTap={() => setMenuOpen(true)}
                onClick={() => setMenuOpen(true)}
                className="relative z-50"
              >
                <WalletConnection />
              </motion.div>
              {/* Close Button */}
              <motion.button
                className="mt-8 w-12 h-12 border-2  border-pikavault-yellow text-pikavault-yellow flex items-center justify-center font-black text-xl"
                whileTap={{ scale: 0.9 }}
                onTap={() => setMenuOpen(false)}
              >
                ×
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}


const HamburgerMenu = ({ menuOpen, setMenuOpen }: HamburgerMenuProps) => {
  return (
    <motion.button
      className="relative w-10 h-10 flex items-center justify-center bg-black/20 border-2 border-transparent sm:hover:border-pikavault-yellow/50 transition-colors duration-200"
      onTap={() => setMenuOpen(!menuOpen)}
      whileTap={{ scale: 0.9 }}
      whileHover={{ backgroundColor: "rgba(246,255,0,0.1)" }}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        {/* Top line */}
        <motion.div
          className="w-6 h-0.5 bg-pikavault-yellow mb-1"
          animate={{
            rotate: menuOpen ? 45 : 0,
            y: menuOpen ? 6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Middle line */}
        <motion.div
          className="w-6 h-0.5 bg-pikavault-yellow mb-1"
          animate={{
            opacity: menuOpen ? 0 : 1,
            x: menuOpen ? -10 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Bottom line */}
        <motion.div
          className="w-6 h-0.5 bg-pikavault-yellow"
          animate={{
            rotate: menuOpen ? -45 : 0,
            y: menuOpen ? -6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Geometric Border Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-pikavault-yellow opacity-0"
        animate={{
          opacity: menuOpen ? 1 : 0,
          scale: menuOpen ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

const MenuLink = ({ href, children, onClick }: MenuLinkProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href={href}
        className="text-2xl font-black text-white sm:hover:text-pikavault-yellow font-monument tracking-wider relative group"
        onClick={onClick}
      >
        {children}
        
        {/* Animated underline */}
        <motion.div
          className="absolute -bottom-2 left-0 h-1 bg-pikavault-yellow"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Geometric accent */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pikavault-yellow opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </motion.div>
  )
}