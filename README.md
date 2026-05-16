# College Dost — Modern Rebuild

A Next.js 14 + MySQL rebuild of [collegedost.in](https://collegedost.in/) with a modern, mobile-first liquid-glass UI, dark and light themes, full SEO setup, and an admin panel.

## Stack

- **Next.js 14** (App Router) + TypeScript + React 18
- **Tailwind CSS** with a custom liquid-glass design system
- **Prisma** ORM + **MySQL 8**
- **NextAuth** (credentials) for admin authentication
- **Framer Motion** for animations
- **react-three-fiber** + **drei** for 3D hero elements
- **Docker** + docker-compose (app, MySQL, phpMyAdmin)

## Features

### Public site
- Hero with animated 3D orbs and floating glass cards
- Tools cards: Rank Predictor, College Predictor, Mock Test
- Communities (JEE, EAMCET, KCET, MHT-CET, KEAM, TNEA, WBJEE, Private)
- About + counselling support, CTA banner
- Engineering colleges directory (`/colleges`) with filters and detail pages
- Exams index (`/exams`) and per-exam pages
- Blog (`/blog`) with markdown posts
- Rank Predictor (`/rank-predictor[/:exam]`)
- College Predictor (`/college-predictor[/:exam]`)
- Mock Test landing (`/mock-test`)
- Contact, About, Privacy, Terms
- WhatsApp floating action button
- Sticky frosted nav with mobile drawer
- Theme toggle (light/dark/system)

### SEO + performance
- Per-page `metadata`, OpenGraph, Twitter cards
- `sitemap.xml`, `robots.txt`, web app manifest
- Standalone Next output for slim Docker images
- Reduced-motion + accessibility support

### Admin panel (`/admin`)
- Secure login with NextAuth (credentials)
- Dashboard with metrics
- CRUD for Colleges, Exams, Communities, Blog Posts
- Leads inbox (contact-form submissions)
- Settings page

## Quick start (local)

```bash
cp .env.example .env
npm install
docker compose up -d mysql phpmyadmin
npx prisma db push
npm run db:seed
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin/login> for admin (default: `admin@collegedost.in` / `ChangeMe@123`).

phpMyAdmin runs at <http://localhost:8080>.

## Quick start (full Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

The app container runs `prisma db push` on boot. Seed the database once with:

```bash
docker compose exec app npx tsx prisma/seed.ts
```

## Folder structure

```
src/app
├─ (site)/          → public site
├─ admin/           → admin panel (auth-protected)
└─ api/             → REST endpoints (auth, predictor, leads, admin/*)

src/components
├─ ui/              → primitives (GlassCard, Button, ThemeToggle, ...)
├─ layout/          → Navbar, Footer, WhatsAppFab
├─ home/            → home-page sections (Hero, Tools, Communities, ...)
├─ three/           → 3D scene (FloatingOrbs)
└─ admin/           → AdminSidebar, AdminTopbar, CrudTable

src/lib             → db, auth, seo, utils, admin-resources
prisma              → schema.prisma + seed.ts
```

## Notes

- The rank predictor uses heuristic mapping. Replace with your actual cutoff data via the `Cutoff` model.
- Add more questions/branches by extending the `Cutoff` and adding a `Question` model when you wire mock tests.
- Designed mobile-first with safe-area-friendly nav and touch targets.
