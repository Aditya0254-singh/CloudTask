# =========================
# Build stage
# =========================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Vite environment variable
# This is supplied during docker build.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build React/Vite application
RUN npm run build


# =========================
# Production stage
# =========================
FROM nginx:1.27-alpine AS production

# Copy production frontend build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Nginx runs in the foreground
CMD ["nginx", "-g", "daemon off;"]