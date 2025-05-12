// app/layout.js
'use client';
import './globals.css';
import Link from 'next/link';
import WalletConnect from './components/WalletConnect';
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.querySelectorAll('.animate-on-load').forEach(el => {
        el.classList.add('opacity-100');
      });
    }
  }, []);

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="relative flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden font-[Space_Mono,sans-serif]">
        {/* Cosmic Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute w-full h-full bg-[url('/cosmic-pattern.svg')] opacity-10 animate-pan-infinite" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow-delay" />
        </div>

        {/* Floating Navigation Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-xl shadow-lg">
          <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Animated Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform duration-500 hover:scale-105"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-float drop-shadow-glow">
                SpaceLedger
              </span>
              <span className="hidden sm:inline text-base text-slate-400 group-hover:text-purple-300 transition-all duration-300 delay-75">
                | IPFS + Blockchain (exSat)
              </span>
            </Link>

            {/* Navigation Links & WalletConnect */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/encrypt"
                  className="relative px-4 py-2 text-slate-200 font-semibold rounded-lg bg-gradient-to-r from-blue-600/30 to-blue-800/40 hover:from-blue-600 hover:to-blue-700 hover:text-blue-300 transition-all duration-300 shadow-md group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-400">🔒</span>
                    Encrypt & Upload
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-transparent transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  href="/decrypt"
                  className="relative px-4 py-2 text-slate-200 font-semibold rounded-lg bg-gradient-to-r from-purple-600/30 to-purple-800/40 hover:from-purple-600 hover:to-purple-700 hover:text-purple-300 transition-all duration-300 shadow-md group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-purple-400">🔓</span>
                    Retrieve & Decrypt
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-transparent transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>
              {/* WalletConnect Button */}
              
            </div>
          </nav>
        </header>

        {/* Main Content with Entry Animation */}
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          <div className="animate-on-load opacity-0 transition-opacity duration-1000 delay-150">
            {children}
          </div>
        </main>

        {/* Floating Footer */}
        <footer className="border-t border-slate-700/40 mt-12 bg-slate-900/80 backdrop-blur-xl shadow-inner relative z-10 animate-on-load opacity-100 transition-all duration-700">
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col items-center justify-center text-center text-slate-400 text-sm gap-2">
      <p className="transform transition-all hover:scale-[1.03] duration-300">
        © {new Date().getFullYear()} <span className="font-bold text-blue-300">SpaceLedger</span> - Securing Cosmic Data on Blockchain
      </p>
      <p className="opacity-80 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
        <span>Powered by</span>
        <span className="text-purple-300 font-bold">IPFS</span>
        <span className="text-slate-400">+</span>
        <span className="text-blue-300 font-bold">exSat</span>
      </p>
    </div>
  </div>
</footer>


      </body>
    </html>
  );
}
