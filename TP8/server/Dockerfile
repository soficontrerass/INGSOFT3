# Stage: build
FROM node:18-alpine AS builder
WORKDIR /app

# use lockfile + package.json for reproducible installs
COPY package*.json ./
RUN npm ci

# copy sources and build
COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
RUN npm run build

# Stage: runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copy only production deps and artifacts
COPY package*.json ./
# install only production deps
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# set permissions and switch user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
