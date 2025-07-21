"use client"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PriceChartProps {
  data: Array<{ date: string; price: number }>
  currentPrice: number
}

export function PriceChart({ data, currentPrice }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      if (chartRef.current && pathRef.current) {
        // Animate chart path
        const pathLength = pathRef.current.getTotalLength()
        gsap.set(pathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        })

        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: chartRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        })
      }
    }
  }, [])

  // Calculate price change
  const firstPrice = data[0]?.price || 0
  const lastPrice = data[data.length - 1]?.price || 0
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100
  const isPositive = priceChange >= 0

  // Generate SVG path
  const generatePath = () => {
    if (data.length < 2) return ""

    const width = 800
    const height = 200
    const padding = 40

    const minPrice = Math.min(...data.map((d) => d.price))
    const maxPrice = Math.max(...data.map((d) => d.price))
    const priceRange = maxPrice - minPrice

    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding)
      return `${x},${y}`
    })

    return `M ${points.join(" L ")}`
  }

  return (
    <section ref={chartRef} className="py-16">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2
            className="text-3xl md:text-4xl font-black mb-4"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            PRICE <span className="text-pikavault-yellow">HISTORY</span>
          </h2>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {isPositive ? (
                <TrendingUp className="w-6 h-6 text-pikavault-cyan" />
              ) : (
                <TrendingDown className="w-6 h-6 text-pikavault-pink" />
              )}
              <span
                className={`text-2xl font-black ${isPositive ? "text-pikavault-cyan" : "text-pikavault-pink"}`}
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {isPositive ? "+" : ""}
                {priceChange.toFixed(1)}%
              </span>
            </div>

            <div className="text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              30-day performance
            </div>
          </div>
        </div>

        <div className="relative bg-pikavault-dark border-4 border-white/20 p-8">
          <svg width="100%" height="300" viewBox="0 0 800 200" className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Price line */}
            <path
              ref={pathRef}
              d={generatePath()}
              fill="none"
              stroke={isPositive ? "#00F5FF" : "#FF2D55"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((point, index) => {
              const width = 800
              const height = 200
              const padding = 40
              const minPrice = Math.min(...data.map((d) => d.price))
              const maxPrice = Math.max(...data.map((d) => d.price))
              const priceRange = maxPrice - minPrice

              const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
              const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding)

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={isPositive ? "#00F5FF" : "#FF2D55"}
                  className="sm:hover:r-6 transition-all duration-200"
                />
              )
            })}
          </svg>

          {/* Price labels */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="text-right">
              <p className="text-white/50 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Current Price
              </p>
              <p className="text-xl md:text-3xl font-black text-pikavault-yellow font-monument">
                {currentPrice} SOL
              </p>
            </div>
          </div>
        </div>

        {/* Price data table */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.map((point, index) => (
            <div key={index} className="bg-white/5 p-4 border border-white/10">
              <p className="text-white/70 text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {new Date(point.date).toLocaleDateString()}
              </p>
              <p className="text-lg font-bold font-monument">
                {parseFloat(point.price.toFixed(4))} SOL
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
