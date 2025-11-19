import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { z } from "zod"

const createOrderSchema = z.object({
  listingPubkey: z.string().min(1, "Listing is required"),
  nftMint: z.string().min(1, "NFT mint is required"),
  cardId: z.string().optional(),
  price: z.number().nonnegative(),
  buyerWallet: z.string().min(1, "Buyer wallet is required"),
  sellerWallet: z.string().min(1, "Seller wallet is required"),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  buyerTwitter: z.string().optional(),
})

const updateOrderSchema = z.object({
  listingPubkey: z.string().min(1, "Listing is required"),
  status: z.nativeEnum(OrderStatus),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createOrderSchema.parse(body)

    const hasContact =
      (parsed.buyerEmail && parsed.buyerEmail.trim() !== "") ||
      (parsed.buyerTwitter && parsed.buyerTwitter.trim() !== "")

    if (!hasContact) {
      return NextResponse.json(
        { error: "Please provide at least one contact method" },
        { status: 400 }
      )
    }

    const order = await prisma.order.upsert({
      where: { listingPubkey: parsed.listingPubkey },
      create: {
        listingPubkey: parsed.listingPubkey,
        nftMint: parsed.nftMint,
        cardId: parsed.cardId,
        price: parsed.price,
        buyerWallet: parsed.buyerWallet,
        sellerWallet: parsed.sellerWallet,
        buyerEmail: parsed.buyerEmail?.trim() || null,
        buyerTwitter: parsed.buyerTwitter?.trim() || null,
        status: OrderStatus.PENDING_SHIPMENT,
      },
      update: {
        buyerWallet: parsed.buyerWallet,
        sellerWallet: parsed.sellerWallet,
        buyerEmail: parsed.buyerEmail?.trim() || null,
        buyerTwitter: parsed.buyerTwitter?.trim() || null,
        price: parsed.price,
        nftMint: parsed.nftMint,
        cardId: parsed.cardId,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Failed to persist order:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Unable to save order details" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerWallet = searchParams.get("seller")
    const buyerWallet = searchParams.get("buyer")
    const listingPubkey = searchParams.get("listing")

    if (!sellerWallet && !buyerWallet && !listingPubkey) {
      return NextResponse.json(
        { error: "Provide a seller, buyer, or listing identifier" },
        { status: 400 }
      )
    }

    if (listingPubkey) {
      const order = await prisma.order.findUnique({
        where: { listingPubkey },
      })
      return NextResponse.json({ order })
    }

    let whereClause: { sellerWallet?: string; buyerWallet?: string } = {}
    if (sellerWallet) {
      whereClause.sellerWallet = sellerWallet
    }
    if (buyerWallet) {
      whereClause.buyerWallet = buyerWallet
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json(
      { error: "Unable to load orders" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = updateOrderSchema.parse(body)

    const order = await prisma.order.update({
      where: { listingPubkey: parsed.listingPubkey },
      data: { status: parsed.status },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Failed to update order:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Unable to update order status" },
      { status: 500 }
    )
  }
}

