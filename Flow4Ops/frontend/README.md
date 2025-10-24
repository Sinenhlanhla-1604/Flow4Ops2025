# Flow4Ops Frontend (Next.js 14 + shadcn/ui)

Modern, accessible, and responsive frontend for Flow4Ops operations platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or 20+ recommended)
- npm, yarn, or pnpm

### Setup

1. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Configure environment:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your API URL and Supabase keys
```

3. **Install shadcn/ui components:**
```bash
# Install initial components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

4. **Start development server:**
```bash
npm run dev
```

App will be available at: **http://localhost:3000**

---

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── layout.tsx     # Dashboard shell (sidebar, header)
│   │   ├── page.tsx       # Dashboard home
│   │   ├── clients/       # CRM module
│   │   ├── deals/
│   │   ├── requests/      # Employee requests
│   │   └── settings/
│   ├── layout.tsx         # Root layout (providers, fonts)
│   ├── globals.css        # Tailwind + theme variables
│   └── not-found.tsx      # 404 page
├── components/
│   ├── ui/                # shadcn/ui components (button, input, etc.)
│   ├── layout/            # Shared layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   ├── clients/           # Client module components
│   │   ├── client-list.tsx
│   │   ├── client-form.tsx
│   │   └── client-card.tsx
│   └── shared/            # Reusable components
│       ├── data-table.tsx
│       ├── status-badge.tsx
│       └── empty-state.tsx
├── lib/
│   ├── api.ts             # Axios client + interceptors
│   ├── utils.ts           # cn() helper
│   ├── validations.ts     # Zod schemas
│   └── hooks/             # Custom React hooks
│       ├── use-auth.ts
│       └── use-toast.ts
├── store/                 # Zustand state management
│   ├── auth-store.ts      # User session, permissions
│   └── ui-store.ts        # Global UI state (sidebar, modals)
├── types/                 # TypeScript types
│   ├── api.ts             # API response types
│   ├── client.ts
│   ├── deal.ts
│   └── user.ts
├── public/                # Static assets (images, fonts)
├── .env.local.example     # Environment variables template
├── components.json        # shadcn/ui config
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript config
└── next.config.js         # Next.js config
```

---

## 🛠️ Development Commands

### Running
```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

### Code Quality
```bash
# Type check (find TypeScript errors)
npm run type-check

# Lint (find code issues)
npm run lint

# Format code with Prettier
npm run format
```

### Adding Components
```bash
# Install any shadcn/ui component
npx shadcn-ui@latest add [component-name]

# Examples:
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add separator
```

**Browse all components:** https://ui.shadcn.com/docs/components

---

## 🎨 Styling Guidelines

### Using Tailwind Classes
```tsx
// ✅ Good - semantic, responsive
<div className="flex items-center gap-4 rounded-lg border p-4 md:p-6">

// ❌ Avoid - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Component Variants (using CVA)
```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input hover:bg-accent",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## 🔐 Authentication Flow

1. **Login:** POST `/auth/login` → save tokens to localStorage
2. **API calls:** Axios automatically adds `Authorization: Bearer <token>`
3. **Token refresh:** If 401, try `/auth/refresh` → retry request
4. **Logout:** Clear localStorage, redirect to `/login`

**Protected routes:**
```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) redirect("/login");
  
  return <Sidebar>{children}</Sidebar>;
}
```

---

## 📚 Key Libraries

| Library | Purpose | Docs |
|---------|---------|------|
| **Next.js 14** | React framework with App Router | [nextjs.org](https://nextjs.org) |
| **shadcn/ui** | Copy-paste component library | [ui.shadcn.com](https://ui.shadcn.com) |
| **Tailwind CSS** | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com) |
| **React Hook Form** | Form state management | [react-hook-form.com](https://react-hook-form.com) |
| **Zod** | Schema validation | [zod.dev](https://zod.dev) |
| **Axios** | HTTP client | [axios-http.com](https://axios-http.com) |
| **Zustand** | State management | [zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs) |
| **Lucide Icons** | Icon library | [lucide.dev](https://lucide.dev) |

---

## 🐛 Troubleshooting

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it (replace PID)
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### API connection errors
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check NEXT_PUBLIC_API_URL in .env.local
echo $NEXT_PUBLIC_API_URL  # Should be http://localhost:8000
```

### TypeScript errors
```bash
# Regenerate types
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🚢 Deployment

(Phase 2 — Production deployment to Vercel/Netlify)

---

**Next steps:** See `backend/README.md` for API documentation.