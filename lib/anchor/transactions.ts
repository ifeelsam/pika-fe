import { PublicKey, SystemProgram, Keypair} from "@solana/web3.js";
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
    console.log("umi:", umi)
  }
  console.log("umi", umi)

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

// Combined function: Mint NFT with UMI and list on marketplace
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