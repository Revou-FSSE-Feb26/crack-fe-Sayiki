import React from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "SwitchLab",
  description: "The Ultimate Mechanical Keyboard Modification Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-lightBg text-brand-textMain flex flex-col min-h-screen">
        {/* --- DYNAMIC SWITCHLAB NAVIGATION BAR --- */}
        <Navbar />

        {/* --- MAIN CONTENT CONTROLLER --- */}
        <main className="grow">
          {children}
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-brand-sidebar border-t-2 border-slate-900 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="inline-block px-3.5 py-1.5 bg-brand-navy text-white font-black text-lg tracking-tight border-2 border-brand-navy mb-4">
                  SwitchLab
                </div>
                <p className="text-brand-textMuted text-sm">
                  The premier marketplace for custom mechanical keyboard enthusiasts.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-3">Shop</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="/search" className="hover:text-brand-navy transition-colors">Switches</a></li>
                  <li><a href="/search" className="hover:text-brand-navy transition-colors">Keycaps</a></li>
                  <li><a href="/search" className="hover:text-brand-navy transition-colors">Cables</a></li>
                  <li><a href="/search" className="hover:text-brand-navy transition-colors">Accessories</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-3">Services</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="/modders" className="hover:text-brand-navy transition-colors">Find Modders</a></li>
                  <li><a href="/services" className="hover:text-brand-navy transition-colors">Custom Builds</a></li>
                  <li><a href="/services" className="hover:text-brand-navy transition-colors">Repairs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brand-textMain mb-3">Support</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="/orders" className="hover:text-brand-navy transition-colors">Escrow Protection</a></li>
                  <li><a href="/orders" className="hover:text-brand-navy transition-colors">Track Orders</a></li>
                  <li><a href="/modders" className="hover:text-brand-navy transition-colors">Verified Modders</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-8 mt-8 text-center text-xs font-mono text-brand-textMuted">
              © 2026 SwitchLab Studio. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}