import type { NextConfig } from "next";
import type { Config } from "tailwindcss";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lightBg: "#F8FAFC", // Latar belakang utama 
          sidebar: "#FFFFFF", // Latar belakang container/card/navbar
          navy: "#1A3673", // Aksen Utama (Biru pekat untuk tombol & header)
          terracotta: "#B85C56", // Aksen Sekunder (Merah pudar untuk link/danger)
          mustard: "#DE9337", // Aksen Tersier (Kuning hangat untuk status pending)
          border: "#E2E8F0", // Garis pembatas yang tipis & clean
          textMain: "#0F172A", // Teks utama 
          textMuted: "#64748B", // Teks sekunder
        },
      },
    },
  },
  plugins: [],
};

export default nextConfig;
