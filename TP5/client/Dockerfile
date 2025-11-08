# Build stage
FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci || (rm -f package-lock.json && npm install --no-audit --no-fund)
RUN npm rebuild || true
RUN npm install @rollup/rollup-linux-x64-gnu --no-save --no-audit || true

COPY . .
RUN npm run build

# Run stage (serve the built dist from the builder stage)
FROM node:18-slim
WORKDIR /app
ENV PORT=8080
# copy dist from the builder stage
COPY --from=builder /app/dist ./dist
RUN npm install -g serve@14
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]