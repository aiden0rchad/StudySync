# Stage 1: Build Vite Frontend
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Lightweight Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/study_sync.db

COPY package*.json ./
RUN npm install --omit=dev

# Copy server and MCP scripts
COPY server ./server
COPY mcp ./mcp

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent storage volume directory
RUN mkdir -p /app/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/courses || exit 1

CMD ["node", "server/server.js"]
