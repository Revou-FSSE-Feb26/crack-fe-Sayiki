import React from "react";
import "./globals.css";

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
        {/* --- SWITCHLAB NAVIGATION BAR --- */}
        <nav className="bg-brand-sidebar border-b border-brand-border sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <a href="/" className="inline-block px-3 py-1 bg-brand-navy text-white font-black text-lg rounded tracking-tighter">
                  SwitchLab
                </a>
                <div className="hidden md:flex gap-6">
                  <a href="/search" className="text-sm font-medium text-brand-textMain hover:text-brand-navy transition-colors">Search</a>
                  <a href="/modders" className="text-sm font-medium text-brand-textMuted hover:text-brand-navy transition-colors">Modders</a>
                  <a href="#" className="text-sm font-medium text-brand-textMuted hover:text-brand-navy transition-colors">Services</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a href="/login" className="text-sm font-medium text-brand-textMuted hover:text-brand-navy transition-colors">Log in</a>
                <a href="/register" className="px-4 py-2 bg-brand-navy text-white rounded text-sm font-medium hover:opacity-90 transition-all">Sign up</a>
              </div>
            </div>
          </div>
        </nav>

        {/* --- MAIN MAIN CONTENT CONTROLLER --- */}
        <main className="grow">
          {children}
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-brand-sidebar border-t border-brand-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="inline-block px-3 py-1 bg-brand-navy text-white font-black text-lg rounded tracking-tighter mb-4">
                  SwitchLab
                </div>
                <p className="text-brand-textMuted text-sm">The premier marketplace for custom mechanical keyboard enthusiasts.</p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-textMain mb-3">Shop</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Switches</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Keycaps</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Cables</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Accessories</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-brand-textMain mb-3">Services</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Find Modders</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Custom Builds</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Repairs</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-brand-textMain mb-3">Support</h3>
                <ul className="space-y-2 text-sm text-brand-textMuted">
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-brand-navy transition-colors">Returns</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-brand-border pt-8 mt-8 text-center text-sm text-brand-textMuted">
              © 2024 SwitchLab. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}