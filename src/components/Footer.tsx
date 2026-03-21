import Link from "next/link";
import { Camera, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PhotoForge{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  AI
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Instant AI-powered background removal and passport photo generation.
              Print-ready results in seconds.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Upload Photo", href: "/upload" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Features", href: "/#features" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Information
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Contact", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} PhotoForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
