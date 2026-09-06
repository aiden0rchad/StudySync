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
COPY hermes-mcp.json ./

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent storage volume directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server/server.js"]
