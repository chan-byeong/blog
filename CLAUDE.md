# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 blog built with App Router, deployed via Docker and Nginx. It's a pnpm workspace monorepo with the blog application in `apps/blog/`. Content is stored as local MDX files in `apps/blog/content/posts/` with plans for future CMS migration.

## Development Commands

### Local Development

All development commands should be run from `apps/blog/` directory:

```bash
cd apps/blog
pnpm dev          # Start dev server at http://localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting
```

Root-level shortcuts (from project root):
```bash
pnpm dev          # Alias for apps/blog dev
pnpm build        # Alias for apps/blog build
pnpm start        # Alias for apps/blog start
pnpm lint         # Alias for apps/blog lint
```

### Docker & Deployment

**CRITICAL**: Docker commands must be run from the **project root** (not `apps/blog/`). The Dockerfile, docker-compose.yml, and .dockerignore are all located at the root level.

```bash
# From project root only
docker-compose up -d --build    # Build and start containers
docker-compose logs -f          # View logs
docker-compose restart          # Restart containers
docker-compose down             # Stop containers
docker-compose build --no-cache # Full rebuild

# Deployment scripts (from project root)
bash apps/blog/scripts/deploy.sh       # Auto deploy
bash apps/blog/scripts/health-check.sh # Health check
```

## Architecture

### Monorepo Structure

```
blog/                          # Project root (Docker commands here)
├── Dockerfile                 # Multi-stage build (final ~150MB)
├── docker-compose.yml         # Next.js + Nginx + Promtail
├── pnpm-workspace.yaml        # pnpm workspace config
├── promtail-grafana-cloud.yml # Log collection config
└── apps/
    └── blog/                  # Next.js app (dev commands here)
        ├── src/
        ├── content/posts/     # MDX blog posts
        ├── nginx/             # Nginx config and SSL
        └── scripts/           # Deployment scripts
```

### Content Management

Content is managed through local MDX files with frontmatter. The system is designed for easy CMS migration.

**Content Location**: `apps/blog/content/posts/*.mdx`

**MDX Structure**:
```markdown
---
title: 'Post Title'
description: 'Post description'
date: '2024-01-15'
tags: ['tag1', 'tag2']
---

# Content here
```

**Key Files**:
- `src/lib/posts.ts`: File system operations for MDX (getAllPosts, getPostBySlug, etc.)
- `src/lib/mdx.ts`: MDX parsing with rehype/remark plugins (parseMDX, extractTOC)
- `src/types/post.ts`: Post type definitions

**CMS Migration Path**: Modify functions in `src/lib/posts.ts` to call CMS APIs instead of reading from filesystem. Type definitions remain unchanged.

### Routing Structure

```
/                    → Home page (post list)
/posts/[slug]        → Individual post detail
/api/health          → Health check endpoint
/api/logs            → Client-side log ingestion
```

Dynamic routes use Static Generation with `generateStaticParams()`. Post slugs are derived from MDX filenames.

### Component Architecture

**Server Component First**: All components are Server Components by default. Only add `'use client'` when interactivity is required (state, events, browser APIs).

**Component Organization**:
```
src/components/
├── footer/           # Footer components
├── mdx/              # MDX custom components
├── post/             # Post-related components
├── posts-section/    # Post listing components
├── side-bar/         # Sidebar components
└── ui/               # Reusable UI components
```

**Layout System**: Uses CSS Grid layout defined in `src/app/layout.tsx`:
- Mobile: 8 columns
- Small: 16 columns
- Medium+: 24 columns
- Max width: `max-w-7xl`

### Logging System

The app uses a unified structured logging system (`src/lib/unified-logger.ts`) that outputs JSON logs to stdout. Logs are collected by Promtail and sent to Grafana Cloud.

**Usage**:
```typescript
import { logger } from '@/lib/unified-logger';

logger.info('Message', { user_id: '123' });
logger.error('Error occurred', error, { context: 'value' });
logger.createTraceId(); // Start request tracing
```

**Important**: Never use `console.log()`. Always use the logger singleton which:
- Outputs structured JSON to stdout (server) or /api/logs (client)
- Supports trace IDs for request correlation
- Prevents log truncation with `process.stdout.write()`

### Styling Guidelines (Stripe-inspired)

- **Fonts**: Inter (English), SUIT Variable (Korean)
- **Spacing**: Generous vertical spacing (`py-16`, `py-24`)
- **Shadows**: Subtle shadows (`shadow-sm`, `shadow-md`)
- **Max Width**: Content constrained with `max-w-4xl mx-auto`
- **Dark Mode**: Supported via `next-themes`
- **Tailwind CSS 4**: Uses new v4 features and syntax

### Docker & Deployment

**Multi-stage Build**: Optimized Dockerfile produces ~150MB final image with standalone Next.js output.

**Services** (docker-compose.yml):
- `nextjs`: Next.js app (port 3000, internal only)
- `nginx`: Reverse proxy with SSL (ports 80, 443)
- `promtail`: Log collection to Grafana Cloud

**Health Checks**:
- Next.js: `GET /api/health` (30s interval)
- Nginx: `GET /health` (30s interval)

**Log Management**: All services use JSON file logging driver with rotation (10m max size, 10 files).

## Key Technology Decisions

1. **Server Component Priority**: Minimize client-side JavaScript for performance
2. **Standalone Output**: Next.js `output: 'standalone'` for Docker optimization
3. **Local MDX**: File-based content with abstraction layer for future CMS migration
4. **Structured Logging**: JSON logs to stdout for Docker/Grafana Cloud integration
5. **Static Generation**: Pre-render all blog posts at build time
6. **Subdomain Routing**: `resume.byeoung.dev` redirects to main site with UTM parameters

## Component Development Rules

From `.cursor/rules/RULE.md`:

1. **Always Server Component first** - Only use `'use client'` when absolutely necessary
2. **Stripe-style design** - Wide spacing, subtle shadows, generous whitespace
3. **Type safety** - Strict TypeScript, avoid `any`
4. **Import order**: React/Next → External libs → Internal components → Utils → Types → Styles
5. **MDX abstraction** - Keep content parsing logic separate for future CMS migration
6. **File naming**: PascalCase (components), camelCase (utils), UPPER_SNAKE_CASE (constants)

## Common Pitfalls

1. **Wrong directory for Docker commands** - Always run Docker commands from project root, not `apps/blog/`
2. **Not using logger** - Never use `console.log()`, always use `logger` from `src/lib/unified-logger.ts`
3. **Client components by default** - Components should be Server Components unless they need interactivity
4. **Forgetting to update posts.ts for CMS** - When migrating to CMS, only `src/lib/posts.ts` needs changes
5. **SSL configuration** - SSL certs go in `apps/blog/nginx/ssl/`, managed via `scripts/ssl-setup.sh`
