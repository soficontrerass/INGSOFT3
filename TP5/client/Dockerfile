# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm ci || npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Run stage (simple static server)
FROM node:18-slim
WORKDIR /app
ENV PORT=8080
COPY --from=builder /app/dist ./dist
RUN npm install -g serve@14
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]