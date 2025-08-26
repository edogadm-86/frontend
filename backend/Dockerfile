# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Only install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# If your app reads .env at runtime, mount it instead of baking it into the image.
# EXPOSE should match the port your app listens on (adjust if different)
EXPOSE 3001

# Optional healthcheck (requires wget in alpine)
RUN apk add --no-cache wget
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]