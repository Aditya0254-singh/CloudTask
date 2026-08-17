# syntax=docker/dockerfile:1

# ---- Stage 1: build ----
# Compiles TypeScript to JavaScript.
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies first so this layer is cached
# unless package.json or package-lock.json changes.
COPY package.json package-lock.json ./
RUN npm ci

# Copy TypeScript configuration and source code.
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript.
RUN npm run build


# ---- Stage 2: production runtime ----
# Clean image containing only production dependencies
# and the compiled application.
FROM node:20-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript.
COPY --from=builder /app/dist ./dist

# Copy SQL migration files into the production image.
# migrate.js expects them at /app/dist/db/migrations.
COPY --from=builder /app/src/db/migrations ./dist/db/migrations

# Run as a non-root user.
RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp \
    && chown -R nodeapp:nodeapp /app

USER nodeapp

EXPOSE 4000

# Container health check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 4000) + '/api/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Secrets and PORT are supplied at runtime.
CMD ["node", "dist/server.js"]
