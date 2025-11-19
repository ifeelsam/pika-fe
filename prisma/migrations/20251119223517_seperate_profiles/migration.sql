/*
  Warnings:

  - You are about to drop the column `buyerEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `buyerTwitter` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "buyerEmail",
DROP COLUMN "buyerTwitter";

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "twitter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_walletAddress_key" ON "BuyerProfile"("walletAddress");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerWallet_fkey" FOREIGN KEY ("buyerWallet") REFERENCES "BuyerProfile"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerWallet_fkey" FOREIGN KEY ("sellerWallet") REFERENCES "SellerProfile"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
