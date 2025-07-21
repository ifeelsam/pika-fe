"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { redirect } from "next/navigation"

export function CardCollection() {
  const sectionRef = useRef<HTMLElement>(null)
  const horizontalRef = useRef<HTMLDivElement>(null)
  const topProgressRef = useRef<HTMLDivElement>(null)
  const bottomProgressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger)

    const sectionElement = sectionRef.current
    const horizontalElement = horizontalRef.current
    const topProgressElement = topProgressRef.current
    const bottomProgressElement = bottomProgressRef.current

    if (!sectionElement || !horizontalElement) return

    // Create the main horizontal scroll animation
    const horizontalScrollTween = gsap.to(horizontalElement, {
      x: () => -(horizontalElement.scrollWidth - window.innerWidth - window.innerWidth * 1.2),
      ease: "none",
      scrollTrigger: {
        trigger: sectionElement,
        start: "top top",
        end: () => `+=${horizontalElement.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Update progress bars based on scroll position
          if (topProgressElement) {
            topProgressElement.style.width = `${self.progress * 100}%`
          }
          if (bottomProgressElement) {
            bottomProgressElement.style.width = `${self.progress * 100}%`
          }
        },
      },
    })

    // Clean up all ScrollTrigger instances when component unmounts
    return () => {
      horizontalScrollTween.kill()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Collection data
  const collections = [
    {
      id: "neo-thunder",
      name: "NEO THUNDER",
      description: "Electrifying power meets digital chaos",
      cards: [
        {
          id: "001",
          name: "ELECTRIC SURGE",
          rarity: "legendary",
          imageUrl: "/electric-pokemon-card.png",
          rotation: -8,
        },
        { id: "042", name: "CYBER STRIKE", rarity: "epic", imageUrl: "/cyber-pokemon-card.png", rotation: 5 },
        { id: "107", name: "DIGITAL WAVE", rarity: "rare", imageUrl: "/digital-wave-pokemon-card.png", rotation: -3 },
      ],
    },
    {
      id: "pixel-pulse",
      name: "PIXEL PULSE",
      description: "Retro aesthetics with futuristic energy",
      cards: [
        {
          id: "023",
          name: "NEON BLAST",
          rarity: "epic",
          imageUrl: "/neon-pokemon-card.png",
          rotation: 7,
        },
        {
          id: "056",
          name: "PIXEL STORM",
          rarity: "rare",
          imageUrl: "/pixel-art-pokemon-storm-card.png",
          rotation: -5,
        },
        {
          id: "089",
          name: "QUANTUM LEAP",
          rarity: "legendary",
          imageUrl: "/quantum-leap-pokemon-card.png",
          rotation: 2,
        },
      ],
    },
    {
      id: "void-runners",
      name: "VOID RUNNERS",
      description: "Explore the digital abyss",
      cards: [
        {
          id: "112",
          name: "STATIC PULSE",
          rarity: "common",
          imageUrl: "/static-electricity-card.png",
          rotation: -6,
        },
        {
          id: "073",
          name: "VOID RUNNER",
          rarity: "epic",
          imageUrl: "/placeholder-oai5n.png",
          rotation: 4,
        },
        {
          id: "118",
          name: "GLITCH KING",
          rarity: "legendary",
          imageUrl: "/glitch-king-pokemon-card.png",
          rotation: -2,
        },
      ],
    },
  ]

  return (
    <section ref={sectionRef} id="collection" className="relative min-h-screen bg-pikavault-dark">
      {/* Progress bar that fills based on scroll position */}
      <div className="absolute top-0 left-0 w-full h-2 z-20">
        <div className="w-full h-full bg-white/10">
          <div
            ref={topProgressRef}
            className="h-full bg-pikavault-cyan"
            style={{
              width: "0%",
              transition: "width 0.1s ease-out",
            }}
          ></div>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full py-20 px-6 md:px-12 lg:px-24 z-10">
        <h2
          className="text-3xl md:text-5xl font-black text-white mb-4"
          style={{ fontFamily: "'Monument Extended', sans-serif" }}
        >
          FEATURED <span className="text-pikavault-yellow">COLLECTION</span>
        </h2>
        <p className="text-white/70 max-w-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Explore our curated selection of digital collectibles featuring Neo-Brutalist Maximalism design. Scroll
          horizontally to discover more.
        </p>
      </div>

      <div ref={horizontalRef} className="absolute top-0 left-0 h-screen w-[400%] flex items-center pl-[10vw] pt-40">
        {collections.map((collection, collectionIndex) => (
          <div key={collection.id} className="relative min-w-[80vw] h-full flex flex-col justify-center px-12">
            <div className="relative h-[500px] mb-12">
              {/* Card cluster */}
              <div className="relative w-full h-full">
                {collection.cards.map((card, cardIndex) => {
                  // Calculate z-index, opacity, and position based on card index
                  const zIndex = collection.cards.length - cardIndex
                  const opacity = 1 - cardIndex * 0.15
                  const offsetX = cardIndex * 60
                  const offsetY = cardIndex * 20

                  return (
                    <motion.div
                      key={card.id}
                      className="absolute"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: opacity, y: 0 }}
                      transition={{ duration: 0.5, delay: cardIndex * 0.1 }}
                      viewport={{ once: true }}
                      style={{
                        zIndex,
                        left: `calc(50% - 160px + ${offsetX}px)`,
                        top: `calc(50% - 200px + ${offsetY}px)`,
                        transform: `rotate(${card.rotation}deg)`,
                      }}
                    >
                      <div className="group relative w-[320px] aspect-[3/4] cursor-pointer transition-all duration-500 sm:hover:scale-105">
                        <div
                          className="absolute inset-0 rounded-none bg-pikavault-dark border-4 transition-all duration-300 overflow-hidden transform-gpu"
                          style={{
                            borderColor:
                              card.rarity === "legendary"
                                ? "#F6FF00"
                                : card.rarity === "epic"
                                  ? "#FF2D55"
                                  : card.rarity === "rare"
                                    ? "#00F5FF"
                                    : "#FFFFFF",
                            boxShadow: `15px 15px 0px 0px rgba(10,10,10,1)`,
                          }}
                        >
                          <div className="relative w-full h-full overflow-hidden">
                            {/* Card image */}
                            <div
                              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-sm:hover:scale-105"
                              style={{
                                backgroundImage: `url(${card.imageUrl})`,
                              }}
                            />

                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pikavault-dark/90"></div>

                            {/* Card content */}
                            <div className="absolute bottom-0 left-0 w-full p-4">
                              <div className="flex justify-between items-end">
                                <h3
                                  className="text-white text-xl font-bold leading-tight"
                                  style={{ fontFamily: "'Monument Extended', sans-serif" }}
                                >
                                  {card.name}
                                </h3>
                                <div
                                  className={`uppercase text-xs font-bold px-2 py-1 ${card.rarity === "legendary"
                                    ? "bg-pikavault-yellow text-black"
                                    : card.rarity === "epic"
                                      ? "bg-pikavault-pink text-white"
                                      : card.rarity === "rare"
                                        ? "bg-pikavault-cyan text-black"
                                        : "bg-white text-black"
                                    }`}
                                >
                                  {card.rarity}
                                </div>
                              </div>

                              <div className="mt-2 flex justify-between items-center">
                                <p
                                  className="text-white/70 text-sm"
                                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                  #{card.id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Collection info */}
              <div className="absolute bottom-0 left-0 transform translate-y-full mt-8">
                <h3
                  className="text-3xl md:text-4xl font-black text-white mb-2"
                  style={{ fontFamily: "'Monument Extended', sans-serif" }}
                >
                  {collection.name}
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-[3px] bg-pikavault-pink mr-4"></div>
                  <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col items-start justify-center h-full space-y-8 pl-6 min-w-[40vw]">
          <h3
            className="text-2xl md:text-4xl font-black text-white"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            DISCOVER
            <br />
            MORE
            <br />
            <span className="text-pikavault-yellow">CARDS</span>
          </h3>

          <Button
            onClick={() => redirect("/marketplace")}
            className="bg-pikavault-pink sm:hover:bg-pikavault-pink/90 text-white text-lg font-bold py-6 px-12 rounded-none transition-all duration-300 overflow-hidden"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            VIEW ALL
          </Button>
        </div>
      </div>

      {/* Scroll indicators */}
      <div className="absolute bottom-12 right-12 z-10 hidden md:flex items-center space-x-4">
        <div className="w-32 h-[6px] bg-white/10 relative overflow-hidden">
          <div
            ref={bottomProgressRef}
            className="absolute top-0 left-0 h-full bg-pikavault-cyan"
            style={{
              width: "0%",
              transition: "width 0.1s ease-out",
            }}
          ></div>
        </div>
        <p className="text-white/70 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          SCROLL TO EXPLORE
        </p>
      </div>
    </section>
  )
}
