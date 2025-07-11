"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FloatingNavigation } from "./floating-navigation"
import { HeroCardStack } from "./hero-card-stack"
import { FeaturedCardsCarousel } from "./card-carousel"
import { Features } from "./features"
import { ProcessTimeline } from "./process-timeline"
import { Footer } from "./footer"

export function MobileLanding() {

  return (
    <div className="min-h-screen bg-pikavault-dark text-white relative overflow-x-hidden">
      <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >

            <FloatingNavigation />
            <HeroCardStack />
            <FeaturedCardsCarousel />
            <Features />
            <ProcessTimeline />
            <Footer />

          </motion.div>
      </AnimatePresence>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pikavault-pink/5 via-transparent to-pikavault-cyan/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-[radial-gradient(circle,rgba(246,255,0,0.03)_0%,transparent_40%)]"></div>
      </div>
    </div>
  )
} 