"use client"

import { Navigation } from "@/components/navigation"
import { BackgroundEffects } from "@/components/background-effects"
import { Footer } from "@/components/footer"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-pikavault-dark text-white overflow-hidden relative">
      <BackgroundEffects />
      <Navigation />

      <main className="pt-24 pb-32 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Header */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight font-monument">
              TERMS OF <span className="text-pikavault-pink">SERVICE</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pikavault-pink via-pikavault-cyan to-pikavault-yellow mb-8"></div>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl font-space-grotesk">
              The rules of engagement in the PikaVault digital ecosystem.
            </p>
            <p className="text-sm text-pikavault-cyan mt-4 font-space-grotesk">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-pink to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-pink font-monument">
                ACCEPTANCE OF TERMS
              </h2>
              <div className="bg-pikavault-dark/50 border-l-4 border-pikavault-pink p-6">
                <div className="flex items-start">
                  <span className="text-pikavault-pink text-2xl mr-4">⚖️</span>
                  <div>
                    <h3 className="text-white font-bold mb-2 font-monument">BINDING AGREEMENT</h3>
                    <p className="text-white/80 font-space-grotesk">
                      By accessing and using PikaVault, you accept and agree to be bound by the terms and provisions 
                      of this agreement. If you do not agree to these terms, you may not use our platform.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-cyan to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-cyan font-monument">
                SERVICE DESCRIPTION
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>PikaVault is a cutting-edge platform that revolutionizes digital collectibles:</p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-yellow font-bold mb-3 font-monument">BLOCKCHAIN POWERED</h3>
                    <p className="text-sm">Collect and trade Pokémon cards using Solana blockchain technology</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-cyan font-bold mb-3 font-monument">SECURE TRADING</h3>
                    <p className="text-sm">Safe, transparent marketplace for digital card transactions</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-pikavault-pink font-bold mb-3 font-monument">DIGITAL OWNERSHIP</h3>
                    <p className="text-sm">Verifiable ownership through NFT technology</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                    <h3 className="text-white font-bold mb-3 font-monument">COMMUNITY DRIVEN</h3>
                    <p className="text-sm">Connect with collectors and enthusiasts worldwide</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-yellow to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-yellow font-monument">
                USER RESPONSIBILITIES
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>As a PikaVault user, you are responsible for:</p>
                <ul className="space-y-4 ml-6">
                  <li className="flex items-start">
                    <span className="text-pikavault-yellow mr-3 mt-1 text-xl">🔐</span>
                    <div>
                      <strong className="text-white block">Wallet Security</strong>
                      <span className="text-sm">Maintaining the security of your wallet and private keys</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-cyan mr-3 mt-1 text-xl">✅</span>
                    <div>
                      <strong className="text-white block">Data Accuracy</strong>
                      <span className="text-sm">Ensuring all card information you provide is accurate and authentic</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pikavault-pink mr-3 mt-1 text-xl">⚖️</span>
                    <div>
                      <strong className="text-white block">Legal Compliance</strong>
                      <span className="text-sm">Complying with all applicable laws and regulations</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-white mr-3 mt-1 text-xl">🚫</span>
                    <div>
                      <strong className="text-white block">Ethical Conduct</strong>
                      <span className="text-sm">Not engaging in fraudulent or illegal activities</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-red-500 to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-red-400 font-monument">
                PROHIBITED ACTIVITIES
              </h2>
              <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-none">
                <p className="text-white/80 mb-4 font-space-grotesk">You may not use PikaVault to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      <span className="text-sm">Upload counterfeit or fake card information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      <span className="text-sm">Engage in market manipulation or fraud</span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      <span className="text-sm">Violate intellectual property rights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-3 mt-1">×</span>
                      <span className="text-sm">Harm the platform or other users</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-cyan to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-cyan font-monument">
                BLOCKCHAIN TRANSACTIONS
              </h2>
              <div className="bg-pikavault-dark/50 border-l-4 border-pikavault-cyan p-6 mb-6">
                <div className="flex items-start">
                  <span className="text-pikavault-cyan text-2xl mr-4">⛓️</span>
                  <div>
                    <h3 className="text-white font-bold mb-2 font-monument">IRREVERSIBLE TRANSACTIONS</h3>
                    <p className="text-white/80 font-space-grotesk mb-4">
                      All transactions are processed on the Solana blockchain. Once confirmed, transactions are 
                      <strong className="text-pikavault-yellow"> irreversible</strong>. You acknowledge the risks 
                      associated with blockchain technology and cryptocurrency transactions.
                    </p>
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-none">
                      <p className="text-yellow-300 text-sm font-space-grotesk">
                        <strong>⚠️ Warning:</strong> Double-check all transaction details before confirming. 
                        We cannot reverse or refund blockchain transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-white to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white font-monument">
                INTELLECTUAL PROPERTY
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <div className="bg-white/5 border border-white/10 p-6 rounded-none">
                  <div className="flex items-start">
                    <span className="text-4xl mr-4">©️</span>
                    <div>
                      <h3 className="text-white font-bold mb-2 font-monument">THIRD PARTY TRADEMARKS</h3>
                      <p className="text-sm mb-3">
                        Pokémon and related characters are trademarks of Nintendo/Creatures Inc./GAME FREAK Inc.
                      </p>
                      <p className="text-xs text-white/60">
                        PikaVault is not affiliated with, endorsed by, or sponsored by these entities. 
                        All trademarks are property of their respective owners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-pink to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-pink font-monument">
                LIMITATION OF LIABILITY
              </h2>
              <div className="bg-pikavault-dark/50 border border-pikavault-pink/20 p-6 rounded-none">
                <div className="space-y-4 text-white/80 font-space-grotesk">
                  <div className="flex items-start">
                    <span className="text-pikavault-pink text-2xl mr-4">⚠️</span>
                    <div>
                      <h3 className="text-white font-bold mb-2 font-monument">"AS IS" SERVICE</h3>
                      <p className="text-sm">
                        PikaVault is provided "as is" without warranties of any kind. We are not liable for any 
                        damages arising from your use of the platform, including but not limited to:
                      </p>
                    </div>
                  </div>
                  <ul className="text-sm space-y-2 ml-12">
                    <li>• Loss of digital assets or cryptocurrency</li>
                    <li>• Platform downtime or technical issues</li>
                    <li>• Third-party actions or market volatility</li>
                    <li>• Data breaches or security incidents</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-red-500 to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-red-400 font-monument">
                ACCOUNT TERMINATION
              </h2>
              <div className="space-y-4 text-white/80 font-space-grotesk">
                <p>We reserve the right to terminate or suspend your account at any time for:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-none">
                    <h4 className="text-red-400 font-bold mb-2 font-monument">VIOLATIONS</h4>
                    <p className="text-sm">Breach of these terms or community guidelines</p>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-none">
                    <h4 className="text-red-400 font-bold mb-2 font-monument">SUSPICIOUS ACTIVITY</h4>
                    <p className="text-sm">Fraudulent or harmful behavior</p>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-none">
                    <h4 className="text-red-400 font-bold mb-2 font-monument">LEGAL REQUIREMENTS</h4>
                    <p className="text-sm">Compliance with legal orders or regulations</p>
                  </div>
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-none">
                    <h4 className="text-red-400 font-bold mb-2 font-monument">PLATFORM PROTECTION</h4>
                    <p className="text-sm">Safeguarding the community and platform integrity</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-yellow to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-yellow font-monument">
                TERMS UPDATES
              </h2>
              <div className="bg-muted/10 border border-white/20 p-6 rounded-none">
                <div className="flex items-start">
                  <span className="text-pikavault-yellow text-2xl mr-4">🔄</span>
                  <div>
                    <h3 className="text-white font-bold mb-2 font-monument">EVOLVING TERMS</h3>
                    <p className="text-white/80 font-space-grotesk">
                      We may modify these terms at any time to reflect changes in our services, legal requirements, 
                      or industry standards. Changes will be posted on this page with an updated revision date. 
                      Continued use of the platform constitutes acceptance of the modified terms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pikavault-cyan to-transparent"></div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-pikavault-cyan font-monument">
                CONTACT & SUPPORT
              </h2>
              <div className="bg-pikavault-dark/50 border border-pikavault-cyan/20 p-8 rounded-none">
                <p className="text-white/80 mb-4 font-space-grotesk">
                  Questions about these Terms of Service or need assistance?
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center">
                    <span className="text-pikavault-cyan mr-3">💬</span>
                    <span className="font-space-grotesk">Contact us through our support channels</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-pikavault-yellow mr-3">🌐</span>
                    <span className="font-space-grotesk">Join our community discussions</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Legal Disclaimer */}
          {/* <div className="mt-16 p-6 bg-red-900/10 border-l-4 border-red-500 rounded-none">
            <p className="text-xs text-red-300 font-space-grotesk">
              <strong>Legal Disclaimer:</strong> This is a terms of service template and may not cover all legal requirements 
              for your jurisdiction. Please consult with a legal professional to ensure compliance with applicable laws and regulations.
            </p>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  )
}