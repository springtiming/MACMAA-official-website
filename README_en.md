# MACMAA Official Website

[中文](./README.md)

## Overview

The MACMAA Official Website repository powers the public-facing website for the Manningham Australian Chinese Mutual Aid Association. It is built with Next.js and TypeScript and supports community-facing journeys such as news publishing, event registration, membership applications, volunteer workflows, and administrative operations, while also supporting bilingual presentation and SEO-oriented rendering.

## Key Capabilities

- Bilingual Chinese and English user experience
- News listing, article detail pages, and admin-side news management
- Event discovery, event detail pages, online registration, and payment review workflows
- Membership applications, member-code verification, and membership-related pricing logic
- Volunteer application flows with administrative review support
- Admin modules for accounts, news, events, members, volunteers, and site settings
- SEO configuration, sitemap generation, and production-ready pre-rendering

## Tech Stack

- **Application Framework**: Next.js 14, React 18, TypeScript
- **UI Layer**: Tailwind CSS, Radix UI, custom component library
- **Animation**: Framer Motion
- **Backend Integration**: Supabase
- **Payments and Notifications**: Stripe, Resend
- **Deployment Target**: Vercel

## Repository Structure

```text
.
|-- public/              Static assets and public site files
|-- src/
|   |-- components/      Shared components and UI primitives
|   |-- config/          Site-level configuration
|   |-- contexts/        Language and global context providers
|   |-- features/        Feature-oriented business modules
|   |-- lib/             Shared client-side utilities
|   |-- pages/           Next.js pages and API routes
|   `-- server/          Server-side helpers
|-- supabase/            Supabase configuration and database migrations
|-- vercel.json          Deployment and local function settings
`-- README.md            Chinese documentation
```

## Local Development

### Prerequisites

- Node.js
- npm
- Project environment variables configured in `.env.local`
- See [`docs/环境变量配置说明.md`](./docs/环境变量配置说明.md) for the full Vercel / Supabase env setup guide

### Install and Run

```bash
npm install
npm run dev
```

The standard development workflow runs on the Next.js development server. If you need to emulate the local Vercel runtime, use:

```bash
npm run dev:api
```

## Available Scripts

```bash
# Start the Next.js development server
npm run dev

# Emulate the Vercel local environment
npm run dev:api

# Create a production build
npm run build

# Serve the production build
npm run start

# Run quality checks
npm run lint
npm run type-check
npm run test
npm run check
```

## Quality Checks

The repository includes automated tests for frontend logic and server-side helpers, alongside static validation steps:

- `npm run test`: runs the Vitest suite
- `npm run lint`: runs ESLint
- `npm run type-check`: runs TypeScript type checking
- `npm run check`: aggregates formatting, linting, and type validation

## Deployment Notes

- Production deployment targets Vercel
- The repository includes `vercel.json` and a dedicated `supabase/` directory for environment configuration and database migrations
- Full application flows require valid Vercel env vars and Supabase Edge Function Secrets
- Start local setup from `env.template`
- Detailed setup notes live in [`docs/环境变量配置说明.md`](./docs/环境变量配置说明.md)

## Licensing and Asset Use

### Source Code License

The source code is distributed under the [MIT License](./LICENSE).

### Client Asset Notice

All text, imagery, logos, and design assets in this repository belong to the Manningham Australian Chinese Mutual Aid Association. They are not licensed for reuse, redistribution, or adaptation without explicit permission.

### Authorization

This repository is published with the association's permission for official website work and portfolio presentation.

## Project Status

This repository is actively maintained as a production-oriented community website codebase, covering both public site experiences and internal administrative workflows.
