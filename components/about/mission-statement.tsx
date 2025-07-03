"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function MissionStatement() {
  const sectionRef = useRef<HTMLElement>(null)
  const statementRef = useRef<HTMLHeadingElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (sectionRef.current && statementRef.current && statsRef.current) {
        // Mission statement animation
        gsap.from(statementRef.current, {
          opacity: 0,
          y: 100,
          duration: 1,
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        })

        // Stats animation
        const stats = statsRef.current.querySelectorAll(".stat-item")
        gsap.from(stats, {
          opacity: 0,
          y: 50,
          stagger: 0.2,
          duration: 0.8,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        })

        // Diagonal slashes animation
        const slashes = document.querySelectorAll(".diagonal-slash")
        slashes.forEach((slash) => {
          gsap.from(slash, {
            width: 0,
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: slash,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          })
        })
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32 relative"
    >
      <div className="container mx-auto relative z-10">
        <div className="relative mb-16">
          <h2
            ref={statementRef}
            className="text-5xl md:text-7xl lg:text-[87px] font-black leading-none tracking-tight relative z-10"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            <span className="text-white">PHYSICAL CARDS.</span>
            <br />
            <span className="text-pikavault-yellow">DIGITAL OWNERSHIP.</span>
            <br />
            <span className="text-white">ABSOLUTE SECURITY.</span>
          </h2>

          {/* Diagonal slashes */}
          <div className="diagonal-slash absolute top-0 right-1/4 w-full h-4 bg-pikavault-pink transform rotate-12 origin-left -z-10"></div>
          <div className="diagonal-slash absolute bottom-[95%] left-1/4 w-full h-4 bg-pikavault-pink transform -rotate-12 origin-right -z-10"></div>
        </div>

        <div className="max-w-4xl mx-auto my-24">
          <p
            className="text-xl md:text-2xl text-white/70 tracking-wide leading-relaxed"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            PikaVault bridges the gap between physical collectibles and digital ownership through our revolutionary
            blockchain-based platform. We've created a secure ecosystem where traders can buy, sell, and authenticate
            rare cards with absolute confidence. Every transaction is protected by our multi-layer security protocol,
            ensuring authenticity and safe delivery.
          </p>
        </div>

        {/* Trust statistics */}
        {/* <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24">
          <div className="stat-item">
            <p className="text-white/50 text-xl mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              TOTAL TRADES
            </p>
            <h3
              className="text-5xl md:text-7xl font-black text-pikavault-yellow"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              10,547+
            </h3>
          </div>

          <div className="stat-item">
            <p className="text-white/50 text-xl mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AVERAGE RATING
            </p>
            <h3
              className="text-5xl md:text-7xl font-black text-pikavault-yellow"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              4.9/5
            </h3>
          </div>

          <div className="stat-item">
            <p className="text-white/50 text-xl mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SUCCESS RATE
            </p>
            <h3
              className="text-5xl md:text-7xl font-black text-pikavault-yellow"
              style={{ fontFamily: "'Monument Extended', sans-serif" }}
            >
              99.8%
            </h3>
          </div>
        </div> */}
      </div>
    </section>
  )
}
