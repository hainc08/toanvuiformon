# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────
# Toán Vui — multi-stage image (Next.js standalone + Chromium for PDF)
#   target "runner": production web server (default)
#   target "tools":  Prisma CLI + scripts (migrations, seed, admin)
# ─────────────────────────────────────────────────────────────
ARG NODE_VERSION=22.12-bookworm-slim

FROM node:${NODE_VERSION} AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# ── dependencies (incl. dev deps for build) ──
FROM base AS deps
# Placeholder only so `prisma generate` (postinstall) can load prisma.config.ts; never used at runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ── tools: migrations / seed / admin scripts ──
FROM deps AS tools
COPY tsconfig.json ./
COPY src/features ./src/features
COPY scripts ./scripts
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

# ── build ──
FROM deps AS builder
COPY . .
RUN npm run build

# ── runtime ──
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Headless Chromium matching the bundled playwright-core version (+ system deps), and a
# Vietnamese-capable system font for the PDF footer. Text/math fonts are embedded by the app.
RUN node node_modules/playwright-core/cli.js install --with-deps chromium-headless-shell \
 && apt-get update && apt-get install -y --no-install-recommends fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs \
 && chown -R nextjs:nodejs /ms-playwright

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
