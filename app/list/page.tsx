"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { UploadZone } from "@/components/listing/upload-zone"
import { CardInformationPanel } from "@/components/listing/card-information-panel"
import { ListingPreview } from "@/components/listing/listing-preview"
import { VerificationProcess } from "@/components/listing/verification-process"
import { PublishConfirmation } from "@/components/listing/publish-confirmation"
import { CustomToast } from "@/components/ui/custom-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { gsap } from "gsap"
import { useAnchorProgram } from "@/lib/anchor/client"
import { 
  registerUser, 
  createUmiInstance,
  mintNFTWithUmi,
  listNFT,
  getUserAccount,
  findMarketplacePDA
} from "@/lib/anchor/transactions"
import { Keypair } from "@solana/web3.js"
import { createMint } from "@solana/spl-token"
import { MARKETPLACE_ADMIN } from "@/lib/anchor/config"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { searchCardsByName, formatCardForApp, detectCardFromText } from "@/lib/tcg-api"
import { CacheDebug } from "@/components/debug/cache-debug"

export default function ListingPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [cardData, setCardData] = useState({
    name: "",
    set: "",
    number: "",
    rarity: "",
    language: "English",
    condition: "",
    conditionNotes: "",
    price: 0,
    suggestedPrice: 0,
    listingType: "fixed",
    duration: "7d",
    isGraded: false,
    gradingCompany: "",
    gradingScore: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [userRegistered, setUserRegistered] = useState(false)
  const [publishingError, setPublishingError] = useState<string | null>(null)
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)
  const [nftMintAddress, setNftMintAddress] = useState<string | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  const { connected } = useWallet()
  const { program, wallet, connection } = useAnchorProgram()

  // Check wallet connection and user registration on page load
  useEffect(() => {
    if (!connected) {
      setShowToast(true)
    } else if (program && wallet.publicKey) {
      checkUserRegistration()
    }
  }, [connected, program, wallet.publicKey])

  // Check if user is registered
  const checkUserRegistration = async () => {
    if (!program || !wallet.publicKey) return
    
    try {
      const userAcc = await getUserAccount(program, wallet.publicKey)
      setUserRegistered(true)
      console.log("user account status", userAcc)
    } catch (error) {
      setUserRegistered(false)
      console.log("User not registered yet")
    }
  }

  // Register user if not already registered
  const ensureUserRegistered = async () => {
    if (!program || !wallet.publicKey) {
      throw new Error("Program or wallet not available")
    }

    if (!userRegistered) {
      try {
        console.log("Registering user...")
        await registerUser(program, wallet.publicKey)
        setUserRegistered(true)
        console.log("User registered successfully")
      } catch (error) {
        console.error("Failed to register user:", error)
        throw new Error("Failed to register user: " + (error instanceof Error ? error.message : "Unknown error"))
      }
    }
  }

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (cardData.name && connected) {
        console.log("Auto-saving listing...")
        // In a real app, this would save to localStorage or backend
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [cardData, connected])

  // Page entrance animation
  useEffect(() => {
    if (pageRef.current && connected) {
      gsap.from(pageRef.current.children, {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      })
    }
  }, [connected])

  // Handle image upload with mock card detection
  const handleImageUpload = (images: string[]) => {
    if (!connected) {
      setShowToast(true)
      return
    }

    setUploadedImages(images)
    setIsProcessing(true)

    // Simulate AI processing with mock data for fast demo
    setTimeout(() => {
      setIsProcessing(false)
      // Auto-populate card data based on "detected" information
      if (images.length > 0) {
        // Mock detection results - random popular cards for demo
        const mockCards = [
          {
            name: "Charizard",
            set: "Base Set",
            number: "004/102",
            rarity: "rare",
            suggestedPrice: 35000, // $350.00
          },
          {
            name: "Pikachu",
            set: "Base Set", 
            number: "025/102",
            rarity: "common",
            suggestedPrice: 5000, // $50.00
          },
          {
            name: "Blastoise",
            set: "Base Set",
            number: "009/102", 
            rarity: "rare",
            suggestedPrice: 15000, // $150.00
          },
          {
            name: "Venusaur",
            set: "Base Set",
            number: "015/102",
            rarity: "rare", 
            suggestedPrice: 12000, // $120.00
          },
          {
            name: "Mewtwo",
            set: "Base Set",
            number: "010/102",
            rarity: "rare",
            suggestedPrice: 25000, // $250.00
          }
        ]

        const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)]
        console.log('Mock card detected:', randomCard.name)
        
        setCardData({
          ...cardData,
          ...randomCard
        })
      }
    }, 2000) // Fast 2-second simulation
  }

  // Update card data
  const updateCardData = (data: Partial<typeof cardData>) => {
    if (!connected) {
      setShowToast(true)
      return
    }

    setCardData({ ...cardData, ...data })
  }

  // Publish listing to blockchain
  const publishListing = async () => {
    if (!program || !wallet.publicKey || !connected) {
      throw new Error("Wallet not connected or program not available")
    }

    try {
      setPublishingError(null)
      setIsProcessing(true)
      
      // Validate required data
      if (!uploadedImages.length) {
        throw new Error("Please upload at least one image of your card")
      }
      
      console.log("Starting listing process with data:", {
        name: cardData.name,
        set: cardData.set,
        price: cardData.price || cardData.suggestedPrice,
        condition: cardData.condition,
        imageCount: uploadedImages.length
      })
      
      // Ensure user is registered
      await ensureUserRegistered()
      console.log("User registration confirmed")

      // Get marketplace PDA
      const [marketplacePDA] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      console.log("Using marketplace PDA:", marketplacePDA.toString())
      
      // Convert price to lamports (assuming price is in USD, convert to SOL for demo)
      // In a real app, you'd have proper price conversion
      const priceInSOL = (cardData.price || cardData.suggestedPrice) / 100; // Simplified conversion
      const priceInLamports = priceInSOL * LAMPORTS_PER_SOL;
      console.log(`Price: $${cardData.price || cardData.suggestedPrice} → ${priceInSOL} SOL → ${priceInLamports} lamports`)

      // Use first uploaded image as main image
      const imageUrl = uploadedImages[0] || ""
      console.log("Primary image URL:", imageUrl)

      // Create a safe symbol (limit to 10 chars)
      const symbol = cardData.set && typeof cardData.set === 'string' 
        ? cardData.set.slice(0, 10) 
        : "PIKAVAULT";
      console.log("Using symbol:", symbol)

      console.log("Minting and listing NFT...")
      
      // Step 1: Create UMI instance and mint NFT with metadata
      const umi = createUmiInstance(connection.rpcEndpoint, wallet)
      
      const nftResult = await mintNFTWithUmi(umi, {
        name: cardData.name || "Unnamed Card",
        symbol: symbol,
        description: `${cardData.set} - ${cardData.number} | ${cardData.condition} | ${cardData.rarity}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Set", value: cardData.set || "Unknown Set" },
          { trait_type: "Number", value: cardData.number || "" },
          { trait_type: "Rarity", value: cardData.rarity || "common" },
          { trait_type: "Condition", value: cardData.condition || "Near Mint" },
          { trait_type: "Language", value: cardData.language || "English" },
          { trait_type: "Graded", value: cardData.isGraded ? "Yes" : "No" },
          ...(cardData.isGraded && cardData.gradingCompany ? [{ trait_type: "Grading Company", value: cardData.gradingCompany }] : []),
          ...(cardData.isGraded && cardData.gradingScore ? [{ trait_type: "Grade", value: cardData.gradingScore }] : []),
        ]
      }, wallet)

      // Convert UMI public key to Solana public key
      const nftMintPublicKey = new PublicKey(nftResult.nftMint.publicKey)
      
      console.log("NFT minted with metadata! Mint:", nftMintPublicKey.toString())
      console.log("Metadata URI:", nftResult.metadataUri)

      // Step 2: List the NFT on the marketplace
      const listResult = await listNFT(
        program,
        wallet.publicKey,
        marketplacePDA,
        nftMintPublicKey,
        priceInLamports
      )

      setTransactionSignature(listResult.tx)
      setNftMintAddress(nftMintPublicKey.toString())
      
      console.log("NFT minted and listed successfully!")
      console.log("Transaction:", listResult.tx)
      console.log("NFT Mint:", nftMintPublicKey.toString())
      
      setIsProcessing(false)
      setIsPublished(true)
      
      return listResult
    } catch (mintError) {
      console.error("Error in minting process:", mintError)
      throw new Error(`Minting failed: ${mintError instanceof Error ? mintError.message : "Unknown error"}`)
    }
  }

  // Handle step navigation
  const nextStep = () => {
    if (!connected) {
      setShowToast(true)
      return
    }

    if (activeStep < 3) {
      setActiveStep(activeStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      // Publish listing to blockchain
      publishListing().catch((error) => {
        console.error("Failed to publish listing:", error)
      })
    }
  }

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Sound effects
  const playSound = (soundType: "hover" | "click" | "success" | "error") => {
    // In a real app, you would implement actual sound effects here
  }

  // Show wallet connection requirement if not connected
  if (!connected) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-pikavault-dark text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-8" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
              WALLET REQUIRED
            </h1>
            <p className="text-xl text-white/70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Connect your wallet to access the listing page
            </p>
          </div>
        </div>
        <CustomToast
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          onConnect={() => setShowToast(false)}
          type="wallet_required"
          message="WALLET NOT CONNECTED"
          secondaryMessage="Connect your wallet to list cards"
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main ref={pageRef} className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="container mx-auto">
          <h1
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight"
            style={{ fontFamily: "'Monument Extended', sans-serif" }}
          >
            TOKENIZE <span className="text-pikavault-yellow">YOUR CARD</span>
          </h1>

          <p className="text-xl text-white/70 max-w-3xl mb-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Transform your physical Pokémon cards into digital assets on the blockchain. Our secure process ensures
            authenticity and provides a permanent record of ownership.
          </p>

          {/* Show error if publishing failed */}
          {publishingError && (
            <div className="mb-8 bg-red-900/20 border-l-4 border-red-500 p-4">
              <h4 className="font-bold text-red-400 mb-2">Publishing Failed</h4>
              <p className="text-red-300 text-sm">{publishingError}</p>
              <button
                onClick={() => setPublishingError(null)}
                className="mt-2 text-red-400 sm:hover:text-red-300 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Show user registration status */}
          {connected && !userRegistered && (
            <div className="mb-8 bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-300 text-sm">
                Your wallet will be registered automatically when you publish your first listing.
              </p>
            </div>
          )}

          {!isPublished ? (
            <>
              {/* Progress indicator */}
              <div className="w-full h-4 bg-white/10 mb-16 relative">
                <div
                  className="h-full bg-pikavault-yellow"
                  style={{
                    width: `${(activeStep + 1) * 25}%`,
                    transition: "width 0.5s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
                  }}
                ></div>
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`absolute top-0 w-4 h-4 transform -translate-x-1/2 transition-all duration-300 ${
                      step <= activeStep ? "bg-pikavault-yellow" : "bg-white/20"
                    }`}
                    style={{ left: `${step * 25 + 25}%` }}
                  ></div>
                ))}
              </div>

              {/* Step title */}
              <h2
                className="text-3xl md:text-4xl font-black mb-12"
                style={{ fontFamily: "'Monument Extended', sans-serif" }}
              >
                {activeStep === 0 && "STEP 1: UPLOAD PHOTOS"}
                {activeStep === 1 && "STEP 2: CARD DETAILS"}
                {activeStep === 2 && "STEP 3: CONDITION & PRICING"}
                {activeStep === 3 && "STEP 4: VERIFICATION"}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left column */}
                <div>
                  {activeStep === 0 && (
                    <UploadZone
                      onImageUpload={handleImageUpload}
                      uploadedImages={uploadedImages}
                      isProcessing={isProcessing}
                      onSound={playSound}
                    />
                  )}
                  {activeStep === 1 && (
                    <CardInformationPanel cardData={cardData} updateCardData={updateCardData} onSound={playSound} />
                  )}
                  {activeStep === 2 && (
                    <VerificationProcess cardData={cardData} updateCardData={updateCardData} onSound={playSound} />
                  )}
                  {activeStep === 3 && (
                    <div className="space-y-8">
                      <div className="bg-white/5 border-4 border-pikavault-yellow p-8">
                        <h3
                          className="text-2xl font-black mb-6"
                          style={{ fontFamily: "'Monument Extended', sans-serif" }}
                        >
                          FINAL VERIFICATION
                        </h3>
                        <p className="text-white/70 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Your card has been verified and is ready to be tokenized on the blockchain. Please review all
                          details before publishing.
                        </p>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Card Name</span>
                            <span className="font-bold" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
                              {cardData.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Set</span>
                            <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {cardData.set}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Condition</span>
                            <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {cardData.condition}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Price</span>
                            <span
                              className="font-bold text-pikavault-pink"
                              style={{ fontFamily: "'Monument Extended', sans-serif" }}
                            >
                              ${cardData.price || cardData.suggestedPrice}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Listing Type</span>
                            <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {cardData.listingType === "fixed" ? "Fixed Price" : "Auction"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-white/20 pb-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Duration</span>
                            <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {cardData.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div>
                  <ListingPreview cardData={cardData} uploadedImages={uploadedImages} isProcessing={isProcessing} />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-16">
                <button
                  onClick={() => {
                    if (activeStep !== 0) {
                      playSound("click")
                      prevStep()
                    }
                  }}
                  disabled={activeStep === 0}
                  className={`px-8 py-4 border-4 transition-all duration-300 ${
                    activeStep === 0
                      ? "border-white/20 text-white/50 cursor-not-allowed"
                      : "border-white/50 text-white sm:hover:border-white"
                  }`}
                  style={{ fontFamily: "'Monument Extended', sans-serif" }}
                  onMouseEnter={() => activeStep !== 0 && playSound("hover")}
                >
                  PREVIOUS
                </button>

                <button
                  onClick={() => {
                    if (
                      !(
                        (activeStep === 0 && uploadedImages.length === 0) ||
                        (activeStep === 1 && (!cardData.name || !cardData.set || !cardData.rarity)) ||
                        (activeStep === 2 && !cardData.condition)
                      )
                    ) {
                      playSound(activeStep === 3 ? "success" : "click")
                      nextStep()
                    }
                  }}
                  disabled={
                    isProcessing ||
                    (activeStep === 0 && uploadedImages.length === 0) ||
                    (activeStep === 1 && (!cardData.name || !cardData.set || !cardData.rarity)) ||
                    (activeStep === 2 && !cardData.condition)
                  }
                  className={`px-8 py-4 transition-all duration-300 ${
                    isProcessing ||
                    (activeStep === 0 && uploadedImages.length === 0) ||
                    (activeStep === 1 && (!cardData.name || !cardData.set || !cardData.rarity)) ||
                    (activeStep === 2 && !cardData.condition)
                      ? "bg-white/20 text-white/50 cursor-not-allowed"
                      : activeStep === 3
                        ? "bg-pikavault-yellow text-pikavault-dark sm:hover:bg-pikavault-yellow/90"
                        : "bg-pikavault-cyan text-pikavault-dark sm:hover:bg-pikavault-cyan/90"
                  }`}
                  style={{ fontFamily: "'Monument Extended', sans-serif" }}
                  onMouseEnter={() => {
                    if (
                      !isProcessing &&
                      !(
                        (activeStep === 0 && uploadedImages.length === 0) ||
                        (activeStep === 1 && (!cardData.name || !cardData.set || !cardData.rarity)) ||
                        (activeStep === 2 && !cardData.condition)
                      )
                    ) {
                      playSound("hover")
                    }
                  }}
                >
                  {isProcessing 
                    ? "PUBLISHING..." 
                    : activeStep === 3 
                      ? "PUBLISH LISTING" 
                      : "NEXT STEP"
                  }
                </button>
              </div>
            </>
          ) : (
            <PublishConfirmation 
              cardData={cardData} 
              uploadedImages={uploadedImages}
              transactionSignature={transactionSignature}
              nftMintAddress={nftMintAddress}
            />
          )}
        </div>
      </main>

      {/* Custom Toast */}
      <CustomToast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        onConnect={() => setShowToast(false)}
        type="wallet_required"
        message="WALLET NOT CONNECTED"
        secondaryMessage="Connect your wallet to list cards"
      />

      {/* Cache Debug Tool (only in development) */}
      {process.env.NODE_ENV === 'development' && <CacheDebug />}
    </div>
  )
}
