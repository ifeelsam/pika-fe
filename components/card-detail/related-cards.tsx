"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { PikaCard } from "@/components/pika-card"

interface RelatedCardsProps {
  currentCard: any
}

export function RelatedCards({ currentCard }: RelatedCardsProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (sectionRef.current) {
        const cards = sectionRef.current.querySelectorAll(".related-card")

        gsap.from(cards, {
          y: 100,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }
  }, [])

  // Mock related cards data
  const relatedCards = [
    {
      id: "042",
      name: "CYBER STRIKE",
      rarity: "epic" as const,
      imageUrl: "/cyber-pokemon-card.png",
    },
    {
      id: "107",
      name: "DIGITAL WAVE",
      rarity: "rare" as const,
      imageUrl: "/digital-wave-pokemon-card.png",
    },
    {
      id: "023",
      name: "NEON BLAST",
      rarity: "epic" as const,
      imageUrl: "/neon-pokemon-card.png",
    },
    {
      id: "089",
      name: "QUANTUM LEAP",
      rarity: "legendary" as const,
      imageUrl: "/quantum-leap-pokemon-card.png",
    },
  ]

  return (
    <section ref={sectionRef} className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-12 font-monument">
          RELATED <span className="text-pikavault-yellow">CARDS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedCards.map((card, index) => (
            <div key={card.id} className="related-card">
              <PikaCard id={card.id} name={card.name} rarity={card.rarity} imageUrl={card.imageUrl} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
