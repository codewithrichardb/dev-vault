# Next.js Concepts Guide — DevVault Project

This guide teaches every Next.js concept used in the DevVault project, with explanations and references to the actual code.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [App Router](#2-app-router)
3. [Layouts](#3-layouts)
4. [Server Components vs Client Components](#4-server-components-vs-client-components)
5. [Routing](#5-routing)
   - [Static Routes](#51-static-routes)
   - [Dynamic Routes](#52-dynamic-routes)
   - [Route Groups](#53-route-groups)
   - [Catch-All Routes](#54-catch-all-routes)
6. [API Routes (Route Handlers)](#6-api-routes-route-handlers)
7. [Linking & Navigation](#7-linking--navigation)
8. [Metadata & SEO](#8-metadata--seo)
   - [Static Metadata](#81-static-metadata)
   - [Dynamic Metadata](#82-dynamic-metadata)
9. [Image Optimization](#9-image-optimization)
10. [Server Actions](#10-server-actions)
11. [Authentication (NextAuth)](#11-authentication-nextauth)
12. [Middleware](#12-middleware)
13. [Caching & Revalidation (ISR)](#13-caching--revalidation-isr)
14. [Redirects](#14-redirects)
15. [Path Aliases](#15-path-aliases)
16. [Styling with Tailwind CSS v4](#16-styling-with-tailwind-css-v4)
17. [Configuration Files](#17-configuration-files)

---

## 1. Project Structure

Next.js uses a file-system based router. The folder structure **is** your routing structure.

```
dev-vault/
├── app/                     # All routes and pages live here
│   ├── layout.tsx           # Root layout (wraps every page)
│   ├── page.tsx             # Home page (/)
│   ├── globals.css          # Global styles
│   ├── (auth)/              # Route group (no URL impact)
│   │   └── login/
│   │       └── page.tsx     # /login
│   ├── projects/
│   │   └── [id]/
│   │       └── page.tsx     # /projects/:id (dynamic)
│   ├── dashboard/
│   │   └── page.tsx         # /dashboard
│   └── api/
│       ├── auth/[...nextauth]/
│       │   └── route.ts     # NextAuth API endpoints
│       └── stats/
│           └── route.ts     # Custom API endpoint
├── components/              # Reusable UI components
│   ├── LikeButton.tsx       # Client component
│   └── NoteForm.tsx         # Client component using server action
├── lib/                     # Shared utilities & server logic
│   ├── auth.ts              # NextAuth configuration
│   └── actions.ts           # Server actions
├── middleware.ts             # Request middleware
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS / Tailwind setup
└── tsconfig.json            # TypeScript configuration
```

**Key rule:** A folder becomes a route only when it contains a `page.tsx` file.

---

## 2. App Router

Next.js 13+ introduced the **App Router** (the `app/` directory), replacing the older `pages/` directory.

Everything inside `app/` uses the App Router, which gives you:
- **Server Components by default** (components run on the server unless you opt out)
- **Nested layouts** (shared UI between pages)
- **Streaming & Suspense** support
- **Server Actions** (call server functions from forms)

> **Used in:** Every file inside `app/`

---

## 3. Layouts

A layout is shared UI that wraps child pages. The root layout (`app/layout.tsx`) wraps **every page** in the app.

```tsx
// app/layout.tsx
async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <body>
        <nav>...</nav>
        <main>{children}</main>  {/* <-- Pages render here */}
      </body>
    </html>
  )
}
```

**Key points:**
- The root layout **must** contain `<html>` and `<body>` tags
- `{children}` is where the current page renders
- Layouts don't re-render when navigating between sibling pages — they persist
- The root layout is a **Server Component**, so it can be `async` and fetch data (like the session)

> **Used in:** `app/layout.tsx`

---

## 4. Server Components vs Client Components

This is one of the most important concepts in modern Next.js.

### Server Components (Default)

Every component in the `app/` directory is a **Server Component** by default. They:
- Run **only on the server**
- Can be `async` and directly await data
- Can access databases, file systems, and secrets
- Send **zero JavaScript** to the browser
- **Cannot** use hooks (`useState`, `useEffect`) or browser APIs

```tsx
// app/page.tsx — Server Component (default, no directive needed)
export default function HomePage() {
  // This runs on the server
  return <h1>Hello</h1>
}
```

### Client Components

Add `'use client'` at the top of a file to make it a Client Component. They:
- Run in the **browser**
- Can use React hooks (`useState`, `useEffect`, etc.)
- Can handle user interactions (clicks, inputs)
- Are needed for anything interactive

```tsx
// components/LikeButton.tsx
'use client'  // <-- This directive makes it a Client Component

import { Heart } from "lucide-react"
import { useState } from "react"

export default function LikeButton() {
  const [liked, setLiked] = useState(false)
  return (
    <button onClick={() => setLiked(!liked)}>
      <Heart /> {liked ? "Liked" : "Like"}
    </button>
  )
}
```

### When to use which?

| Need                          | Use              |
|-------------------------------|------------------|
| Fetch data, access DB         | Server Component |
| Use `useState` / `useEffect`  | Client Component |
| Handle clicks / user input    | Client Component |
| Display static content        | Server Component |
| Access environment secrets    | Server Component |

**Strategy used in DevVault:** Keep everything as Server Components, and only use Client Components for interactive parts (`LikeButton`, `NoteForm`).

> **Used in:** `components/LikeButton.tsx`, `components/NoteForm.tsx` (client), all `page.tsx` files (server)

---

## 5. Routing

### 5.1 Static Routes

A folder with a `page.tsx` creates a route:

```
app/page.tsx           → /
app/dashboard/page.tsx → /dashboard
```

> **Used in:** `app/page.tsx`, `app/dashboard/page.tsx`

### 5.2 Dynamic Routes

Square brackets `[param]` create dynamic route segments:

```
app/projects/[id]/page.tsx → /projects/1, /projects/abc, etc.
```

Access the parameter via `params`:

```tsx
// app/projects/[id]/page.tsx
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Use id to find the right project
}
```

> **Used in:** `app/projects/[id]/page.tsx`

### 5.3 Route Groups

Parentheses `(folderName)` create a **route group** — it organizes files without affecting the URL:

```
app/(auth)/login/page.tsx → /login  (NOT /auth/login)
```

This is useful for:
- Organizing related routes together
- Applying different layouts to route groups

> **Used in:** `app/(auth)/login/page.tsx`

### 5.4 Catch-All Routes

Three dots `[...param]` capture **all** remaining URL segments:

```
app/api/auth/[...nextauth]/route.ts
```

This matches:
- `/api/auth/signin`
- `/api/auth/signout`
- `/api/auth/callback/github`
- `/api/auth/anything/else/here`

This is how NextAuth handles all its routes with a single file.

> **Used in:** `app/api/auth/[...nextauth]/route.ts`

---

## 6. API Routes (Route Handlers)

In the App Router, API endpoints are created with `route.ts` files that export HTTP method functions:

```tsx
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

You can export `GET`, `POST`, `PUT`, `DELETE`, `PATCH` functions. Each handles that HTTP method.

**Key rule:** A folder can have **either** a `page.tsx` (UI) **or** a `route.ts` (API), not both.

> **Used in:** `app/api/auth/[...nextauth]/route.ts`, `app/api/stats/route.ts`

---

## 7. Linking & Navigation

Use the `Link` component from `next/link` for client-side navigation (no full page reload):

```tsx
import Link from 'next/link'

// Basic link
<Link href="/">Home</Link>

// Dynamic link
<Link href={`/projects/${project.id}`}>View Project</Link>
```

**Why not `<a>` tags?**
- `Link` prefetches pages in the background
- Navigation is instant (client-side)
- It preserves client-side state

> **Used in:** `app/layout.tsx`, `app/page.tsx`

---

## 8. Metadata & SEO

### 8.1 Static Metadata

Export a `metadata` object for pages with fixed titles/descriptions:

```tsx
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "DevVault | Creator Showcase",
  description: "The ultimate vault for developer projects and premium case studies"
}
```

This generates the `<title>` and `<meta>` tags in the HTML `<head>`.

> **Used in:** `app/layout.tsx`

### 8.2 Dynamic Metadata

For pages where metadata depends on data (like the project name), export a `generateMetadata` function:

```tsx
// app/projects/[id]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = projects.find((p) => p.id === id)
  return {
    title: project?.title || "Project Not Found",
  }
}
```

This runs on the server and generates metadata per-request based on the route parameters.

> **Used in:** `app/projects/[id]/page.tsx`

---

## 9. Image Optimization

The `next/image` component automatically optimizes images:

```tsx
import Image from 'next/image'

<Image
  src={project.image}
  alt={project.title}
  fill                    // Fills the parent container
  className="object-cover" // CSS to cover the area
/>
```

**Benefits:**
- Automatic lazy loading
- Serves modern formats (WebP/AVIF)
- Resizes images to the size they're displayed at
- Prevents layout shift

**Configuration:** External image domains must be whitelisted in `next.config.ts`:

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
}
```

> **Used in:** `app/projects/[id]/page.tsx`, `next.config.ts`

---

## 10. Server Actions

Server Actions let you run server-side code directly from forms — no need to create a separate API route.

### Defining a Server Action

Add `"use server"` at the top of a file to mark all exports as Server Actions:

```tsx
// lib/actions.ts
"use server"
import { revalidatePath } from "next/cache"
import { auth } from "./auth"

export async function saveProjectNote(formData: FormData) {
  const session = await auth()
  if (!session) return "You must be signed in to save a note."

  const id = formData.get("id") as string
  const note = formData.get("note") as string

  console.log("Saving note to project", id, note)

  revalidatePath(`/projects/${id}`)  // Clear cached page
  return { success: true }
}
```

### Using a Server Action in a Client Component

```tsx
// components/NoteForm.tsx
'use client'
import { saveProjectNote } from "@/lib/actions"

export default function NoteForm({ projectId }: { projectId: string }) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("id", projectId)
    await saveProjectNote(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="note" />
      <button type="submit">Save Note</button>
    </form>
  )
}
```

### Inline Server Action (in a Server Component)

You can also define a server action inline:

```tsx
// app/layout.tsx (Server Component)
<form action={async () => { "use server"; await signOut(); }}>
  <button>Sign Out</button>
</form>
```

**Key points:**
- Server Actions always run on the **server**, even when called from Client Components
- They receive `FormData` as their argument
- They can access databases, secrets, and auth
- Use `revalidatePath()` to refresh cached pages after mutations

> **Used in:** `lib/actions.ts`, `components/NoteForm.tsx`, `app/layout.tsx`

---

## 11. Authentication (NextAuth)

DevVault uses **NextAuth v5** (Auth.js) with GitHub as the OAuth provider.

### Configuration

```tsx
// lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboardPage = nextUrl.pathname.startsWith('/dashboard')
      if (!isLoggedIn && isOnDashboardPage) {
        return false  // Block access
      }
      return true
    },
  }
})
```

**What's exported:**
| Export     | Purpose                                    |
|------------|--------------------------------------------|
| `handlers` | GET/POST handlers for `/api/auth/*` routes |
| `auth`     | Get the current session (server-side)      |
| `signIn`   | Trigger sign-in                            |
| `signOut`  | Trigger sign-out                           |

### Checking the Session

In any Server Component:

```tsx
const session = await auth()
if (session) {
  // User is logged in
  console.log(session.user?.name)
}
```

### The Auth Flow

1. User clicks "Sign In" link → navigates to `/api/auth/signin`
2. NextAuth shows the GitHub sign-in option
3. User authorizes with GitHub
4. NextAuth creates a session and redirects back
5. `auth()` now returns the session with user info

> **Used in:** `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/layout.tsx`, `app/projects/[id]/page.tsx`, `lib/actions.ts`

---

## 12. Middleware

Middleware runs **before** every matched request. It can redirect, rewrite, or modify headers.

```tsx
// middleware.ts (project root)
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"]
}
```

**How this works:**
1. A request comes in for `/dashboard` or `/settings`
2. The `matcher` config tells Next.js to run middleware for those paths
3. NextAuth's `auth` function runs as the middleware
4. The `authorized` callback in `lib/auth.ts` checks if the user is logged in
5. If not authorized, the user is redirected to the sign-in page

**`matcher` patterns:**
- `/dashboard/:path*` matches `/dashboard`, `/dashboard/settings`, `/dashboard/a/b/c`, etc.

**Key rule:** Middleware must be in the **project root** (not inside `app/`).

> **Used in:** `middleware.ts`

---

## 13. Caching & Revalidation (ISR)

**ISR (Incremental Static Regeneration)** lets you create static pages that update periodically.

### Setting Revalidation Time

```tsx
// app/page.tsx
export const revalidate = 3600  // Revalidate every 1 hour (3600 seconds)
```

**How it works:**
1. First visit: Next.js generates and caches the page
2. Subsequent visits within 1 hour: Serve the cached version (instant)
3. After 1 hour: Next request triggers a background regeneration
4. New cached version replaces the old one

### On-Demand Revalidation

You can also manually invalidate the cache (used after a form submission):

```tsx
// lib/actions.ts
import { revalidatePath } from "next/cache"

revalidatePath(`/projects/${id}`)  // Bust the cache for this specific page
```

> **Used in:** `app/page.tsx` (revalidate), `lib/actions.ts` (revalidatePath)

---

## 14. Redirects

Use `redirect()` from `next/navigation` to programmatically redirect users:

```tsx
// app/projects/[id]/page.tsx
import { redirect } from "next/navigation"

export default async function ProjectPage({ params }) {
  const session = await auth()

  if (project.premium && !session) {
    redirect("/api/auth/signin")  // Send unauthenticated users to login
  }

  return <div>...</div>
}
```

**Key points:**
- `redirect()` throws internally — code after it won't execute
- It works in Server Components, Server Actions, and Route Handlers
- It sends a 307 (temporary redirect) by default

> **Used in:** `app/projects/[id]/page.tsx`

---

## 15. Path Aliases

TypeScript path aliases let you use clean imports instead of relative paths:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This lets you write:

```tsx
// Instead of:
import { auth } from "../../lib/auth"

// You write:
import { auth } from "@/lib/auth"
```

`@/` always points to the project root, no matter how deeply nested the importing file is.

> **Used in:** Every file that imports from `lib/` or `components/`

---

## 16. Styling with Tailwind CSS v4

DevVault uses **Tailwind CSS v4**, which has a simplified setup compared to v3.

### Setup

```css
/* app/globals.css */
@import "tailwindcss";  /* This single import enables all Tailwind utilities */
```

```js
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind v4 uses PostCSS
  },
};
```

**Important:** The `globals.css` file must be imported in the root layout:

```tsx
// app/layout.tsx
import "./globals.css"
```

### Theme Customization

Tailwind v4 uses `@theme` instead of a config file:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Common Tailwind Patterns Used

**Layout:**
```tsx
<div className="flex items-center justify-between">   // Flexbox
<div className="grid md:grid-cols-2 gap-6">           // Responsive grid
<main className="max-w-5xl mx-auto py-10 px-6">       // Centered container
```

**Typography:**
```tsx
<h1 className="text-4xl font-extrabold tracking-tighter">  // Large heading
<p className="text-sm text-slate-600">                      // Small muted text
```

**Interactive:**
```tsx
<div className="hover:shadow-lg transition">           // Hover effect
<button className="bg-slate-900 text-white hover:bg-slate-800"> // Button
```

**Responsive design:** Use breakpoint prefixes like `md:` (medium screens and up):
```tsx
<div className="grid md:grid-cols-2">
  {/* 1 column on mobile, 2 columns on medium+ screens */}
</div>
```

> **Used in:** Every component with `className`

---

## 17. Configuration Files

### `next.config.ts`

Next.js runtime and build configuration:

```tsx
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],  // Allow external images
  },
}

export default nextConfig
```

### `tsconfig.json`

TypeScript compiler settings. Key options:
- `"jsx": "preserve"` — Let Next.js handle JSX transformation
- `"paths": { "@/*": ["./*"] }` — Path aliases
- `"strict": true` — Enable strict type checking

### `postcss.config.mjs`

Configures PostCSS to process Tailwind CSS:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
export default config
```

### `middleware.ts`

Root-level file that intercepts requests before they reach routes. See [Middleware](#12-middleware).

### `.env` (not committed)

Environment variables for secrets:
```
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

---

## Concept Map

Here's how all the concepts connect in a typical request flow:

```
User visits /projects/123
        │
        ▼
  ┌─ middleware.ts ──────────────────┐
  │  Checks if route is protected   │
  │  (matcher: /dashboard, /settings)│
  │  /projects/* is not matched,     │
  │  so request passes through       │
  └──────────────────────────────────┘
        │
        ▼
  ┌─ app/layout.tsx ─────────────────┐
  │  Server Component (root layout)  │
  │  • Loads session via auth()      │
  │  • Renders nav bar               │
  │  • Renders {children} ──────────────┐
  └──────────────────────────────────┘  │
        │                               │
        ▼                               │
  ┌─ app/projects/[id]/page.tsx ────┐   │
  │  Server Component               │◄──┘
  │  • Extracts id from params      │
  │  • generateMetadata() runs      │
  │  • Checks auth for premium      │
  │  • Renders <Image>, <LikeButton>│
  └──────────────────────────────────┘
        │
        ▼
  ┌─ components/LikeButton.tsx ─────┐
  │  Client Component ('use client') │
  │  • useState for like toggle      │
  │  • Runs in the browser           │
  └──────────────────────────────────┘
```

---

## Quick Reference

| Concept               | File(s)                                | Key API / Syntax                    |
|-----------------------|----------------------------------------|--------------------------------------|
| Root Layout           | `app/layout.tsx`                       | `export default function Layout`     |
| Static Route          | `app/page.tsx`                         | `page.tsx` in a folder               |
| Dynamic Route         | `app/projects/[id]/page.tsx`           | `[param]` folder name               |
| Route Group           | `app/(auth)/login/page.tsx`            | `(groupName)` folder name           |
| Catch-All Route       | `app/api/auth/[...nextauth]/route.ts`  | `[...param]` folder name            |
| API Route             | `app/api/*/route.ts`                   | `export { GET, POST }`              |
| Server Component      | All `page.tsx` files                   | Default (no directive)              |
| Client Component      | `components/LikeButton.tsx`            | `'use client'`                      |
| Static Metadata       | `app/layout.tsx`                       | `export const metadata`             |
| Dynamic Metadata      | `app/projects/[id]/page.tsx`           | `export async function generateMetadata` |
| Image Optimization    | `app/projects/[id]/page.tsx`           | `import Image from 'next/image'`    |
| Server Action         | `lib/actions.ts`                       | `"use server"`                      |
| Middleware             | `middleware.ts`                        | `export const config = { matcher }` |
| ISR / Revalidation    | `app/page.tsx`                         | `export const revalidate = 3600`    |
| On-Demand Revalidation| `lib/actions.ts`                       | `revalidatePath()`                  |
| Redirect              | `app/projects/[id]/page.tsx`           | `redirect()`                        |
| Client Navigation     | `app/layout.tsx`, `app/page.tsx`       | `import Link from 'next/link'`      |
| Path Aliases          | `tsconfig.json`                        | `"@/*": ["./*"]`                    |
| Auth (NextAuth)       | `lib/auth.ts`                          | `NextAuth({ providers, callbacks })`|
| Tailwind CSS v4       | `globals.css`, `postcss.config.mjs`    | `@import "tailwindcss"`             |
