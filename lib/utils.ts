import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Connection, PublicKey } from "@solana/web3.js"
import { AnchorProvider, Program } from "@coral-xyz/anchor"
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata"
import { createUmiInstance } from "./anchor/transactions"
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi"
import { getAllListings } from "./anchor/transactions"
import { RPC_URL } from "./anchor/config"
import IDL from "./anchor/idl.json"
import type { PikaVault } from "./anchor/idl"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// create server side read-only program
export function createReadOnlyProgram(connectionUrl?: string): Program<PikaVault> {
  const dummyWallet = {
    publicKey: new PublicKey("11111111111111111111111111111111"),
    signTransaction: () => Promise.reject("Read-only mode"),
    signAllTransactions: () => Promise.reject("Read-only mode"),
  }
  
  const connection = new Connection(connectionUrl || RPC_URL, "confirmed")
  const provider = new AnchorProvider(connection, dummyWallet, {
    commitment: "confirmed",
  })
  
  return new Program(IDL as PikaVault, provider) as Program<PikaVault>
}

// Server-side function to fetch card data
export async function getCardDataForOG(cardId: string): Promise<{
  name: string
  image: string
  description: string
  price?: number
} | null> {
  try {
    const program = createReadOnlyProgram()
    
    const listings = await getAllListings(program)
    
    // Finding card by mint address
    const listing = listings.find(
      (l) => l.account.nftAddress.toString() === cardId || 
             l.account.nftAddress.toString().slice(0, 8) === cardId ||
             l.publicKey.toString() === cardId
    )
    
    if (!listing) {
      return null
    }
    
    // Fetch NFT metadata
    const umi = createUmiInstance(RPC_URL)
    const mintPubkey = umiPublicKey(listing.account.nftAddress.toString())
    
    try {
      const digitalAsset = await fetchDigitalAsset(umi, mintPubkey)
      const metadata = digitalAsset.metadata
      
      let name = metadata.name || `NFT #${listing.account.nftAddress.toString().slice(0, 6).toUpperCase()}`
      let image = `/placeholder-oai5n.png` // fallback
      let description = `A digital card from PikaVault marketplace`
      
      // Fetch off-chain metadata if URI exists
      if (metadata.uri) {
        try {
          const response = await fetch(metadata.uri)
          const offChainMetadata = await response.json()
          image = offChainMetadata.image || image
          description = offChainMetadata.description || description
        } catch (error) {
          console.warn("Failed to fetch off-chain metadata:", error)
        }
      }
      
      // price in SOL
      const priceInSol = parseInt(listing.account.listingPrice.toString()) / 1_000_000_000 // LAMPORTS_PER_SOL
      
      return {
        name,
        image,
        description,
        price: priceInSol
      }
    } catch (metadataError) {
      console.warn("Failed to fetch NFT metadata:", metadataError)
      
      // basic info from listing
      const priceInSol = parseInt(listing.account.listingPrice.toString()) / 1_000_000_000
      return {
        name: `NFT #${listing.account.nftAddress.toString().slice(0, 6).toUpperCase()}`,
        image: `/placeholder-oai5n.png`,
        description: `A digital card from PikaVault marketplace`,
        price: priceInSol
      }
    }
  } catch (error) {
    console.error("Error fetching card data for OG:", error)
    return null
  }
}
