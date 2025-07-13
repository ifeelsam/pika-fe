"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ExternalLink, User } from "lucide-react"
import { NETWORK } from "@/lib/anchor/config"

interface OwnershipHistoryProps {
  history: Array<{
    owner: string
    date: string
    price: number
    txHash: string
  }>
}

export function OwnershipHistory({ history }: OwnershipHistoryProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (sectionRef.current) {
        const items = sectionRef.current.querySelectorAll(".history-item")

        gsap.from(items, {
          y: 50,
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

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <section ref={sectionRef} className="py-16">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-4xl font-black mb-12 font-monument">
          OWNERSHIP <span className="text-pikavault-yellow">HISTORY</span>
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-1 bg-pikavault-yellow/30"></div>

          <div className="space-y-8">
            {history.map((entry, index) => (
              <div key={index} className="history-item relative flex items-center space-x-8">
                {/* Timeline dot */}
                <div className="relative z-10">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-pikavault-yellow flex items-center justify-center">
                    <User className="w-8 h-8 text-pikavault-dark" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white/5 border border-white/20 p-6">
                  <div className="md:flex md:justify-between md:items-start">
                    <div>
                      <p className="text-md md:text-xl font-bold mb-2 font-monument">
                        {truncateAddress(entry.owner)}
                      </p>
                      <p className="text-white/70 text-sm font-space-grotesk">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="mt-6 md:mt-0 md:text-right">
                      <p
                        className="text-xl md:text-2xl font-black text-pikavault-cyan mb-2 font-monument"
                      >
                        {entry.price} SOL
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${entry.txHash}?cluster=${NETWORK}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-white/70 md:hover:text-pikavault-yellow transition-colors"
                      >
                        <span className="text-xs md:text-sm font-space-grotesk">
                          View TX
                        </span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
