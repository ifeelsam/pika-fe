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
        <h2 className="text-3xl md:text-4xl font-black mb-12" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          OWNERSHIP <span className="text-pikavault-yellow">HISTORY</span>
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-pikavault-yellow/30"></div>

          <div className="space-y-8">
            {history.map((entry, index) => (
              <div key={index} className="history-item relative flex items-center space-x-8">
                {/* Timeline dot */}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-pikavault-yellow flex items-center justify-center">
                    <User className="w-8 h-8 text-pikavault-dark" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white/5 border border-white/20 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-bold mb-2" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                        {truncateAddress(entry.owner)}
                      </p>
                      <p className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-2xl font-black text-pikavault-cyan mb-2"
                        style={{ fontFamily: "'Monument Extended', sans-serif" }}
                      >
                        ${entry.price}
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${entry.txHash}?cluster=${NETWORK}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-white/70 hover:text-pikavault-yellow transition-colors"
                      >
                        <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
