import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sellerProfileSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  email: z.string().email().optional().or(z.literal("")),
  twitter: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = sellerProfileSchema.parse(body)

    const hasContact =
      (parsed.email && parsed.email.trim() !== "") ||
      (parsed.twitter && parsed.twitter.trim() !== "")

    if (!hasContact) {
      return NextResponse.json(
        { error: "Please provide at least one contact method" },
        { status: 400 }
      )
    }

    const profile = await prisma.sellerProfile.upsert({
      where: { walletAddress: parsed.walletAddress },
      create: {
        walletAddress: parsed.walletAddress,
        email: parsed.email?.trim() || null,
        twitter: parsed.twitter?.trim() || null,
      },
      update: {
        email: parsed.email?.trim() || null,
        twitter: parsed.twitter?.trim() || null,
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error("Failed to save seller profile:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Unable to save seller contact details" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { walletAddress },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Failed to fetch seller profile:", error)
    return NextResponse.json(
      { error: "Unable to load seller profile" },
      { status: 500 }
    )
  }
}

