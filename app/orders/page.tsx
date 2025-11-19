"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAnchorProgram, useReadOnlyProgram } from "@/lib/anchor/client"
import { releaseEscrow, findMarketplacePDA, findEscrowPDA, createUmiInstance } from "@/lib/anchor/transactions"
import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_ADMIN } from "@/lib/anchor/config"
import { Button } from "@/components/ui/button"
import { Mail, Twitter, Package, CheckCircle2, AlertCircle, ShoppingCart, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi"

type Order = {
  id: string
  listingPubkey: string
  nftMint: string
  cardId?: string | null
  price: number
  buyerWallet: string
  sellerWallet: string
  status: string
  createdAt: string
  cardName?: string
  cardImage?: string
  buyerProfile?: {
    email?: string | null
    twitter?: string | null
  } | null
  sellerProfile?: {
    email?: string | null
    twitter?: string | null
  } | null
}

export default function OrdersPage() {
  const { publicKey } = useWallet()
  const { program } = useAnchorProgram()
  const { readOnlyProgram } = useReadOnlyProgram()
  const router = useRouter()
  const [sellerOrders, setSellerOrders] = useState<Order[]>([])
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [releasingEscrow, setReleasingEscrow] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)

  const fetchCardMetadata = async (nftMint: string): Promise<{ name: string; image: string }> => {
    try {
      if (!readOnlyProgram?.provider.connection) {
        throw new Error("No connection available")
      }

      const umi = createUmiInstance(readOnlyProgram.provider.connection.rpcEndpoint)
      const mintPubkey = umiPublicKey(nftMint)
      const digitalAsset = await fetchDigitalAsset(umi, mintPubkey)
      const metadata = digitalAsset.metadata
      const name = metadata.name || `NFT #${nftMint.slice(0, 6).toUpperCase()}`

      let imageUrl = `/placeholder-1.png`
      if (metadata.uri) {
        try {
          const response = await fetch(metadata.uri)
          const offChainMetadata = await response.json()
          imageUrl = offChainMetadata.image || imageUrl
        } catch (error) {
          console.warn("Failed to fetch off-chain metadata:", error)
        }
      }

      return { name, image: imageUrl }
    } catch (error) {
      console.error("Error fetching NFT metadata:", error)
      return {
        name: `NFT #${nftMint.slice(0, 6).toUpperCase()}`,
        image: `/placeholder-1.png`
      }
    }
  }

  useEffect(() => {
    const loadOrders = async () => {
      if (!publicKey) {
        setSellerOrders([])
        setBuyerOrders([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        // Fetch seller orders
        const sellerParams = new URLSearchParams({ seller: publicKey.toString() })
        const sellerResponse = await fetch(`/api/orders?${sellerParams.toString()}`)
        
        // Fetch buyer orders
        const buyerParams = new URLSearchParams({ buyer: publicKey.toString() })
        const buyerResponse = await fetch(`/api/orders?${buyerParams.toString()}`)

        if (!sellerResponse.ok || !buyerResponse.ok) {
          throw new Error("Unable to load orders")
        }

        const sellerData = await sellerResponse.json()
        const buyerData = await buyerResponse.json()
        
        const sellerOrdersList = Array.isArray(sellerData.orders) ? sellerData.orders : []
        const buyerOrdersList = Array.isArray(buyerData.orders) ? buyerData.orders : []
        
        // Fetch card metadata for seller orders
        const sellerOrdersWithMetadata = await Promise.all(
          sellerOrdersList.map(async (order: Order) => {
            try {
              const metadata = await fetchCardMetadata(order.nftMint)
              return {
                ...order,
                cardName: metadata.name,
                cardImage: metadata.image
              }
            } catch {
              return {
                ...order,
                cardName: order.cardId ? `Card #${order.cardId.slice(0, 8)}` : "Unknown Card",
                cardImage: "/placeholder-1.png"
              }
            }
          })
        )

        // Fetch card metadata for buyer orders
        const buyerOrdersWithMetadata = await Promise.all(
          buyerOrdersList.map(async (order: Order) => {
            try {
              const metadata = await fetchCardMetadata(order.nftMint)
              return {
                ...order,
                cardName: metadata.name,
                cardImage: metadata.image
              }
            } catch {
              return {
                ...order,
                cardName: order.cardId ? `Card #${order.cardId.slice(0, 8)}` : "Unknown Card",
                cardImage: "/placeholder-1.png"
              }
            }
          })
        )
        
        setSellerOrders(sellerOrdersWithMetadata)
        setBuyerOrders(buyerOrdersWithMetadata)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setError("Could not load your orders")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [publicKey])

  const handleReleaseEscrow = async (order: Order) => {
    if (!program || !publicKey) {
      setReleaseError("Please connect your wallet")
      return
    }

    setReleasingEscrow(order.listingPubkey)
    setReleaseError(null)

    try {
      const [marketplace] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId)
      const [escrow] = findEscrowPDA(new PublicKey(order.listingPubkey), program.programId)

      let escrowData
      try {
        escrowData = await program.account.escrow.fetch(escrow)
      } catch (error) {
        throw new Error("Escrow not found or already released")
      }

      await releaseEscrow(
        program,
        publicKey,
        escrowData.buyer,
        marketplace,
        new PublicKey(order.listingPubkey),
        new PublicKey(order.nftMint),
        escrow
      )

      // Update order status
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingPubkey: order.listingPubkey,
          status: "ESCROW_RELEASED",
        }),
      })

      // Refresh orders
      setSellerOrders((prev) =>
        prev.map((o) =>
          o.listingPubkey === order.listingPubkey
            ? { ...o, status: "ESCROW_RELEASED" }
            : o
        )
      )
    } catch (error: any) {
      console.error("Error releasing escrow:", error)
      setReleaseError(error.message || "Failed to release escrow")
    } finally {
      setReleasingEscrow(null)
    }
  }

  const pendingSellerOrders = sellerOrders.filter((o) => o.status === "PENDING_SHIPMENT")
  const completedSellerOrders = sellerOrders.filter((o) => o.status === "ESCROW_RELEASED")
  const pendingBuyerOrders = buyerOrders.filter((o) => o.status === "PENDING_SHIPMENT")
  const completedBuyerOrders = buyerOrders.filter((o) => o.status === "ESCROW_RELEASED")

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
        <BackgroundEffects />
        <Navigation />
        <main className="pt-32 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 font-monument">
              ORDERS
            </h1>
            <p className="text-white/70 text-lg mb-8 font-space-grotesk">
              Connect your wallet to view your orders as both buyer and seller
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 font-monument">
            ORDERS
          </h1>
          <p className="text-white/70 text-lg mb-12 font-space-grotesk">
            Manage your purchases and sales, view contact info, and release escrow after shipping
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 animate-pulse">
                  <div className="h-6 bg-white/10 w-1/3 mb-4"></div>
                  <div className="h-4 bg-white/10 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-6 text-center">
              <p className="text-pikavault-pink font-space-grotesk">{error}</p>
            </div>
          ) : (
            <>
              {releaseError && (
                <div className="bg-pikavault-pink/20 border-2 border-pikavault-pink p-4 mb-6">
                  <p className="text-pikavault-pink text-sm font-space-grotesk">{releaseError}</p>
                </div>
              )}

              {/* SELLER SECTION */}
              {pendingSellerOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-pikavault-cyan" />
                    <h2 className="text-2xl md:text-3xl font-black font-monument">
                      TO SHIP <span className="text-pikavault-cyan">({pendingSellerOrders.length})</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {pendingSellerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white/5 border-2 border-pikavault-cyan/50 p-6 hover:border-pikavault-cyan transition-colors"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div
                              className="w-24 h-32 bg-cover bg-center border-2 border-white/20"
                              style={{
                                backgroundImage: `url(${order.cardImage})`,
                              }}
                            ></div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-2">
                                  {order.cardName}
                                </h3>
                                <p className="text-white/60 text-sm font-space-grotesk mb-1">
                                  Listing: {order.listingPubkey.slice(0, 8)}...
                                </p>
                                <p className="text-pikavault-yellow text-lg font-black font-monument">
                                  {order.price} SOL
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => handleReleaseEscrow(order)}
                                  disabled={releasingEscrow === order.listingPubkey || !publicKey}
                                  className="bg-pikavault-cyan sm:hover:bg-pikavault-cyan/90 text-pikavault-dark font-bold py-3 px-6 rounded-none disabled:opacity-50 font-monument"
                                >
                                  {releasingEscrow === order.listingPubkey
                                    ? "RELEASING..."
                                    : "RELEASE ESCROW"}
                                </Button>
                                <Button
                                  onClick={() => router.push(`/card/${order.nftMint}`)}
                                  className="bg-transparent border-2 border-pikavault-cyan sm:hover:bg-pikavault-cyan/10 text-white font-bold py-2 px-4 rounded-none font-space-grotesk"
                                >
                                  VIEW CARD
                                </Button>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                              <p className="text-white/70 text-xs uppercase tracking-wide mb-3 font-space-grotesk">
                                Buyer Contact Information
                              </p>
                              <div className="space-y-2">
                                {order.buyerProfile?.email ? (
                                  <div className="flex items-center gap-2 text-white">
                                    <Mail className="w-4 h-4 text-pikavault-cyan" />
                                    <span className="text-sm font-space-grotesk">{order.buyerProfile.email}</span>
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-xs font-space-grotesk">No email provided</p>
                                )}
                                {order.buyerProfile?.twitter ? (
                                  <div className="flex items-center gap-2 text-white">
                                    <Twitter className="w-4 h-4 text-pikavault-cyan" />
                                    <span className="text-sm font-space-grotesk">@{order.buyerProfile.twitter.replace(/^@/, "")}</span>
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-xs font-space-grotesk">No Twitter provided</p>
                                )}
                                {!order.buyerProfile?.email && !order.buyerProfile?.twitter && (
                                  <p className="text-pikavault-pink text-xs font-space-grotesk">
                                    ⚠️ Buyer did not provide contact information
                                  </p>
                                )}
                              </div>
                              <p className="text-white/50 text-xs mt-3 font-space-grotesk">
                                Buyer Wallet: {order.buyerWallet.slice(0, 8)}...{order.buyerWallet.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BUYER SECTION */}
              {pendingBuyerOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="w-6 h-6 text-pikavault-yellow" />
                    <h2 className="text-2xl md:text-3xl font-black font-monument">
                      AWAITING <span className="text-pikavault-yellow">DELIVERY</span> ({pendingBuyerOrders.length})
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {pendingBuyerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white/5 border-2 border-pikavault-yellow/50 p-6 hover:border-pikavault-yellow transition-colors"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div
                              className="w-24 h-32 bg-cover bg-center border-2 border-white/20"
                              style={{
                                backgroundImage: `url(${order.cardImage})`,
                              }}
                            ></div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-2">
                                  {order.cardName}
                                </h3>
                                <p className="text-white/60 text-sm font-space-grotesk mb-1">
                                  Purchased on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-pikavault-yellow text-lg font-black font-monument">
                                  {order.price} SOL
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  onClick={() => router.push(`/card/${order.nftMint}`)}
                                  className="bg-transparent border-2 border-pikavault-yellow sm:hover:bg-pikavault-yellow/10 text-white font-bold py-2 px-4 rounded-none font-space-grotesk"
                                >
                                  VIEW CARD
                                </Button>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                              <p className="text-white/70 text-xs uppercase tracking-wide mb-3 font-space-grotesk">
                                Seller Contact Information
                              </p>
                              <div className="space-y-2 mb-3">
                                {order.sellerProfile?.email ? (
                                  <div className="flex items-center gap-2 text-white">
                                    <Mail className="w-4 h-4 text-pikavault-yellow" />
                                    <span className="text-sm font-space-grotesk">{order.sellerProfile.email}</span>
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-xs font-space-grotesk">No email provided</p>
                                )}
                                {order.sellerProfile?.twitter ? (
                                  <div className="flex items-center gap-2 text-white">
                                    <Twitter className="w-4 h-4 text-pikavault-yellow" />
                                    <span className="text-sm font-space-grotesk">@{order.sellerProfile.twitter.replace(/^@/, "")}</span>
                                  </div>
                                ) : (
                                  <p className="text-white/40 text-xs font-space-grotesk">No Twitter provided</p>
                                )}
                                {!order.sellerProfile?.email && !order.sellerProfile?.twitter && (
                                  <p className="text-pikavault-pink text-xs font-space-grotesk">
                                    ⚠️ Seller did not provide contact information
                                  </p>
                                )}
                              </div>
                              <p className="text-white/50 text-xs font-space-grotesk">
                                Seller Wallet: {order.sellerWallet.slice(0, 8)}...{order.sellerWallet.slice(-6)}
                              </p>
                              <p className="text-white/60 text-sm mt-2 font-space-grotesk">
                                Your card is in escrow. The seller will ship it and release escrow after delivery.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPLETED ORDERS - SELLER */}
              {completedSellerOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-pikavault-yellow" />
                    <h2 className="text-2xl md:text-3xl font-black font-monument">
                      COMPLETED <span className="text-pikavault-yellow">SALES</span> ({completedSellerOrders.length})
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {completedSellerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white/5 border border-white/10 p-6 opacity-60"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div
                              className="w-24 h-32 bg-cover bg-center border-2 border-white/20"
                              style={{
                                backgroundImage: `url(${order.cardImage})`,
                              }}
                            ></div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-2">
                                  {order.cardName}
                                </h3>
                                <p className="text-white/60 text-sm font-space-grotesk mb-1">
                                  Escrow released on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-pikavault-yellow text-lg font-black font-monument">
                                  {order.price} SOL
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-pikavault-yellow">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold font-space-grotesk">ESCROW RELEASED</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPLETED ORDERS - BUYER */}
              {completedBuyerOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-6 h-6 text-pikavault-yellow" />
                    <h2 className="text-2xl md:text-3xl font-black font-monument">
                      COMPLETED <span className="text-pikavault-yellow">PURCHASES</span> ({completedBuyerOrders.length})
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {completedBuyerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white/5 border border-white/10 p-6 opacity-60"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0">
                            <div
                              className="w-24 h-32 bg-cover bg-center border-2 border-white/20"
                              style={{
                                backgroundImage: `url(${order.cardImage})`,
                              }}
                            ></div>
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-bold font-space-grotesk mb-2">
                                  {order.cardName}
                                </h3>
                                <p className="text-white/60 text-sm font-space-grotesk mb-1">
                                  Escrow released on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-pikavault-yellow text-lg font-black font-monument">
                                  {order.price} SOL
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-pikavault-yellow">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold font-space-grotesk">RECEIVED</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sellerOrders.length === 0 && buyerOrders.length === 0 && (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-black font-monument mb-2">NO ORDERS YET</h3>
                  <p className="text-white/60 font-space-grotesk">
                    Your purchases and sales will appear here
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

