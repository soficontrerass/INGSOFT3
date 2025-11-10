# Build stage
FROM node:18 AS builder
WORKDIR /app

# copy package files first to use cache
COPY package*.json ./
RUN npm ci

# copy typescript config, source and migrations, then build
COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
RUN npm run build

# Run stage
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# install only production deps
COPY package*.json ./
RUN npm ci --only=production

# copy built artifacts and migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080
CMD ["node", "dist/index.js"]