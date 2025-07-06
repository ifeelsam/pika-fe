import Link from "next/link";

export function Footer() {

  const currentDate = new Date();
  const year = currentDate.getFullYear();

  const footerSocials = [
    { name: "Discord", href: "https://discord.gg/Zsv8mC8NHH" },
    { name: "Twitter", href: "https://x.com/pikavault_" },
  ]

  return (
    <footer className="bg-pikavault-dark border-t border-white/10 py-12 px-6 md:px-12 lg:px-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3
              className="text-xl font-bold text-pikavault-yellow mb-6 font-monument"
            >
              PIKAVAULT
            </h3>
            <p className="text-white/70 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The next evolution in digital collectibles and beyond.
            </p>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-monument">
              EXPLORE
            </h4>
            <ul className="space-y-4">
              {["Collection", "Marketplace"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-white/70 hover:text-pikavault-yellow transition-colors font-space-grotesk"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-monument">
              COMPANY
            </h4>
            <ul className="space-y-4">
              {["About", "Press"].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="text-white/70 hover:text-pikavault-yellow transition-colors font-space-grotesk"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold mb-6 font-monument">
              CONNECT
            </h4>
            <ul className="space-y-4">
              {footerSocials.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-pikavault-yellow transition-colors font-space-grotesk"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm mb-4 md:mb-0 font-space-grotesk">
            © {year} PikaVault. All rights reserved.
          </p>

          <div className="flex space-x-6">
            {["Terms", "Privacy", "Support"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-white/50 hover:text-pikavault-yellow text-sm transition-colors font-space-grotesk"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
