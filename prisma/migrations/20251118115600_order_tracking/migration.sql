-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_SHIPMENT', 'SHIPPED', 'ESCROW_RELEASED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "listingPubkey" TEXT NOT NULL,
    "nftMint" TEXT NOT NULL,
    "cardId" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "buyerWallet" TEXT NOT NULL,
    "sellerWallet" TEXT NOT NULL,
    "buyerEmail" TEXT,
    "buyerTwitter" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_SHIPMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_listingPubkey_key" ON "Order"("listingPubkey");
