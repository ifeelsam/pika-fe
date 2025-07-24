"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { redirect } from "next/navigation"

export function Footer() {
  const [sparkingIcon, setSparkingIcon] = useState<string | null>(null)

  const footerLinks = [
    { name: "TERMS", href: "/terms" },
    { name: "PRIVACY", href: "/privacy" },
    { name: "CONTACT", href: "/contact" },
  ]

  const socialIcons = [
    { 
      name: "twitter", 
      href: "https://twitter.com/pikavault_",
      icon: "𝕏"
    },
    { 
      name: "discord", 
      href: "https://discord.gg/pikavault",
      icon: "⚔️"
    },
    { 
      name: "telegram", 
      href: "https://t.me/pikavault",
      icon: "📱"
    },
  ]

  const handleSocialClick = (iconName: string, redirectURI: string) => {
    setSparkingIcon(iconName)
    setTimeout(() => { 
      setSparkingIcon(null)
      redirect(redirectURI)
    }, 1000)
  }

  const SparkEffect = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return null

    return (
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pikavault-yellow"
            style={{
              left: "50%",
              top: "50%",
            }}
            initial={{ 
              scale: 0, 
              x: 0, 
              y: 0, 
              opacity: 1 
            }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(i * 45 * Math.PI / 180) * 20,
              y: Math.sin(i * 45 * Math.PI / 180) * 20,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.05,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    )
  }

  return (
    <footer className="relative py-16 px-6 mb-24 bg-pikavault-dark overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <motion.svg 
          className="w-full h-full" 
          viewBox="0 0 400 200" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern 
              id="grid-pattern" 
              x="0" 
              y="0" 
              width="40" 
              height="40" 
              patternUnits="userSpaceOnUse"
            >
              <motion.path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-pikavault-yellow"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </motion.svg>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 border-2 border-pikavault-teal"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Footer Content */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-black text-pikavault-yellow mb-4 font-monument">
            DIGITAL VAULT BASE
          </h3>
          <p className="text-white/70 font-space-grotesk">
            Secure. Verified. Forever.
          </p>
        </motion.div>

        {/* Links Section */}
        <motion.div
          className="flex justify-center items-center gap-1 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {footerLinks.map((link, index) => (
            <div key={link.name} className="flex items-center">
              <motion.a
                href={link.href}
                className="text-pikavault-teal sm:hover:text-pikavault-yellow font-bold text-sm font-monument px-3 py-2 transition-colors duration-300"
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
              </motion.a>
              
              {/* Geometric divider */}
              {index < footerLinks.length - 1 && (
                <div className="w-1 h-6 bg-pikavault-teal mx-1">
                  <motion.div
                    className="w-full h-full bg-pikavault-yellow"
                    animate={{
                      scaleY: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Social Icons */}
        <motion.div
          className="flex justify-center items-center gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {socialIcons.map((social) => (
            <motion.button
              key={social.name}
              className="relative w-12 h-12 bg-pikavault-dark border-2 border-pikavault-yellow flex items-center justify-center text-pikavault-yellow sm:hover:bg-pikavault-yellow sm:hover:text-pikavault-dark transition-all duration-300 group"
              whileTap={{ scale: 0.9 }}
              onTap={() => handleSocialClick(social.name, social.href)}
            >
              <span className="text-xl font-bold">
                {social.icon}
              </span>
              
              {/* Spark effect */}
              <SparkEffect isActive={sparkingIcon === social.name} />
              
              {/* Hover geometric effect */}
              <div className="absolute -inset-1 border-2 border-pikavault-yellow opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-pikavault-yellow"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pikavault-yellow"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pikavault-yellow"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pikavault-yellow"></div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="text-center border-t border-pikavault-teal/30 pt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-white/50 text-sm font-space-grotesk mb-2">
            © 2025 PikaVault. All rights reserved.
          </p>
          <p className="text-white/30 text-xs font-space-grotesk">
            Built on Solana • Secured by blockchain
          </p>
        </motion.div>

        {/* Vault door closing indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-2 h-2 bg-pikavault-yellow"></div>
          <div className="w-8 h-0.5 bg-pikavault-yellow"></div>
          <div className="w-2 h-2 bg-pikavault-yellow"></div>
        </motion.div>
      </div>
    </footer>
  )
} 