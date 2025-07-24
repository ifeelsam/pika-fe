"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { HeroSection } from "@/components/about/hero-section"
import { MissionStatement } from "@/components/about/mission-statement"
import { ProcessVisualization } from "@/components/about/process-visualization"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      // Create scroll-triggered animations
      const sections = document.querySelectorAll(".section")
      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%", // Activate earlier when section is approaching
          end: "bottom 20%",
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        })
      })

      // Pre-activate the first step
      setActiveStep(0)

      // Custom cursor effect
      const cursor = document.createElement("div")
      cursor.classList.add("custom-cursor")
      cursor.style.cssText = `
  position: fixed;
  width: 20px;
  height: 20px;
  border: 2px solid #f6ff00;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  transition: width 0.3s, height 0.3s, border-color 0.3s;
  mix-blend-mode: difference;
`
      document.body.appendChild(cursor)

      // Hide default cursor on the page
      document.body.style.cursor = "none"

      const updateCursor = (e: MouseEvent) => {
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
      }

      window.addEventListener("mousemove", updateCursor)

      // Cleanup
      return () => {
        window.removeEventListener("mousemove", updateCursor)
        document.body.removeChild(cursor)
        document.body.style.cursor = "auto" // Restore default cursor
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative" data-page="about">
      <BackgroundEffects />
      <Navigation />

      <main ref={mainRef} className="relative z-10">
        <HeroSection />
        <MissionStatement />
        <ProcessVisualization activeStep={activeStep} />
      </main>

      <Footer />

      {/* Progress indicator */}
      <div className="fixed top-0 right-8 h-full w-6 z-20 pointer-events-none hidden md:block">
        <div className="h-full w-2 bg-white/10 mx-auto">
          <div
            className="w-full bg-pikavault-yellow"
            style={{
              height: `${(activeStep + 1) * 25}%`,
              transition: "height 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
            }}
          ></div>
        </div>
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`absolute w-6 h-6 left-0 transform -translate-x-1/2 transition-all duration-150 ${
              step <= activeStep ? "bg-pikavault-yellow" : "bg-white/20"
            }`}
            style={{ top: `${step * 25 + 25}%` }}
          ></div>
        ))}
      </div>
    </div>
  )
}
