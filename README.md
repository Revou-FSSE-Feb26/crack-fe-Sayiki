# SwitchLab - Mechanical Keyboard Marketplace

A Next.js marketplace connecting keyboard enthusiasts with expert modders and premium components.

## 🎯 Features

### Core Pages
- **Homepage**: Hero section, category browser, featured services & products
- **Modder Directory**: Filterable directory with trust scores, locations, and audio samples
- **Product Detail**: E-commerce layout for ready-stock items with variations and shipping
- **Service Detail**: Booking system with configuration options and escrow process
- **Search Results**: Toggle filters for services vs products


## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage with hero & cards
│   ├── modders/page.tsx      # Modder discovery directory  
│   ├── search/page.tsx       # Search results with filters
│   ├── service/[id]/page.tsx # Service booking page
│   ├── product/[id]/page.tsx # Product purchase page
│   ├── login/page.tsx        # Authentication
│   └── layout.tsx            # Navigation & footer
├── components/
│   ├── Button.tsx            # Reusable button component
│   └── Input.tsx             # Form input component
public/images/
├── hero.jpg                  # Hero background
├── lubing-switches.webp      # Service images
├── stabs.webp               # Stabilizer work
├── switches.jpg             # Product images
└── prebuilt-kb.webp         # Custom builds
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Styling**: Tailwind CSS 4 with custom brand colors
- **Language**: TypeScript
- **Icons**: Custom SVG icons in /public

## 🎨 Design Philosophy

### Card-Based UI
- **Services**: Configuration-heavy booking with escrow
- **Products**: Standard e-commerce with cart/buy now
- **Modders**: Trust-focused profiles with audio samples

### Specialized Filters
- **Location**: For shipping calculations (Jakarta, Bandung, etc.)
- **Specialties**: Lubing, Soldering, Hall Effect, etc.
- **Equipment**: Professional tools (Ultrasonic Cleaner, etc.)
- **Turnaround**: Express (1-2 days) vs Standard (3-5 days)

## 🔧 Key Components

### Service Booking Panel
- Switch type selection (Linear/Tactile/Clicky)
- Quantity selector with live pricing
- Add-ons (Films, Stabilizer tuning)
- Escrow payment system

### Product Purchase Panel  
- Variation selector (70x/90x/110x packs)
- Stock-aware quantity controls
- Shipping options (Instant/Same Day/Regular)
- Cart and direct purchase options

### Modder Profile Cards
- Status indicators (Accepting/Queue Full/On Break)
- Trust scores with review counts
- Specialty tags and equipment lists
- Sound test audio players


Built for the mechanical keyboard community with attention to the details that matter most to enthusiasts.
