# SwitchLab - Mechanical Keyboard Marketplace

A Next.js marketplace connecting keyboard enthusiasts with expert modders and premium components.

## 🎯 Features

### Core Pages
- **Homepage**: Hero section, category browser, featured services & products
- **Modder Directory**: Filterable directory with trust scores, locations, and audio samples
- **Product Detail**: E-commerce layout for ready-stock items with variations and shipping
- **Service Detail**: Booking system with configuration options and escrow process
- **Search Results**: Toggle filters for services vs products

### Design System
- **Clear Visual Badges**: Purple [SERVICE] vs Green [READY STOCK] badges
- **Consistent Card Layout**: Same structure, different interactive panels
- **Two-Column Detail Pages**: 60% content, 40% dynamic booking/purchase panel
- **Professional Brand Colors**: Navy primary, terracotta accent, clean grays

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seed Sample Data (Development)

```bash
# Option 1: Using npm script
npm run seed

# Option 2: Using API endpoint
# POST http://localhost:3000/api/seed
```

**Test Accounts:**
- Admin: `admin@switchlab.com` / `Admin123!`
- Modder 1: `john.modder@switchlab.com` / `Modder123!`
- Modder 2: `jane.modder@switchlab.com` / `Modder123!`
- User: `user@example.com` / `User123!`

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                  # REST API endpoints
│   │   ├── auth/            # Authentication (login, register, me)
│   │   ├── products/        # Product CRUD operations
│   │   ├── services/        # Service CRUD operations
│   │   ├── modders/         # Modder profile management
│   │   └── seed/            # Database seeding (dev only)
│   ├── page.tsx             # Homepage with hero & cards
│   ├── modders/page.tsx     # Modder discovery directory  
│   ├── search/page.tsx      # Search results with filters
│   ├── service/[id]/page.tsx # Service booking page
│   ├── product/[id]/page.tsx # Product purchase page
│   ├── login/page.tsx       # Authentication
│   ├── register/page.tsx    # User registration
│   └── layout.tsx           # Navigation & footer
├── components/
│   ├── Button.tsx           # Reusable button component
│   └── Input.tsx            # Form input component
├── lib/
│   ├── db.ts                # Database layer (in-memory mock)
│   ├── auth.ts              # JWT authentication utilities
│   ├── validations.ts       # Zod validation schemas
│   ├── errors.ts            # Error handling utilities
│   └── seed.ts              # Database seeding script
public/images/
├── hero.jpg                 # Hero background
├── lubing-switches.webp     # Service images
├── stabs.webp              # Stabilizer work
├── switches.jpg            # Product images
└── prebuilt-kb.webp        # Custom builds
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.9 (App Router)
- **Styling**: Tailwind CSS 4 with custom brand colors
- **Language**: TypeScript
- **Icons**: Custom SVG icons in /public
- **Backend**: Next.js API Routes
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schemas
- **Database**: In-memory storage (ready for Prisma/PostgreSQL migration)

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

## 📱 Responsive Design
- Mobile-first approach
- Collapsible sidebar filters
- Touch-friendly card interactions
- Optimized image loading

## 🔐 API & Backend

Complete REST API with JWT authentication. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specifications.

### Key Features:
- **Authentication**: Register, login, JWT token management
- **Authorization**: Role-based access control (User, Modder, Admin)
- **Validation**: Request validation with Zod schemas
- **Error Handling**: Comprehensive error responses
- **Security**: Password hashing with bcrypt, JWT tokens

### API Endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/products` - List all products
- `POST /api/products` - Create product (Modder/Admin)
- `GET /api/services` - List all services
- `POST /api/services` - Create service (Modder/Admin)
- `GET /api/modders` - List all modders
- `POST /api/modders` - Create modder profile

See full documentation in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Built for the mechanical keyboard community with attention to the details that matter most to enthusiasts.
