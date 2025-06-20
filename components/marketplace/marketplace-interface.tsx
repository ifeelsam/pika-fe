"use client";

import { useState, useEffect } from "react";
import { useAnchorProgram } from "@/lib/anchor/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { 
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} from "@solana/spl-token";
import { 
  registerUser, 
  listNFT,
  createUmiInstance,
  mintNFTWithUmi,
  purchaseNFT,
  getAllListings,
  getUserAccount,
  findMarketplacePDA,
  delistNFT,
} from "@/lib/anchor/transactions";
import { MARKETPLACE_ADMIN } from "@/lib/anchor/config";

interface ListingData {
  publicKey: string;
  account: {
    owner: string;
    nftAddress: string;
    listingPrice: string;
    status: any;
    createdAt: string;
    bump: number;
  };
}

export function MarketplaceInterface() {
  const { program, wallet, connection } = useAnchorProgram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [userStats, setUserStats] = useState<any>(null);

  // Form states
  const [nftForm, setNftForm] = useState({
    name: "",
    symbol: "",
    price: "",
    description: "",
    imageUrl: ""
  });

  const [marketplace, setMarketplace] = useState<string>("");

  useEffect(() => {
    if (program && wallet.publicKey) {
      checkUserRegistration();
      loadListings();
      findMarketplace();
    }
  }, [program, wallet.publicKey]);

  const findMarketplace = async () => {
    if (!program) return;
    try {
      const [marketplacePDA] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId);
      setMarketplace(marketplacePDA.toString());
    } catch (error) {
      console.error("Error finding marketplace:", error);
    }
  };

  const checkUserRegistration = async () => {
    if (!program || !wallet.publicKey) return;
    try {
      const userAccount = await getUserAccount(program, wallet.publicKey);
      setUserRegistered(true);
      setUserStats(userAccount.data);
    } catch (error) {
      setUserRegistered(false);
    }
  };

  const loadListings = async () => {
    if (!program) return;
    try {
      const allListings = await getAllListings(program);
      const formattedListings = allListings.map(item => ({
        publicKey: item.publicKey.toString(),
        account: {
          owner: item.account.owner.toString(),
          nftAddress: item.account.nftAddress.toString(),
          listingPrice: item.account.listingPrice.toString(),
          status: item.account.status,
          createdAt: item.account.createdAt.toString(),
          bump: item.account.bump
        }
      }));
      setListings(formattedListings);
    } catch (error) {
      console.error("Error loading listings:", error);
    }
  };

  const handleRegisterUser = async () => {
    if (!program || !wallet.publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await registerUser(program, wallet.publicKey);
      setSuccess(`User registered successfully! TX: ${result.tx}`);
      setUserRegistered(true);
      await checkUserRegistration();
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err.message : "Failed to register user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintAndList = async () => {
    if (!program || !wallet.publicKey || !userRegistered || !connection) {
      setError("Please register first and connect wallet");
      return;
    }

    if (!nftForm.name || !nftForm.symbol || !nftForm.price || !nftForm.description || !nftForm.imageUrl) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting mint and list process...");

      // Step 1: Create UMI instance and mint NFT with metadata
      const umi = createUmiInstance(connection.rpcEndpoint, wallet);
      
      const nftResult = await mintNFTWithUmi(umi, {
        name: nftForm.name,
        symbol: nftForm.symbol,
        description: nftForm.description,
        image: nftForm.imageUrl,
      }, wallet);

      // Convert UMI public key to Solana public key
      const nftMint = new PublicKey(nftResult.nftMint.publicKey);

      console.log("NFT minted with metadata! Mint:", nftMint.toString());
      console.log("Metadata URI:", nftResult.metadataUri);

      // Step 2: List the NFT on the marketplace
      const [marketplacePDA] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId);
      const priceInLamports = parseFloat(nftForm.price) * LAMPORTS_PER_SOL;

      const listResult = await listNFT(
        program,
        wallet.publicKey,
        marketplacePDA,
        nftMint,
        priceInLamports
      );

      console.log("NFT listed on marketplace successfully!");

      setSuccess(`NFT minted with metadata and listed successfully! TX: ${listResult.tx} | Metadata: ${nftResult.metadataUri}`);
      setNftForm({ name: "", symbol: "", price: "", description: "", imageUrl: "" });
      await loadListings();
      await checkUserRegistration();
    } catch (err) {
      console.error("Mint and list failed:", err);
      setError(err instanceof Error ? err.message : "Failed to mint and list NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (listing: ListingData) => {
    if (!program || !wallet.publicKey || !userRegistered) {
      setError("Please register first and connect wallet");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [marketplacePDA] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId);

      const result = await purchaseNFT(
        program,
        wallet.publicKey,
        marketplacePDA,
        new PublicKey(listing.publicKey),
        new PublicKey(listing.account.nftAddress),
        new PublicKey(listing.account.owner)
      );

      setSuccess(`NFT purchased successfully! TX: ${result.tx}`);
      await loadListings();
      await checkUserRegistration();
    } catch (err) {
      console.error("Purchase failed:", err);
      setError(err instanceof Error ? err.message : "Failed to purchase NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelist = async (listing: ListingData) => {
    if (!program || !wallet.publicKey || !userRegistered) {
      setError("Please register first and connect wallet");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [marketplacePDA] = findMarketplacePDA(MARKETPLACE_ADMIN, program.programId);

      const result = await delistNFT(
        program,
        wallet.publicKey,
        marketplacePDA,
        new PublicKey(listing.account.nftAddress),
        new PublicKey(listing.publicKey)
      );

      setSuccess(`NFT delisted successfully! TX: ${result.tx}`);
      await loadListings();
      await checkUserRegistration();
    } catch (err) {
      console.error("Delist failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delist NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (!wallet.publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please connect your wallet to access the marketplace
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">PikaVault Marketplace</h1>
        {marketplace && (
          <p className="text-sm text-muted-foreground mb-4">
            Marketplace: {marketplace}
          </p>
        )}
        
        {userStats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{userStats.nftListed.toString()}</div>
                <p className="text-xs text-muted-foreground">Listed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{userStats.nftSold.toString()}</div>
                <p className="text-xs text-muted-foreground">Sold</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{userStats.nftBought.toString()}</div>
                <p className="text-xs text-muted-foreground">Bought</p>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">{error}</p>
            <Button variant="outline" size="sm" onClick={clearMessages} className="mt-2">
              Dismiss
            </Button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-800">{success}</p>
            <Button variant="outline" size="sm" onClick={clearMessages} className="mt-2">
              Dismiss
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={userRegistered ? "marketplace" : "register"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="mint" disabled={!userRegistered}>Mint & List</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Registration</CardTitle>
            </CardHeader>
            <CardContent>
              {userRegistered ? (
                <div className="text-center">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Registered
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You are registered and can now mint NFTs!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Register to start minting and trading NFTs on PikaVault
                  </p>
                  <Button 
                    onClick={handleRegisterUser} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Registering..." : "Register User"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mint & List NFT</CardTitle>
              <p className="text-sm text-muted-foreground">
                Mint an NFT using SPL tokens and list it on the marketplace
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">NFT Name</Label>
                <Input
                  id="name"
                  value={nftForm.name}
                  onChange={(e) => setNftForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Pikachu Card #001"
                />
              </div>

              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={nftForm.symbol}
                  onChange={(e) => setNftForm(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="PKC"
                />
              </div>

              <div>
                <Label htmlFor="price">Price (SOL)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={nftForm.price}
                  onChange={(e) => setNftForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={nftForm.description}
                  onChange={(e) => setNftForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Rare Pikachu trading card from the original series..."
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={nftForm.imageUrl}
                  onChange={(e) => setNftForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/pikachu.png"
                />
              </div>

              <Button 
                onClick={handleMintAndList} 
                disabled={isLoading || !userRegistered}
                className="w-full"
              >
                {isLoading ? "Minting & Listing..." : "Mint & List NFT"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No NFTs listed yet</p>
                </CardContent>
              </Card>
            ) : (
              listings.map((listing) => (
                <Card key={listing.publicKey}>
                  <CardHeader>
                    <CardTitle className="text-lg truncate">
                      NFT: {listing.account.nftAddress.slice(0, 8)}...
                    </CardTitle>
                    <Badge variant={
                      listing.account.status.active ? "default" : 
                      listing.account.status.sold ? "secondary" : "destructive"
                    }>
                      {listing.account.status.active ? "Active" : 
                       listing.account.status.sold ? "Sold" : "Unlisted"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Price:</strong> {(parseInt(listing.account.listingPrice) / LAMPORTS_PER_SOL).toFixed(4)} SOL</p>
                      <p><strong>Owner:</strong> {listing.account.owner.slice(0, 8)}...</p>
                      <p><strong>NFT:</strong> {listing.account.nftAddress.slice(0, 8)}...</p>
                    </div>
                    
                    {listing.account.status.active && 
                     listing.account.owner !== wallet.publicKey?.toString() && (
                      <Button 
                        onClick={() => handlePurchase(listing)}
                        disabled={isLoading}
                        className="w-full mt-3"
                        size="sm"
                      >
                        {isLoading ? "Purchasing..." : "Purchase"}
                      </Button>
                    )}
                    
                    {listing.account.owner === wallet.publicKey?.toString() && (
                      <div className="mt-3 space-y-2">
                        <Badge variant="outline" className="w-full justify-center">
                          Your NFT
                        </Badge>
                        {listing.account.status.active && (
                          <Button 
                            onClick={() => handleDelist(listing)}
                            disabled={isLoading}
                            variant="destructive"
                            className="w-full"
                            size="sm"
                          >
                            {isLoading ? "Delisting..." : "Delist NFT"}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 