"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { WalletConnection } from "@/components/wallet-connection"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "COLLECTION", href: "/collection" },
    { name: "MARKETPLACE", href: "/marketplace" },
    { name: "ABOUT", href: "/about" },
    { name: "LIST", href: "/list" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrollPosition > 50 ? "bg-pikavault-dark/90 backdrop-blur-md py-3" : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-black text-pikavault-yellow tracking-wider relative group"
          style={{ fontFamily: "'Monument Extended', sans-serif" }}
        >
          PIKA
          <span className="text-white">VAULT</span>
          <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-pikavault-yellow group-hover:w-full transition-all duration-300"></span>
        </Link>

        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white hover:text-pikavault-yellow relative group text-lg font-medium tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pikavault-yellow group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          <WalletConnection />
        </nav>

        <div className="flex items-center space-x-4 lg:hidden">
          <button
            className="text-white hover:text-pikavault-yellow transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-pikavault-dark pt-24 px-6 z-40 md:hidden">
          <nav className="flex flex-col space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-pikavault-yellow text-2xl font-bold tracking-wider"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <WalletConnection />
          </nav>
        </div>
      )}
    </header>
  )
}
