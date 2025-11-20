import { PublicKey, SystemProgram, Keypair, Transaction} from "@solana/web3.js";
import { Program, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { METADATA_PROGRAM_ID } from "./config";
import type { PikaVault } from "./idl";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { 
  createNft, 
  mplTokenMetadata
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  percentAmount,
  Umi,
  Signer
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { uploadMetadataToIrys } from "../ipfs/pinata";

// Helper function to find marketplace PDA
export const findMarketplacePDA = (authority: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("marketplace"), authority.toBuffer()],
    programId
  );
};

// Helper function to find treasury PDA
export const findTreasuryPDA = (marketplace: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), marketplace.toBuffer()],
    programId
  );
};

// Helper function to find user account PDA
export const findUserAccountPDA = (user: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_account"), user.toBuffer()],
    programId
  );
};

// Helper function to find listing PDA
export const findListingPDA = (marketplace: PublicKey, nftMint: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [marketplace.toBuffer(), nftMint.toBuffer()],
    programId
  );
};

// Helper function to find escrow PDA
export const findEscrowPDA = (listing: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), listing.toBuffer()],
    programId
  );
};

// Helper function to find metadata PDA
export const findMetadataPDA = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
};

// Helper function to find master edition PDA
export const findMasterEditionPDA = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      nftMint.toBuffer(),
      Buffer.from("edition"),
    ],
    METADATA_PROGRAM_ID
  );
};

// Initialize marketplace (admin only)
export const initializeMarketplace = async (
  program: Program<PikaVault>,
  admin: PublicKey,
  fee: number
) => {
  try {
    const [marketplace] = findMarketplacePDA(admin, program.programId);
    const [treasury] = findTreasuryPDA(marketplace, program.programId);

    const tx = await program.methods
      .initializeMarketplace(fee)
      .accountsStrict({
        admin: admin,
        marketplace: marketplace,
        treasury: treasury,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Marketplace initialization successful! Transaction signature:", tx);
    return { tx, marketplace, treasury };
  } catch (error) {
    console.error("Error initializing marketplace:", error);
    throw error;
  }
};

// Register user
export const registerUser = async (program: Program<PikaVault>, wallet: PublicKey) => {
  try {
    const [userAccount] = findUserAccountPDA(wallet, program.programId);

    const tx = await program.methods
      .registerUser()
      .accountsStrict({
        user: wallet,
        userAccount: userAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("User registration successful! Transaction signature:", tx);
    return { tx, userAccount };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Create UMI instance for NFT minting
export const createUmiInstance = (
  rpcEndpoint: string,
  wallet?: any // Wallet adapter instance
): Umi => {
  const umi = createUmi(rpcEndpoint)
    .use(mplTokenMetadata());

  if (wallet) {
    umi.use(walletAdapterIdentity(wallet));
    process.env.NODE_ENV == "development" && console.log("umi", umi)
  }
  process.env.NODE_ENV == "development" && console.log("umi", umi)

  return umi;
};

// Mint NFT using Metaplex UMI (client-side) - simplified version without metadata upload
export const mintNFTWithUmi = async (
  umi: Umi,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  },
  wallet: any
): Promise<{ nftMint: Signer; tx: string; metadataUri: string }> => {
  try {
    // Generate a new NFT mint signer
    const nftMint = generateSigner(umi);

    // Upload metadata to Irys
    console.log("Uploading metadata to Irys devnet...");
    const metadataUri = await uploadMetadataToIrys(metadata, wallet);
    console.log("Metadata uploaded to Irys:", metadataUri);

    // Create the NFT
    const createNftIx = createNft(umi, {
      mint: nftMint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0), // 0% royalty
    });

    // Send and confirm the transaction
    const result = await createNftIx.sendAndConfirm(umi);
    console.log("result", result)
    // Decode the transaction signature
    const signature = base58.deserialize(result.signature)[0];

    console.log("NFT minted successfully with UMI! Transaction signature:", signature);
    console.log("NFT Mint Address:", nftMint.publicKey);
    console.log("Metadata URI:", metadataUri);

    return { nftMint, tx: signature, metadataUri };
  } catch (error) {
    console.error("Error minting NFT with UMI:", error);
    throw error;
  }
};

// List NFT on marketplace (separate from minting)
export const listNFT = async (
  program: Program<PikaVault>,
  maker: PublicKey,
  marketplace: PublicKey,
  nftMint: PublicKey,
  listingPrice: number
) => {
  try {
    const [userAccount] = findUserAccountPDA(maker, program.programId);
    const [listing] = findListingPDA(marketplace, nftMint, program.programId);
    
    const makerAta = await getAssociatedTokenAddress(nftMint, maker);
    const vault = await getAssociatedTokenAddress(nftMint, listing, true);

    const tx = await program.methods
      .listNft(new BN(listingPrice))
      .accountsStrict({
        maker: maker,
        userAccount: userAccount,
        marketplace: marketplace,
        nftMint: nftMint,
        makerAta: makerAta,
        vault: vault,
        listing: listing,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("NFT listed successfully! Transaction signature:", tx);
    return { tx, listing, vault, makerAta };
  } catch (error) {
    console.error("Error listing NFT:", error);
    throw error;
  }
};

// Batch list multiple NFTs in a single transaction
// This is more efficient than calling listNFT multiple times
export const batchListNFTs = async (
  program: Program<PikaVault>,
  maker: PublicKey,
  marketplace: PublicKey,
  listings: Array<{ nftMint: PublicKey; listingPrice: number }>
) => {
  try {
    if (listings.length === 0) {
      throw new Error("No NFTs to list");
    }

    // Solana transaction size limit is ~1232 bytes
    // Each listing instruction is roughly ~200-300 bytes
    // We can safely batch ~3-4 listings per transaction
    // For larger batches, we'll split into multiple transactions
    const MAX_LISTINGS_PER_TX = 4;
    const results: Array<{ tx: string; listings: Array<{ listing: PublicKey; nftMint: PublicKey }> }> = [];

    // Process listings in batches
    for (let i = 0; i < listings.length; i += MAX_LISTINGS_PER_TX) {
      const batch = listings.slice(i, i + MAX_LISTINGS_PER_TX);
      
      // Build instructions for this batch
      const instructions = await Promise.all(
        batch.map(async ({ nftMint, listingPrice }) => {
          const [userAccount] = findUserAccountPDA(maker, program.programId);
          const [listing] = findListingPDA(marketplace, nftMint, program.programId);
          
          const makerAta = await getAssociatedTokenAddress(nftMint, maker);
          const vault = await getAssociatedTokenAddress(nftMint, listing, true);

          // Get the instruction without sending it
          return {
            instruction: await program.methods
              .listNft(new BN(listingPrice))
              .accountsStrict({
                maker: maker,
                userAccount: userAccount,
                marketplace: marketplace,
                nftMint: nftMint,
                makerAta: makerAta,
                vault: vault,
                listing: listing,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              })
              .instruction(),
            listing,
            nftMint,
          };
        })
      );

      // Create a new transaction and add all instructions
      const transaction = new Transaction();
      instructions.forEach(({ instruction }) => {
        transaction.add(instruction);
      });

      // Get recent blockhash
      const { blockhash } = await program.provider.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = maker;

      // Sign and send the transaction
      if (!program.provider.wallet) {
        throw new Error("Wallet not available");
      }
      const signedTx = await program.provider.wallet.signTransaction(transaction);
      const signature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await program.provider.connection.confirmTransaction(signature, "confirmed");

      console.log(`Batch listed ${batch.length} NFT(s) successfully! Transaction signature:`, signature);
      
      results.push({
        tx: signature,
        listings: instructions.map(({ listing, nftMint }) => ({ listing, nftMint })),
      });
    }

    return results;
  } catch (error) {
    console.error("Error batch listing NFTs:", error);
    throw error;
  }
};

// Batch mint and list NFT in a single transaction
// This combines the UMI mint instruction with the Anchor list instruction
export const mintAndListNFTBatched = async (
  program: Program<PikaVault>,
  umi: Umi,
  maker: PublicKey,
  marketplace: PublicKey,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  },
  listingPrice: number,
  wallet: any
): Promise<{ nftMint: PublicKey; tx: string; metadataUri: string; listing: PublicKey }> => {
  try {
    // Step 1: Upload metadata and prepare mint
    console.log("Uploading metadata to Irys...");
    const metadataUri = await uploadMetadataToIrys(metadata, wallet);
    console.log("Metadata uploaded to Irys:", metadataUri);

    // Generate a new NFT mint signer
    const nftMint = generateSigner(umi);
    const nftMintPublicKey = new PublicKey(nftMint.publicKey);

    // Step 2: Build the mint instruction using UMI
    const createNftBuilder = createNft(umi, {
      mint: nftMint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(0), // 0% royalty
    });

    // Step 3: Build the list instruction using Anchor
    const [userAccount] = findUserAccountPDA(maker, program.programId);
    const [listing] = findListingPDA(marketplace, nftMintPublicKey, program.programId);
    
    const makerAta = await getAssociatedTokenAddress(nftMintPublicKey, maker);
    const vault = await getAssociatedTokenAddress(nftMintPublicKey, listing, true);

    const listInstruction = await program.methods
      .listNft(new BN(listingPrice))
      .accountsStrict({
        maker: maker,
        userAccount: userAccount,
        marketplace: marketplace,
        nftMint: nftMintPublicKey,
        makerAta: makerAta,
        vault: vault,
        listing: listing,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Step 4: Get blockhash and build combined transaction
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
    
    // Get instructions from UMI builder before building
    // UMI transaction builder has a getInstructions method
    const mintInstructions = createNftBuilder.getInstructions();
    
    // Create a new web3.js Transaction
    const combinedTransaction = new Transaction();
    
    // Add all mint instructions from UMI
    mintInstructions.forEach((ix: any) => {
      // Convert UMI instruction to web3.js instruction format
      combinedTransaction.add({
        keys: ix.keys.map((key: any) => ({
          pubkey: new PublicKey(key.pubkey),
          isSigner: key.isSigner,
          isWritable: key.isWritable,
        })),
        programId: new PublicKey(ix.programId),
        data: Buffer.from(ix.data),
      });
    });
    
    // Add the list instruction
    combinedTransaction.add(listInstruction);
    
    // Set transaction properties
    combinedTransaction.recentBlockhash = blockhash;
    combinedTransaction.feePayer = maker;
    
    // Sign the transaction with both the wallet and the mint keypair
    if (!program.provider.wallet) {
      throw new Error("Wallet not available");
    }
    
    // First, sign with wallet (this signs for the maker/fee payer)
    const signedTx = await program.provider.wallet.signTransaction(combinedTransaction);
    
    // Get the mint keypair from UMI signer and sign the transaction
    // UMI signers have a secretKey property we can use
    const mintKeypair = Keypair.fromSecretKey(
      Buffer.from(nftMint.secretKey)
    );
    
    // Sign with the mint keypair
    signedTx.partialSign(mintKeypair);
    
    // Send the fully signed transaction
    const signature = await program.provider.connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: false }
    );
    
    // Wait for confirmation
    await program.provider.connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    console.log("NFT minted and listed in single transaction! Signature:", signature);

    return {
      nftMint: nftMintPublicKey,
      tx: signature,
      metadataUri,
      listing,
    };
  } catch (error) {
    console.error("Error in batch mint and list:", error);
    throw error;
  }
};

// Combined function: Mint NFT with UMI and list on marketplace (legacy - kept for compatibility)
export const mintAndListNFT = async (
  program: Program<PikaVault>,
  maker: PublicKey,
  marketplace: PublicKey,
  nftMint: Keypair,
  collectionMint: PublicKey,
  name: string,
  symbol: string,
  listingPrice: number,
  cardMetadata: string,
  imageUrl: string,
  connection?: any, // Connection instance for UMI
  wallet?: any // Wallet adapter instance
) => {
  try {
    // If using the old interface, fall back to listing only
    // This maintains backward compatibility
    const [userAccount] = findUserAccountPDA(maker, program.programId);
    const [listing] = findListingPDA(marketplace, nftMint.publicKey, program.programId);
    
    const makerAta = await getAssociatedTokenAddress(nftMint.publicKey, maker);
    const vault = await getAssociatedTokenAddress(nftMint.publicKey, listing, true);

    // Since the NFT is already minted client-side, we just list it
    const tx = await program.methods
      .listNft(new BN(listingPrice))
      .accountsStrict({
        maker: maker,
        userAccount: userAccount,
        marketplace: marketplace,
        nftMint: nftMint.publicKey,
        makerAta: makerAta,
        vault: vault,
        listing: listing,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("NFT listed successfully! Transaction signature:", tx);
    return { 
      tx, 
      listing, 
      nftMint: nftMint.publicKey, 
      vault, 
      makerAta 
    };
  } catch (error) {
    console.error("Error listing NFT:", error);
    throw error;
  }
};

// Purchase NFT
export const purchaseNFT = async (
  program: Program<PikaVault>,
  buyer: PublicKey,
  marketplace: PublicKey,
  listing: PublicKey,
  nftMint: PublicKey,
  seller: PublicKey
) => {
  try {
    const [buyerAccount] = findUserAccountPDA(buyer, program.programId);
    const [sellerAccount] = findUserAccountPDA(seller, program.programId);
    const [escrow] = findEscrowPDA(listing, program.programId);

    const tx = await program.methods
      .purchase()
      .accountsStrict({
        buyer: buyer,
        buyerAccount: buyerAccount,
        marketplace: marketplace,
        listing: listing,
        escrow: escrow,
        nftMint: nftMint,
        sellerAccount: sellerAccount,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("NFT purchased successfully! Transaction signature:", tx);
    return { tx, escrow };
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    throw error;
  }
};

// Delist NFT
export const delistNFT = async (
  program: Program<PikaVault>,
  owner: PublicKey,
  marketplace: PublicKey,
  nftMint: PublicKey,
  listing: PublicKey
) => {
  try {
    const [userAccount] = findUserAccountPDA(owner, program.programId);
    const ownerAta = await getAssociatedTokenAddress(nftMint, owner);
    const vault = await getAssociatedTokenAddress(nftMint, listing, true);

    const tx = await program.methods
      .delist()
      .accountsStrict({
        owner: owner,
        userAccount: userAccount,
        marketplace: marketplace,
        nftMint: nftMint,
        ownerAta: ownerAta,
        vault: vault,
        listing: listing,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("NFT delisted successfully! Transaction signature:", tx);
    return { tx };
  } catch (error) {
    console.error("Error delisting NFT:", error);
    throw error;
  }
};

// Release escrow and transfer NFT after purchase
export const releaseEscrow = async (
  program: Program<PikaVault>,
  seller: PublicKey,
  buyer: PublicKey,
  marketplace: PublicKey,
  listing: PublicKey,
  nftMint: PublicKey,
  escrow: PublicKey
) => {
  try {
    const vault = await getAssociatedTokenAddress(nftMint, listing, true);
    const buyerTokenAccount = await getAssociatedTokenAddress(nftMint, buyer);

      // if buyer's if ata doesn't exist, create it
    const preInstructions = [];
    try {
      await getAccount(program.provider.connection, buyerTokenAccount);
      console.log("Buyer token account already exists");
    } catch (error) {
      console.log("Creating buyer token account...");
      const createAtaIx = createAssociatedTokenAccountInstruction(
        seller, // payer (seller pays for the creation)
        buyerTokenAccount, // ata
        buyer, // owner
        nftMint 
      );
      preInstructions.push(createAtaIx);
    }

    const tx = await program.methods
      .releaseEscrow()
      .accountsStrict({
        seller: seller,
        buyer: buyer,
        escrow: escrow,
        listing: listing,
        marketplace: marketplace,
        nftMint: nftMint,
        vault: vault,
        buyerTokenAccount: buyerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .preInstructions(preInstructions)
      .rpc();

    console.log("Escrow released and NFT transferred successfully! Transaction signature:", tx);
    return { tx };
  } catch (error) {
    console.error("Error releasing escrow:", error);
    throw error;
  }
};

// Refund buyer (if needed)
export const refundBuyer = async (
  program: Program<PikaVault>,
  buyer: PublicKey,
  seller: PublicKey,
  marketplace: PublicKey,
  listing: PublicKey,
  escrow: PublicKey
) => {
  try {
    const [buyerAccount] = findUserAccountPDA(buyer, program.programId);
    const [sellerAccount] = findUserAccountPDA(seller, program.programId);

    const tx = await program.methods
      .refund()
      .accountsStrict({
        buyer: buyer,
        buyerAccount: buyerAccount,
        sellerAccount: sellerAccount,
        marketplace: marketplace,
        listing: listing,
        escrow: escrow,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Buyer refunded successfully! Transaction signature:", tx);
    return { tx };
  } catch (error) {
    console.error("Error refunding buyer:", error);
    throw error;
  }
};

// Get marketplace data
export const getMarketplace = async (program: Program<PikaVault>, authority: PublicKey) => {
  try {
    const [marketplace] = findMarketplacePDA(authority, program.programId);
    const marketplaceData = await program.account.marketPlace.fetch(marketplace);
    return { marketplace, data: marketplaceData };
  } catch (error) {
    console.error("Error fetching marketplace:", error);
    throw error;
  }
};

// Get user account data
export const getUserAccount = async (program: Program<PikaVault>, user: PublicKey) => {
  try {
    const [userAccount] = findUserAccountPDA(user, program.programId);
    const userData = await program.account.userAccount.fetch(userAccount);
    return { userAccount, data: userData };
  } catch (error) {
    console.error("Error fetching user account:", error);
    throw error;
  }
};

// Get listing data
export const getListing = async (program: Program<PikaVault>, marketplace: PublicKey, nftMint: PublicKey) => {
  try {
    const [listing] = findListingPDA(marketplace, nftMint, program.programId);
    const listingData = await program.account.listingAccount.fetch(listing);
    return { listing, data: listingData };
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};

// Get escrow data
export const getEscrow = async (program: Program<PikaVault>, listing: PublicKey) => {
  try {
    const [escrow] = findEscrowPDA(listing, program.programId);
    const escrowData = await program.account.escrow.fetch(escrow);
    return { escrow, data: escrowData };
  } catch (error) {
    console.error("Error fetching escrow:", error);
    throw error;
  }
};

// Get all listings for a marketplace
export const getAllListings = async (program: Program<PikaVault>) => {
  try {
    const listings = await program.account.listingAccount.all();
    return listings;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw error;
  }
};

// Get user's listings
export const getUserListings = async (program: Program<PikaVault>, user: PublicKey) => {
  try {
    const listings = await program.account.listingAccount.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: user.toBase58(),
        },
      },
    ]);
    return listings;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw error;
  }
}; 

// Get all NFTs owned by a specific wallet address
export const getUserOwnedNFTs = async (
  program: Program<PikaVault>,
  ownerAddress: PublicKey
): Promise<{
  nftMint: string;
  metadata: {
    name: string;
    image: string;
    description?: string;
    attributes?: NFTAttribute[];
  };
  isListed: boolean;
  listingInfo?: {
    listingPubkey: string;
    price: number;
    status: "active" | "sold" | "unlisted";
  };
}[]> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (!program?.provider.connection) {
        throw new Error("No connection available");
      }

      console.log(`Fetching NFTs for wallet (attempt ${attempt + 1}):`, ownerAddress.toString());

      // Get all token accounts owned by the user with retry logic
      let tokenAccounts;
      try {
        tokenAccounts = await program.provider.connection.getParsedTokenAccountsByOwner(
          ownerAddress,
          { programId: TOKEN_PROGRAM_ID }
        );
      } catch (rpcError: any) {
        console.warn(`RPC call failed on attempt ${attempt + 1}:`, rpcError);
        
        if (attempt === maxRetries - 1) {
          throw new Error(`Failed to fetch token accounts after ${maxRetries} attempts: ${rpcError.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      console.log("Found token accounts:", tokenAccounts.value.length);

      // Filter for NFTs (accounts with amount = 1 and decimals = 0)
      const nftAccounts = tokenAccounts.value.filter(account => {
        const tokenInfo = account.account.data.parsed.info;
        return tokenInfo.tokenAmount.amount === "1" && tokenInfo.tokenAmount.decimals === 0;
      });

      console.log("Found NFT accounts:", nftAccounts.length);

      if (nftAccounts.length === 0) {
        return [];
      }

      // Create UMI instance for metadata fetching
      const umi = createUmiInstance(program.provider.connection.rpcEndpoint);

      // Fetch all current marketplace listings to check if NFTs are listed with retry
      let allListings: Awaited<ReturnType<typeof getAllListings>>;
      try {
        allListings = await getAllListingsWithRetry(program, 3);
      } catch (listingError: any) {
        console.warn("Failed to fetch marketplace listings, assuming no listings:", listingError);
        allListings = [];
      }
      
      // Check escrow existence for sold listings
      const listingMap = new Map();
      await Promise.all(
        allListings.map(async (listing) => {
          let status: "active" | "sold" | "unlisted" = "unlisted";
          
          if (listing.account.status.active) {
            status = "active";
          } else if (listing.account.status.sold) {
            // Check if escrow still exists - if not, the sale is complete and we should skip it
            try {
              const [escrow] = findEscrowPDA(listing.publicKey, program.programId);
              await program.account.escrow.fetch(escrow);
              // Escrow exists, so it's still in "sold" state
              status = "sold";
            } catch (error) {
              // Escrow doesn't exist, meaning it was released - skip this listing
              console.log(`Escrow for listing ${listing.publicKey.toString()} was released, skipping`);
              return;
            }
          }
          
          listingMap.set(listing.account.nftAddress.toString(), {
            listingPubkey: listing.publicKey.toString(),
            price: parseInt(listing.account.listingPrice.toString()) / 1000000000,
            status
          });
        })
      );

      // Fetch metadata for each NFT in parallel with error handling
      const nftDataPromises = nftAccounts.map(async (account) => {
        const mintAddress = account.account.data.parsed.info.mint;
        
        try {
          // Fetch NFT metadata using UMI
          const metadata = await fetchNFTMetadata(umi, mintAddress);
          
          // Check if NFT is listed
          const listingInfo = listingMap.get(mintAddress);
          
          return {
            nftMint: mintAddress,
            metadata,
            isListed: !!listingInfo,
            listingInfo
          };
        } catch (metadataError) {
          console.error(`Error fetching metadata for NFT ${mintAddress}:`, metadataError);
          return {
            nftMint: mintAddress,
            metadata: {
              name: `NFT #${mintAddress.slice(0, 6).toUpperCase()}`,
              image: "/placeholder-1.png"
            },
            isListed: false
          };
        }
      });

      const nftData = await Promise.all(nftDataPromises);
      console.log("Fetched NFT data:", nftData);

      return nftData;

    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        throw new Error(`Failed to fetch user NFTs after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`);
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error("Failed to fetch user NFTs");
};

// Helper function to get all listings with retry logic
const getAllListingsWithRetry = async (program: Program<PikaVault>, maxRetries = 3) => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Fetching marketplace listings (attempt ${attempt + 1})...`);
      return await getAllListings(program);
    } catch (error: any) {
      lastError = error;
      console.warn(`Listings fetch attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        throw new Error(`Failed to fetch marketplace listings after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw lastError || new Error("Failed to fetch marketplace listings");
};

// Helper function to fetch NFT metadata using UMI
const fetchNFTMetadata = async (
  umi: Umi, 
  mintAddress: string
): Promise<{ name: string; image: string; description?: string; attributes?: NFTAttribute[] }> => {
  try {
    // Import UMI functions
    const { fetchDigitalAsset } = await import("@metaplex-foundation/mpl-token-metadata");
    const { publicKey: umiPublicKey } = await import("@metaplex-foundation/umi");
    
    // Convert mint address to UMI public key
    const mintPubkey = umiPublicKey(mintAddress);
    
    // Fetch digital asset (NFT) metadata
    const digitalAsset = await fetchDigitalAsset(umi, mintPubkey);
    
    // Extract metadata
    const metadata = digitalAsset.metadata;
    const name = metadata.name || `NFT #${mintAddress.slice(0, 6).toUpperCase()}`;
    
    let imageUrl = "/placeholder-1.png";
    let attributes: NFTAttribute[] | undefined = undefined;
    
    // Fetch off-chain metadata if URI exists
    if (metadata.uri) {
      try {
        const response = await fetch(metadata.uri);
        const offChainMetadata: NFTMetadata = await response.json();
        imageUrl = offChainMetadata.image || imageUrl;
        attributes = offChainMetadata.attributes;
      } catch (error) {
        console.warn("Failed to fetch off-chain metadata:", error);
      }
    }
    
    return {
      name,
      image: imageUrl,
      description: metadata.uri ? undefined : undefined,
      attributes
    };
  } catch (error) {
    console.error("Error fetching NFT metadata for", mintAddress, ":", error);
    return {
      name: `NFT #${mintAddress.slice(0, 6).toUpperCase()}`,
      image: "/placeholder-1.png"
    };
  }
}; 

// Get real ownership history for an NFT by fetching blockchain transactions
export const getNFTOwnershipHistory = async (
  program: Program<PikaVault>,
  nftMint: string
): Promise<Array<{ owner: string; date: string; price: number; txHash: string }>> => {
  try {
    if (!program?.provider.connection) {
      throw new Error("No connection available");
    }

    const nftMintPubkey = new PublicKey(nftMint);
    console.log(`Fetching ownership history for NFT: ${nftMint}`);

    // Get signature history for the NFT mint address
    const signatures = await program.provider.connection.getSignaturesForAddress(
      nftMintPubkey,
      { limit: 50 } // Limit to recent transactions
    );

    console.log(`Found ${signatures.length} signatures for NFT`);

    const ownershipHistory: Array<{ owner: string; date: string; price: number; txHash: string }> = [];

    // Process signatures in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      
      const transactionPromises = batch.map(async (signatureInfo) => {
        try {
          // Get the full transaction details
          const transaction = await program.provider.connection.getTransaction(
            signatureInfo.signature,
            { maxSupportedTransactionVersion: 0 }
          );

          if (!transaction) return null;

          // Parse the transaction to extract ownership transfers and prices
          const blockTime = transaction.blockTime;
          const date = blockTime ? new Date(blockTime * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          // Check if this is a marketplace transaction (contains our program)
          let accountKeys: any[] = [];
          if ('accountKeys' in transaction.transaction.message) {
            accountKeys = transaction.transaction.message.accountKeys;
          } else if ('getAccountKeys' in transaction.transaction.message) {
            accountKeys = transaction.transaction.message.getAccountKeys().staticAccountKeys;
          }
          
          const isMarketplaceTransaction = accountKeys.some(
            (account: any) => account.equals(program.programId)
          );

          if (isMarketplaceTransaction) {
            // Try to extract price from program logs
            let price = 0;
            if (transaction.meta?.logMessages) {
              for (const log of transaction.meta.logMessages) {
                // Look for price in listing or purchase logs
                if (log.includes('listing_price') || log.includes('sale_amount')) {
                  const priceMatch = log.match(/(\d+)/);
                  if (priceMatch) {
                    price = parseInt(priceMatch[1]) / 1000000000; // Convert lamports to SOL
                  }
                }
              }
            }

                         // Extract the owner from pre/post token balances
             let owner = "";
             if (transaction.meta?.preTokenBalances && transaction.meta?.postTokenBalances) {
               // Find the token account that received the NFT
               const postBalance = transaction.meta.postTokenBalances.find(
                 balance => balance.mint === nftMint && balance.uiTokenAmount.uiAmount === 1
               );
              
              if (postBalance) {
                owner = postBalance.owner || "";
              }
            }

            // If we couldn't extract from balances, try to get from account keys
            if (!owner && accountKeys.length > 0) {
              // Use the first signer as a fallback
              owner = accountKeys[0].toString();
            }

            if (owner) {
              return {
                owner,
                date,
                price: price || 0,
                txHash: signatureInfo.signature
              };
            }
          }

          return null;
        } catch (error) {
          console.error(`Error processing transaction ${signatureInfo.signature}:`, error);
          return null;
        }
      });

      const results = await Promise.all(transactionPromises);
      
      // Add valid results to history
      results.forEach(result => {
        if (result) {
          ownershipHistory.push(result);
        }
      });
    }

    // Sort by date (newest first)
    ownershipHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Found ${ownershipHistory.length} ownership history entries`);
    return ownershipHistory;

  } catch (error) {
    console.error("Error fetching NFT ownership history:", error);
    
    // Return empty array on error, let the UI handle fallback
    return [];
  }
}; 