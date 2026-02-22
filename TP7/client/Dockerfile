# Build stage
FROM node:18 AS builder
WORKDIR /app

# build arg injected from CI to set Vite env var at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8080}

COPY package*.json ./
RUN npm ci || (rm -f package-lock.json && npm install --no-audit --no-fund)
RUN npm rebuild || true
RUN npm install @rollup/rollup-linux-x64-gnu --no-save --no-audit || true

COPY . .
RUN chmod -R u+x node_modules && npm run build

# Run stage (serve the built dist from the builder stage)
FROM node:18-slim
WORKDIR /app
ENV PORT=8080
# copy dist from the builder stage
COPY --from=builder /app/dist ./dist
RUN npm install -g serve@14
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]