import { HeroSection } from "@/components/hero-section"
import { Navigation } from "@/components/navigation"
import { CardCollection } from "@/components/card-collection"
import { Footer } from "@/components/footer"
import { BackgroundEffects } from "@/components/background-effects"
import { MobileLanding } from "@/components/mobile/mobile-landing"

export default function Home() {
  return (
    <>
      <div className="block md:hidden">
        <MobileLanding />
      </div>

      <div className="hidden md:block min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />
      <HeroSection />
      <CardCollection />
      <Footer />
    </div>
    </>
  )
}
