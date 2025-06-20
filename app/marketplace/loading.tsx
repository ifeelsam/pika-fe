import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/marketplace/background-effects"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function MarketplaceLoading() {
  const cardCols = 4 // Based on xl:grid-cols-4 for cards
  const filterOptionCols = 3 // Based on the number of filter options per group

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        {/* Skeleton for MarketplaceHeader */}
        <div className="mb-12">
          {/* Title Skeleton */}
          <div
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            <Skeleton
              className="h-16 md:h-24 lg:h-28 w-3/4 md:w-1/2 bg-zinc-800/60 animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <Skeleton
              className="h-16 md:h-24 lg:h-28 w-1/2 md:w-1/3 bg-zinc-800/60 animate-pulse mt-2"
              style={{ animationDelay: "50ms" }}
            />
          </div>

          {/* Search Bar Skeleton */}
          <div className="flex justify-end -mt-20 md:-mt-24 lg:-mt-32 mb-12 relative z-10">
            <div className="w-full max-w-md relative">
              <Skeleton
                className="absolute inset-0 bg-zinc-800/40 transform translate-x-2 translate-y-2 animate-pulse"
                style={{ animationDelay: "100ms" }}
              />
              <div className="relative flex items-center border-4 border-zinc-700/60 bg-[#0A0A0A]">
                <Search className="w-6 h-6 ml-4 text-zinc-600/60" />
                <Skeleton
                  className="h-10 w-full bg-transparent py-4 px-3 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton for FilterBar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <Skeleton
              className="h-8 w-32 bg-zinc-800/60 animate-pulse"
              style={{ fontFamily: "'Monument Extended', sans-serif", animationDelay: "200ms" }}
            />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-20 bg-zinc-800/60 animate-pulse" style={{ animationDelay: "250ms" }} />
              <Skeleton className="h-6 w-24 bg-zinc-800/60 animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
          </div>

          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex space-x-6 min-w-max">
              {/* Filter Group Skeleton */}
              {Array.from({ length: 3 }).map((_, filterGroupIndex) => (
                <div key={filterGroupIndex} className="space-y-3">
                  <Skeleton
                    className="h-4 w-20 bg-zinc-800/60 animate-pulse"
                    style={{ animationDelay: `${350 + filterGroupIndex * 150}ms` }}
                  />
                  <div className="flex space-x-3">
                    {Array.from({ length: filterOptionCols }).map((_, optionIndex) => (
                      <Skeleton
                        key={optionIndex}
                        className="h-12 w-28 border-4 border-zinc-700/60 bg-zinc-800/60 animate-pulse"
                        style={{ animationDelay: `${400 + filterGroupIndex * 150 + optionIndex * 75}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton for CardGrid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, index) => {
            const offsetX = index % 3 === 0 ? "-10px" : index % 3 === 1 ? "10px" : "0px"
            const offsetY = index % 2 === 0 ? "-15px" : "15px"
            const rowIndex = Math.floor(index / cardCols)
            const colIndex = index % cardCols
            const waveDelay = rowIndex * 200 + colIndex * 100 + 500 // Base delay for card grid + stagger

            return (
              <div
                key={index}
                className="relative"
                style={{
                  transform: `translateX(${offsetX}) translateY(${offsetY})`,
                }}
              >
                <div
                  className="relative animate-pulse" // Apply pulse to the container to make children pulse together
                  style={{
                    transform: `rotate(${Math.random() * 6 - 3}deg)`,
                    animationDelay: `${waveDelay}ms`,
                  }}
                >
                  {/* Card container skeleton */}
                  <div
                    className="relative bg-zinc-800/30 border-4 border-zinc-700/60 overflow-hidden"
                    style={{
                      boxShadow: "15px 15px 0px 0px rgba(30,30,30,0.5)", // Darker shadow
                    }}
                  >
                    {/* Card image skeleton */}
                    <Skeleton className="w-full aspect-[3/4] bg-zinc-800/60" />{" "}
                    {/* No individual pulse, inherits from parent */}
                    {/* Rarity indicator skeleton */}
                    <Skeleton
                      className="absolute top-3 left-3 w-6 h-6 bg-zinc-700/70"
                      style={{ clipPath: "circle(50% at 50% 50%)" }}
                    />
                    {/* Card content skeleton */}
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <Skeleton className="h-6 w-3/4 bg-zinc-700/70 mb-2" />
                      <Skeleton className="h-4 w-1/2 bg-zinc-700/70" />
                    </div>
                    {/* Price tag skeleton */}
                    <div
                      className="absolute -top-2 -right-2 bg-zinc-800/60 border-4 border-zinc-700/60 px-3 py-1 transform rotate-12 z-20"
                      style={{
                        boxShadow: `5px 5px 0px 0px rgba(30,30,30,0.5)`, // Darker shadow
                      }}
                    >
                      <Skeleton className="h-6 w-12 bg-zinc-700/70" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
