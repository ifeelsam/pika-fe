"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { X, ZoomIn, ZoomOut } from "lucide-react"

interface CardInspectionModalProps {
  isOpen: boolean
  onClose: () => void
  card: any
  currentView: "front" | "back" | "holo"
  onViewChange: (view: "front" | "back" | "holo") => void
}

export function CardInspectionModal({ isOpen, onClose, card, currentView, onViewChange }: CardInspectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Modal animation
  useEffect(() => {
    if (modalRef.current) {
      if (isOpen) {
        gsap.set(modalRef.current, { opacity: 0, scale: 0.8 })
        gsap.to(modalRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        })
      } else {
        gsap.to(modalRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: "power2.in",
        })
      }
    }
  }, [isOpen])

  // Get current image URL
  const getCurrentImageUrl = () => {
    switch (currentView) {
      case "back":
        return card.backImageUrl
      case "holo":
        return card.holographicImageUrl
      default:
        return card.imageUrl
    }
  }

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    const newZoom = direction === "in" ? Math.min(zoom * 1.5, 4) : Math.max(zoom / 1.5, 1)
    setZoom(newZoom)

    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          if (currentView === "back") onViewChange("front")
          else if (currentView === "holo") onViewChange("back")
          break
        case "ArrowRight":
          if (currentView === "front") onViewChange("back")
          else if (currentView === "back" && card.rarity === "legendary") onViewChange("holo")
          break
        case "+":
        case "=":
          handleZoom("in")
          break
        case "-":
          handleZoom("out")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentView, onClose, onViewChange, card.rarity])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div ref={modalRef} className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-2xl font-black font-monument">
            CARD INSPECTION
          </h2>

          <div className="flex items-center space-x-4">
            {/* View controls */}
            <div className="flex space-x-2">
              <button
                onClick={() => onViewChange("front")}
                className={`px-3 py-1 border transition-all duration-300 ${
                  currentView === "front"
                    ? "bg-pikavault-yellow border-pikavault-yellow text-pikavault-dark"
                    : "bg-transparent border-white/30 text-white sm:hover:border-white/60"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                FRONT
              </button>

              <button
                onClick={() => onViewChange("back")}
                className={`px-3 py-1 border transition-all duration-300 ${
                  currentView === "back"
                    ? "bg-pikavault-yellow border-pikavault-yellow text-pikavault-dark"
                    : "bg-transparent border-white/30 text-white sm:hover:border-white/60"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                BACK
              </button>

              {card.rarity === "legendary" && (
                <button
                  onClick={() => onViewChange("holo")}
                  className={`px-3 py-1 border transition-all duration-300 ${
                    currentView === "holo"
                      ? "bg-pikavault-yellow border-pikavault-yellow text-pikavault-dark"
                      : "bg-transparent border-white/30 text-white sm:hover:border-white/60"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  HOLO
                </button>
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom("out")}
                disabled={zoom <= 1}
                className="p-2 border border-white/30 text-white sm:hover:border-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-white px-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={() => handleZoom("in")}
                disabled={zoom >= 4}
                className="p-2 border border-white/30 text-white sm:hover:border-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 border border-white/30 text-white sm:hover:border-white/60 sm:hover:text-pikavault-pink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card display */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div
            ref={cardRef}
            className="relative cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.3s ease",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={getCurrentImageUrl() || "/placeholder.svg"}
              alt={`${card.name} - ${currentView}`}
              className="max-w-none h-[80vh] object-contain"
              draggable={false}
            />

            {/* Condition details overlay */}
            {zoom > 2 && (
              <div className="absolute top-4 left-4 bg-black/80 p-2 border border-pikavault-yellow">
                <p className="text-xs text-pikavault-yellow" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {card.conditionDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex justify-between items-center text-white/70">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Use arrow keys to navigate • +/- to zoom • Drag to pan when zoomed
            </p>

            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Authentication watermarks visible at 200%+ zoom</p>
          </div>
        </div>
      </div>
    </div>
  )
}
