"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      gsap.set(headlineRef.current, { opacity: 1 })
      // Headline animation
      const pikaChars = gsap.utils.toArray(".pika-char")
      const vaultChars = gsap.utils.toArray(".vault-char")

      gsap.from(pikaChars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 1,
        ease: "back.out(1.7)",
      })

      gsap.from(vaultChars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        stagger: 0.02,
        duration: 1,
        delay: 0.2,
        ease: "back.out(1.7)",
      })

      // Subheading animation
      gsap.fromTo(subheadlineRef.current, {
        opacity: 0,
        y: 30,
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out",
      })

      // Button animation 
      gsap.fromTo(buttonRef.current, {
        scale: 0.8,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        duration: 1,
        delay: 0.8,
        ease: "elastic.out(1, 0.5)",
      })

      // Scroll animation
      gsap.to(headlineRef.current, {
        scrollTrigger: {
          trigger: headlineRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
        letterSpacing: "0.2em",
        filter: "blur(0px)",
        duration: 1,
      })
    }
  }, [])

  // Split text into characters for animation with different classes for PIKA and VAULT
  const splitText = (text: string, isVault = false) => {
    const charClass = isVault ? "vault-char" : "pika-char"
    return text.split("").map((char, index) => (
      <span key={index} className={`${charClass} inline-block`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ))
  }

  return (
    <section className="relative h-screen flex flex-col justify-center items-start px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-pikavault-dark z-[-1]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pikavault-pink/10 via-transparent to-pikavault-cyan/10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(246,255,0,0.05)_0%,transparent_30%)]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <h1
          ref={headlineRef}
          className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 leading-none tracking-tight filter blur-[1px] transition-all duration-300 font-monument opacity-0"
        >
          <span className="text-white">{splitText("PIKA")}</span>
          <span className="text-pikavault-yellow">{splitText("VAULT", true)}</span>
        </h1>

        <p
          ref={subheadlineRef}
          className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl font-space-grotesk opacity-0"
        >
          The next evolution in digital collectibles.
        </p>

        <div ref={buttonRef} className="relative group opacity-0">
          <Button
            onClick={() => redirect("/marketplace")}
            className="bg-pikavault-yellow sm:hover:bg-pikavault-yellow/90 text-pikavault-dark text-lg md:text-xl font-bold py-6 px-12 rounded-none transition-all duration-300 overflow-hidden group-sm:hover:translate-x-1 group-sm:hover:-translate-y-1 font-monument"
          >
            EXPLORE COLLECTION
            <span className="absolute inset-0 bg-pikavault-pink mix-blend-overlay opacity-0 group-sm:hover:opacity-30 transition-opacity duration-300"></span>
          </Button>
          <div className="absolute inset-0 border-2 border-pikavault-yellow -z-10 translate-x-2 translate-y-2 group-sm:hover:translate-x-4 group-sm:hover:translate-y-4 transition-all duration-300"></div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="text-pikavault-yellow animate-bounce mb-2">↓</span>
        <p className="text-sm opacity-60 font-space-grotesk">
          SCROLL TO EXPLORE
        </p>
      </div>
    </section>
  )
}
