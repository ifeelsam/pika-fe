"use client"

import React from 'react'
import { MarketplaceInterface } from "@/components/marketplace/marketplace-interface";
import { InitializeMarketplace } from '@/components/marketplace/initialize-marketplace';

export default function TestMarketplacePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-8" style={{ fontFamily: "'Monument Extended', sans-serif" }}>
          TEST MARKETPLACE
        </h1>
        <InitializeMarketplace />
      </div>
      <MarketplaceInterface />
    </div>
  )
}