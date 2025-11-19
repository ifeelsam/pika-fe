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
  mintAndListNFTBatched,
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
  const [sellerEmail, setSellerEmail] = useState("")
  const [sellerTwitter, setSellerTwitter] = useState("")
  const [contactError, setContactError] = useState<string | null>(null)
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
      loadSellerProfile()
    }
  }, [connected, program, wallet.publicKey])

  // Load existing seller profile if available
  const loadSellerProfile = async () => {
    if (!wallet.publicKey) return
    
    try {
      const params = new URLSearchParams({ wallet: wallet.publicKey.toString() })
      const response = await fetch(`/api/sellers?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setSellerEmail(data.profile.email || "")
          setSellerTwitter(data.profile.twitter || "")
        }
      }
    } catch (error) {
      console.log("No existing seller profile found")
    }
  }

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
        process.env.NODE_ENV == "development" && console.log("Auto-saving listing...")
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
            suggestedPrice: 350, // $350.00
          },
          {
            name: "Pikachu",
            set: "Base Set", 
            number: "025/102",
            rarity: "common",
            suggestedPrice: 50, // $50.00
          },
          {
            name: "Blastoise",
            set: "Base Set",
            number: "009/102", 
            rarity: "rare",
            suggestedPrice: 150, // $150.00
          },
          {
            name: "Venusaur",
            set: "Base Set",
            number: "015/102",
            rarity: "rare", 
            suggestedPrice: 120, // $120.00
          },
          {
            name: "Mewtwo",
            set: "Base Set",
            number: "010/102",
            rarity: "rare",
            suggestedPrice: 250, // $250.00
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

  // Validate seller contact info
  const validateSellerContact = () => {
    if (!sellerEmail.trim() && !sellerTwitter.trim()) {
      setContactError("Please provide at least one contact method so buyers can reach you.")
      return false
    }

    if (sellerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerEmail.trim())) {
      setContactError("Please enter a valid email address.")
      return false
    }

    if (sellerTwitter && !/^@?[A-Za-z0-9_]{1,15}$/.test(sellerTwitter.trim())) {
      setContactError("Twitter handles can only contain letters, numbers, or underscores.")
      return false
    }

    setContactError(null)
    return true
  }

  // Save seller contact info to database
  const saveSellerProfile = async () => {
    if (!wallet.publicKey) return

    const normalizedTwitter = sellerTwitter.trim() === "" ? "" : sellerTwitter.trim().replace(/^@/, "")

    try {
      const response = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet.publicKey.toString(),
          email: sellerEmail.trim(),
          twitter: normalizedTwitter,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to save contact details.")
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to save seller contact details.")
    }
  }

  // Publish listing to blockchain
  const publishListing = async () => {
    if (!program || !wallet.publicKey || !connected) {
      throw new Error("Wallet not connected or program not available")
    }

    try {
      setPublishingError(null)
      setContactError(null)
      setIsProcessing(true)
      
      // Validate required data
      if (!uploadedImages.length) {
        throw new Error("Please upload at least one image of your card")
      }

      // Validate and save seller contact info
      if (!validateSellerContact()) {
        setIsProcessing(false)
        return
      }

      await saveSellerProfile()
      
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

      console.log("Minting and listing NFT (batched)...")
      
      // Create UMI instance
      const umi = createUmiInstance(connection.rpcEndpoint, wallet)
      
      // Batch mint and list in optimized flow
      // Note: True single-transaction batching of UMI + Anchor is complex due to different transaction formats
      // This function optimizes the flow and sends transactions in sequence for better UX
      const result = await mintAndListNFTBatched(
        program,
        umi,
        wallet.publicKey,
        marketplacePDA,
        {
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
        },
        priceInLamports,
        wallet
      )

      setTransactionSignature(result.tx)
      setNftMintAddress(result.nftMint.toString())
      
      console.log("NFT minted and listed successfully!")
      console.log("Transaction:", result.tx)
      console.log("NFT Mint:", result.nftMint.toString())
      console.log("Metadata URI:", result.metadataUri)
      
      setIsProcessing(false)
      setIsPublished(true)
      
      return result
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

      <main ref={pageRef} className="pt-24 pb-32 px-2 md:px-8 lg:px-12 relative z-10">
        <div className="container mx-auto">
          <h1
            className="text-[34px] sm:text-5xl md:text-7xl font-black mb-8 tracking-tight font-monument"
          >
            TOKENIZE <span className="text-pikavault-yellow">YOUR CARD</span>
          </h1>

          <p className="text-md md:text-xl text-white/70 max-w-lg md:max-w-3xl mb-16" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
                      {/* Seller Contact Information */}
                      <div className="bg-white/5 border-4 border-pikavault-cyan p-8">
                        <h3
                          className="text-2xl font-black mb-4"
                          style={{ fontFamily: "'Monument Extended', sans-serif" }}
                        >
                          YOUR CONTACT INFO
                        </h3>
                        <p className="text-white/70 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Provide at least one contact method so buyers can reach you after purchasing your card.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/60 text-sm uppercase mb-2 font-space-grotesk">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              value={sellerEmail}
                              onChange={(e) => {
                                setSellerEmail(e.target.value)
                                if (contactError) setContactError(null)
                              }}
                              placeholder="you@domain.com"
                              className="w-full bg-transparent border-2 border-white/20 focus:border-pikavault-cyan px-4 py-3 text-white font-space-grotesk placeholder:text-white/30 transition-colors outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-white/60 text-sm uppercase mb-2 font-space-grotesk">
                              Twitter / X (Optional)
                            </label>
                            <input
                              type="text"
                              value={sellerTwitter}
                              onChange={(e) => {
                                setSellerTwitter(e.target.value)
                                if (contactError) setContactError(null)
                              }}
                              placeholder="@yourusername"
                              className="w-full bg-transparent border-2 border-white/20 focus:border-pikavault-cyan px-4 py-3 text-white font-space-grotesk placeholder:text-white/30 transition-colors outline-none"
                            />
                          </div>

                          {contactError && (
                            <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-3 text-center">
                              <p className="text-pikavault-pink text-sm font-space-grotesk">
                                {contactError}
                              </p>
                            </div>
                          )}

                          <p className="text-white/50 text-xs font-space-grotesk">
                            Your contact info will only be shared with buyers after they purchase your card and escrow is created.
                          </p>
                        </div>
                      </div>

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
                    (activeStep === 2 && !cardData.condition) ||
                    (activeStep === 3 && !sellerEmail.trim() && !sellerTwitter.trim())
                  }
                  className={`px-8 py-4 transition-all duration-300 ${
                    isProcessing ||
                    (activeStep === 0 && uploadedImages.length === 0) ||
                    (activeStep === 1 && (!cardData.name || !cardData.set || !cardData.rarity)) ||
                    (activeStep === 2 && !cardData.condition) ||
                    (activeStep === 3 && !sellerEmail.trim() && !sellerTwitter.trim())
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
                        (activeStep === 2 && !cardData.condition) ||
                        (activeStep === 3 && !sellerEmail.trim() && !sellerTwitter.trim())
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
