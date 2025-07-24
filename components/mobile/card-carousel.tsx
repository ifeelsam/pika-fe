"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, animate } from "framer-motion"

export function FeaturedCardsCarousel() {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [cardPositions, setCardPositions] = useState<number[]>([])
  const [cardWidth, setCardWidth] = useState(288) // w-72 = 288px

  const collections = [
    {
      id: 1,
      name: "NEO THUNDER",
      description: "Electrifying power meets digital chaos",
      cards: [
        {
          id: "001",
          name: "PikaChu",
          rarity: "legendary",
          price: "15.2 SOL",
          imageUrl: "/electric-pokemon-card.png",
          owner: "0x...4f2a",
        },
        {
          id: "042", 
          name: "CYBER STRIKE",
          rarity: "epic",
          price: "8.7 SOL",
          imageUrl: "/cyber-pokemon-card.png",
          owner: "0x...8b1c",
        },
        {
          id: "107",
          name: "DIGITAL WAVE", 
          rarity: "rare",
          price: "3.4 SOL",
          imageUrl: "/digital-wave-pokemon-card.png",
          owner: "0x...9e3d",
        },
      ],
    },
    {
      id: 2,
      name: "PIXEL PULSE",
      description: "Retro aesthetics with futuristic energy",
      cards: [
        {
          id: "023",
          name: "NEON BLAST",
          rarity: "epic", 
          price: "7.8 SOL",
          imageUrl: "/neon-pokemon-card.png",
          owner: "0x...2f5a",
        },
        {
          id: "056",
          name: "PIXEL STORM",
          rarity: "rare",
          price: "4.1 SOL", 
          imageUrl: "/pixel-art-pokemon-storm-card.png",
          owner: "0x...6c8b",
        },
        {
          id: "089",
          name: "QUANTUM LEAP",
          rarity: "legendary",
          price: "18.9 SOL",
          imageUrl: "/quantum-leap-pokemon-card.png",
          owner: "0x...1a7f",
        },
      ],
    },
    {
      id: 3,
      name: "VOID RUNNERS",
      description: "Explore the digital abyss",
      cards: [
        {
          id: "112",
          name: "STATIC PULSE",
          rarity: "common",
          price: "1.2 SOL",
          imageUrl: "/static-electricity-card.png",
          owner: "0x...4e9c",
        },
        {
          id: "073",
          name: "GLITCH KING",
          rarity: "legendary",
          price: "22.3 SOL",
          imageUrl: "/glitch-king-pokemon-card.png",
          owner: "0x...7b2d",
        },
      ],
    },
  ]

  // Calculate drag constraints and progress
  useEffect(() => {
    const calculateConstraints = () => {
      // Add a small delay to ensure layout has settled
      setTimeout(() => {
        if (carouselRef.current && constraintsRef.current) {
          const carousel = carouselRef.current
          const container = constraintsRef.current
          
          // Calculate card width based on screen size
          const screenWidth = window.innerWidth
          const currentCardWidth = screenWidth < 640 ? 288 : 320 // w-72 vs w-80
          setCardWidth(currentCardWidth)
          
          const gap = 24 // gap-6 = 24px
          const cardWidthWithGap = currentCardWidth + gap
          const containerWidth = container.offsetWidth
          const paddingX = 24 // px-6 = 24px on each side
          
          // Calculate positions for each card
          const positions: number[] = []
          for (let i = 0; i < collections.length; i++) {
            positions.push(-(i * cardWidthWithGap))
          }
          setCardPositions(positions)
          
          // Calculate max drag constraint (last card position)
          const maxDrag = positions[positions.length - 1]
          setDragConstraints({ left: maxDrag, right: 0 })
        }
      }, 100)
    }
    
    calculateConstraints()
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateConstraints)
    return () => window.removeEventListener('resize', calculateConstraints)
  }, [collections])

  // Update progress based on current card index
  useEffect(() => {
    const progressPercent = collections.length > 1 
      ? (currentCardIndex / (collections.length - 1)) * 100 
      : 0
    setProgressValue(progressPercent)
  }, [currentCardIndex, collections.length])

  const snapToCard = (targetIndex: number) => {
    const targetPosition = cardPositions[targetIndex] || 0
    
    // Animate to the target position
    animate(x, targetPosition, {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.6
    })
    setCurrentCardIndex(targetIndex)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const currentX = x.get()
    const { offset, velocity } = info
    
    // Minimum drag distance to trigger card change (in pixels)
    const dragThreshold = cardWidth * 0.25 // 25% of card width
    // Minimum velocity to trigger card change
    const velocityThreshold = 500
    
    let targetIndex = currentCardIndex
    
    // Determine if we should move to next/previous card
    if (Math.abs(offset.x) > dragThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x < 0 || velocity.x < -velocityThreshold) {
        // Dragged left or fast swipe left - go to next card
        targetIndex = Math.min(currentCardIndex + 1, collections.length - 1)
      } else if (offset.x > 0 || velocity.x > velocityThreshold) {
        // Dragged right or fast swipe right - go to previous card
        targetIndex = Math.max(currentCardIndex - 1, 0)
      }
    }
    
    // Snap to the target card
    snapToCard(targetIndex)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "border-pikavault-yellow"
      case "epic": return "border-pikavault-pink"
      case "rare": return "border-pikavault-teal"
      default: return "border-white"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-pikavault-yellow/20"
      case "epic": return "bg-pikavault-pink/20"
      case "rare": return "bg-pikavault-teal/20"
      default: return "bg-white/20"
    }
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Section Header */}
      <motion.div
        className="px-6 mb-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-black text-white mb-4 font-monument">
          FEATURED <span className="text-pikavault-yellow">COLLECTIONS</span>
        </h2>
        <p className="text-white/70 text-lg font-space-grotesk">
          Swipe to explore our curated vault
        </p>
      </motion.div>

      {/* Progress Tracker */}
      <div className="px-6 mb-8">
        <div className="w-full h-2 bg-white/10 relative overflow-hidden">
          {/* Segmented progress bar */}
          <div className="absolute inset-0 flex">
            {collections.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-full border-r border-pikavault-dark last:border-r-0"
              />
            ))}
          </div>
          <motion.div
            className="h-full bg-pikavault-yellow"
            animate={{ width: `${Math.max(0, Math.min(100, progressValue))}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          />
        </div>
      </div>

      {/* Carousel Container */}
      <div ref={constraintsRef} className="relative overflow-hidden">
        <motion.div
          ref={carouselRef}
          className="flex gap-6 px-6"
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileDrag={{ cursor: "grabbing" }}
          dragMomentum={false}
          dragTransition={{ power: 0.2, timeConstant: 200 }}
        >
          {collections.map((collection, collectionIndex) => {
            const isActive = collectionIndex === currentCardIndex
            
            return (
              <motion.div
                key={collection.id}
                className="flex-shrink-0 w-72 sm:w-80"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: collectionIndex * 0.2 }}
                viewport={{ once: true }}
                animate={{
                  scale: isActive ? 1 : 0.95,
                  opacity: isActive ? 1 : 0.7
                }}
              >
              {/* Mini-Vault Container */}
              <div className="relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-4 border-pikavault-yellow rounded-2xl overflow-hidden">
                {/* Glass effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                
                {/* Collection Title */}
                <h3 className="text-xl font-black text-pikavault-yellow mb-2 font-monument">
                  {collection.name}
                </h3>
                <p className="text-white/70 text-sm mb-6 font-space-grotesk">
                  {collection.description}
                </p>

                {/* Card Stack */}
                <div className="relative h-48 mb-6">
                  {collection.cards.map((card, cardIndex) => {
                    const zIndex = collection.cards.length - cardIndex
                    const opacity = 1 - cardIndex * 0.15
                    const rotation = (cardIndex - 1) * 8
                    const offsetY = cardIndex * 12
                    const offsetX = cardIndex * 8

                    return (
                      <motion.div
                        key={card.id}
                        className="absolute cursor-pointer"
                        style={{
                          zIndex,
                          left: `calc(50% - 60px + ${offsetX}px)`,
                          top: `${offsetY}px`,
                          opacity,
                        }}
                        initial={{ opacity: 0, y: 50, rotateZ: rotation + 45 }}
                        whileInView={{ 
                          opacity, 
                          y: 0, 
                          rotateZ: rotation 
                        }}
                        transition={{ 
                          duration: 0.6, 
                          delay: cardIndex * 0.1 + collectionIndex * 0.2 
                        }}
                        viewport={{ once: true }}
                        whileHover={{ 
                          scale: 1.1, 
                          rotateZ: rotation + 5,
                          zIndex: 100 
                        }}
                        whileTap={{ scale: 0.95 }}
                        onTap={() => setSelectedCollection(collection.id)}
                      >
                        <div className={`w-24 aspect-[3/4] ${getRarityColor(card.rarity)} border-2 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden relative group`}>
                          {/* Card image */}
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Holographic effect that follows interaction */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 sm:group-hover:opacity-100 transform translate-x-full sm:group-hover:translate-x-0 transition-all duration-700" />
                          
                          {/* Front card has enhanced border */}
                          {cardIndex === 0 && (
                            <div className="absolute inset-0 border-4 border-pikavault-yellow animate-pulse" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Tap to Expand indicator */}
                <motion.button
                  className="w-full py-3 bg-pikavault-dark border-2 border-pikavault-yellow text-pikavault-yellow font-bold text-sm font-monument"
                  whileTap={{ scale: 0.95 }}
                  onTap={() => setSelectedCollection(collection.id)}
                >
                  TAP TO EXPAND
                </motion.button>
              </div>
            </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Card Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {collections.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 ${
              index === currentCardIndex ? "bg-pikavault-yellow" : "bg-white/30"
            } transition-colors duration-300`}
            whileTap={{ scale: 0.8 }}
            onTap={() => snapToCard(index)}
          />
        ))}
      </div>

      {/* Expanded Collection Modal */}
      <AnimatePresence>
        {selectedCollection && (
          <motion.div
            className="fixed inset-0 z-50 bg-pikavault-dark/95 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTap={() => setSelectedCollection(null)}
          >
            <motion.div
              className="w-full max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-pikavault-yellow p-6 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0, rotateY: -90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: 90 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onTap={(e) => e.stopPropagation()}
            >
              {(() => {
                const collection = collections.find(c => c.id === selectedCollection)
                if (!collection) return null

                return (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-pikavault-yellow font-monument">
                          {collection.name}
                        </h3>
                        <p className="text-white/70 font-space-grotesk">
                          {collection.description}
                        </p>
                      </div>
                      <button
                        className="text-white sm:hover:text-pikavault-yellow text-2xl"
                        onClick={() => setSelectedCollection(null)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      {collection.cards.map((card, index) => (
                        <motion.div
                          key={card.id}
                          className={`p-4 ${getRarityBg(card.rarity)} ${getRarityColor(card.rarity)} border-2 flex items-center gap-4`}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-16 aspect-[3/4] object-cover border-2 border-current"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-white font-monument text-sm">
                              {card.name}
                            </h4>
                            <p className="text-xs text-white/70 capitalize font-space-grotesk">
                              {card.rarity} • {card.owner}
                            </p>
                            <p className="text-pikavault-yellow font-bold font-monument">
                              {card.price}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
} 