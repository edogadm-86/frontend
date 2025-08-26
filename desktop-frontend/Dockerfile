# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (better caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy build output
COPY --from=builder /app/dist ./

# Expose HTTP
EXPOSE 80

# (nginx default CMD runs the server)
