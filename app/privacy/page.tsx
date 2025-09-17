"use client"

import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { Footer } from "@/components/footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Header */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight font-monument">
              PRIVACY <span className="text-pikavault-yellow">POLICY</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pikavault-yellow via-pikavault-cyan to-pikavault-pink mb-8"></div>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl font-space-grotesk">
              Your privacy matters. Here's how we protect your data in the digital realm.
            </p>
            <p className="text-sm text-pikavault-cyan mt-4 font-space-grotesk">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-yellow to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-yellow font-monument">
                DATA COLLECTION
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>We collect information to provide you with the best PikaVault experience:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-pikavault-cyan mr-3 mt-1">▸</span>
                    <span><strong className="text-white">Wallet Information:</strong> Public wallet addresses for blockchain transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-cyan mr-3 mt-1">▸</span>
                    <span><strong className="text-white">Card Data:</strong> Information about your digital collectibles and metadata</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-cyan mr-3 mt-1">▸</span>
                    <span><strong className="text-white">Usage Analytics:</strong> How you interact with our platform (anonymized)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-cyan mr-3 mt-1">▸</span>
                    <span><strong className="text-white">Device Information:</strong> Browser type, IP address, and device identifiers</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-pink to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-pink font-monument">
                HOW WE USE DATA
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>Your data powers the PikaVault ecosystem:</p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-yellow font-bold mb-3 font-monument">PLATFORM OPERATIONS</h3>
                    <p className="text-sm">Process transactions, manage your collection, and maintain platform security.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-cyan font-bold mb-3 font-monument">IMPROVEMENTS</h3>
                    <p className="text-sm">Analyze usage patterns to enhance features and user experience.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-pink font-bold mb-3 font-monument">COMMUNICATIONS</h3>
                    <p className="text-sm">Send important updates about your account and platform changes.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-white font-bold mb-3 font-monument">COMPLIANCE</h3>
                    <p className="text-sm">Meet legal requirements and prevent fraudulent activities.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-cyan to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-cyan font-monument">
                BLOCKCHAIN & PRIVACY
              </h2>
              <div className="bg-pikavault-dark/50 border-l-4 border-pikavault-cyan p-6 mb-6">
                <div className="flex items-start">
                  <span className="text-pikavault-cyan text-2xl mr-4">⚡</span>
                  <div>
                    <h3 className="text-white font-bold mb-2 font-monument">DECENTRALIZED DATA</h3>
                    <p className="text-white/80 font-space-grotesk">
                      Blockchain transactions are public and permanent. Your wallet address and transaction history 
                      are visible on the Solana network. This is inherent to blockchain technology and cannot be changed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white font-monument">
                DATA SHARING
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>We never sell your personal data. Limited sharing occurs only for:</p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start">
                    <span className="text-pikavault-yellow mr-3 mt-1">●</span>
                    <span><strong className="text-white">Service Providers:</strong> Third-party services that help operate the platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-yellow mr-3 mt-1">●</span>
                    <span><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-yellow mr-3 mt-1">●</span>
                    <span><strong className="text-white">Business Transfers:</strong> In case of merger, acquisition, or sale</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-yellow to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-yellow font-monument">
                YOUR RIGHTS
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-pikavault-yellow/20 bg-pikavault-yellow/5">
                  <div className="text-3xl mb-4">👁️</div>
                  <h3 className="text-pikavault-yellow font-bold mb-2 font-monument">ACCESS</h3>
                  <p className="text-sm text-white/80 font-space-grotesk">Request copies of your personal data</p>
                </div>
                <div className="text-center p-6 border border-pikavault-cyan/20 bg-pikavault-cyan/5">
                  <div className="text-3xl mb-4">✏️</div>
                  <h3 className="text-pikavault-cyan font-bold mb-2 font-monument">CORRECT</h3>
                  <p className="text-sm text-white/80 font-space-grotesk">Update inaccurate information</p>
                </div>
                <div className="text-center p-6 border border-pikavault-pink/20 bg-pikavault-pink/5">
                  <div className="text-3xl mb-4">🗑️</div>
                  <h3 className="text-pikavault-pink font-bold mb-2 font-monument">DELETE</h3>
                  <p className="text-sm text-white/80 font-space-grotesk">Request data deletion (where possible)</p>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-pink to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-pink font-monument">
                SECURITY MEASURES
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>We implement industry-standard security measures:</p>
                <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>End-to-end encryption for sensitive data</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Regular security audits and monitoring</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Secure data storage with access controls</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-3">✓</span>
                      <span>Blockchain-level transaction security</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-cyan to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-cyan font-monument">
                COOKIES & TRACKING
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>We use cookies and similar technologies to:</p>
                <ul className="space-y-2 ml-6">
                  <li>• Remember your preferences and settings</li>
                  <li>• Analyze platform performance and usage</li>
                  <li>• Provide personalized experiences</li>
                  <li>• Ensure platform security</li>
                </ul>
                <p className="text-sm text-white/60">
                  You can control cookie preferences through your browser settings.
                </p>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white font-monument">
                POLICY UPDATES
              </h2>
              <div className="bg-muted/10 border border-white/20 p-6 rounded-none">
                <p className="text-white/80 font-space-grotesk">
                  We may update this privacy policy from time to time. Changes will be posted on this page 
                  with an updated revision date. Continued use of PikaVault constitutes acceptance of any changes.
                </p>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-yellow to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-yellow font-monument">
                CONTACT US
              </h2>
              <div className="bg-pikavault-dark/50 border border-pikavault-yellow/20 p-8 rounded-none">
                <p className="text-white/80 mb-4 font-space-grotesk">
                  Questions about this privacy policy or how we handle your data?
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center">
                    <span className="text-pikavault-yellow mr-3">📧</span>
                    <span className="font-space-grotesk">Reach out through our support channels</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pikavault-cyan mr-3">🔗</span>
                    <span className="font-space-grotesk">Connect with us on social media</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Legal Disclaimer */}
          {/* <div className="mt-16 p-6 bg-red-900/10 border-l-4 border-red-500 rounded-none">
            <p className="text-xs text-red-300 font-space-grotesk">
              <strong>Legal Disclaimer:</strong> This privacy policy is a template and may not cover all legal requirements 
              for your jurisdiction. Consult with legal professionals to ensure full compliance with applicable privacy laws.
            </p>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  )
}