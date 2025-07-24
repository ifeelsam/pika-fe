"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface ProcessStepProps {
  number: number
  title: string
  description: string
  technicalCallout: string
  color: string
  visualComponent: React.ReactNode
  isActive: boolean
  isLeft: boolean
}

export function ProcessStep({
  number,
  title,
  description,
  technicalCallout,
  color,
  visualComponent,
  isActive,
  isLeft,
}: ProcessStepProps) {
  const stepRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const calloutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (stepRef.current && numberRef.current && contentRef.current && calloutRef.current) {
        // Number animation
        gsap.from(numberRef.current, {
          scale: 0.5,
          opacity: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: stepRef.current,
            start: "top 90%", // Start earlier
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        })

        // Content animation
        gsap.from(contentRef.current, {
          x: isLeft ? -30 : 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.1, // Reduced delay from 0.3 to 0.1
          scrollTrigger: {
            trigger: stepRef.current,
            start: "top 90%", // Start earlier
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        })

        // Technical callout animation - horizontal scan effect
        const scanAnimation = () => {
          gsap.set(calloutRef.current, { x: -20, opacity: 0.7 })
          gsap.to(calloutRef.current, {
            x: 20,
            opacity: 1,
            duration: 0.2,
            onComplete: () => {
              gsap.to(calloutRef.current, {
                x: 0,
                opacity: 1,
                duration: 0.1,
              })
            },
          })
        }

        // Trigger scan effect when scrolled into view
        ScrollTrigger.create({
          trigger: calloutRef.current,
          start: "top 90%", // Start earlier
          onEnter: scanAnimation,
        })

        // Trigger scan effect periodically if step is active
        let scanInterval: NodeJS.Timeout
        if (isActive) {
          scanInterval = setInterval(() => {
            if (Math.random() > 0.7) {
              scanAnimation()
            }
          }, 4000)
        }

        return () => {
          if (scanInterval) clearInterval(scanInterval)
        }
      }
    }
  }, [isActive, isLeft])

  return (
    <div ref={stepRef} className={`section relative ${isLeft ? "md:text-left" : "md:text-right"}`}>
      {/* Step number */}
      <div
        ref={numberRef}
        className={`absolute ${isLeft ? "left-0" : "right-0"} -top-24 md:-top-32 z-10`}
        style={{ opacity: isActive ? 1 : 0.3, transition: "opacity 0.2s ease" }}
      >
        <div
          className="text-[200px] md:text-[300px] font-black leading-none"
          style={{
            fontFamily: "'Monument Extended', sans-serif",
            color,
            WebkitTextStroke: `2px ${color}`,
            WebkitTextFillColor: "transparent",
          }}
        >
          {number}
        </div>
      </div>

      {/* Step content */}
      <div
        ref={contentRef}
        className={`relative z-20 md:w-1/2 ${isLeft ? "md:ml-auto" : "md:mr-auto"} p-8 md:p-12`}
        style={{
          borderLeft: isLeft ? `4px solid ${color}` : "none",
          borderRight: !isLeft ? `4px solid ${color}` : "none",
          backgroundColor: `${color}10`,
          opacity: isActive ? 1 : 0.5,
          transition: "opacity 0.2s ease",
        }}
      >
        <div className="mb-8 h-48 md:h-64">{visualComponent}</div>

        <h3
          className="text-3xl md:text-4xl font-black mb-4"
          style={{
            fontFamily: "'Monument Extended', sans-serif",
            color,
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h3>

        <p
          className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>

        <div ref={calloutRef} className="inline-block relative overflow-hidden">
          <div
            className="text-xl md:text-2xl font-bold py-2 px-4"
            style={{
              fontFamily: "'Monument Extended', sans-serif",
              backgroundColor: color,
              color: "#0A0A0A",
            }}
          >
            {technicalCallout}
          </div>
          <div
            className="absolute top-0 left-0 w-full h-full bg-white opacity-20"
            style={{
              animation: isActive ? "scan 2s linear infinite" : "none",
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
