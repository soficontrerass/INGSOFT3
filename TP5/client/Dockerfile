# Build stage
FROM node:18 AS builder
WORKDIR /app

# copiar lockfile y package.json e instalar dependencias;
# si npm ci falla (lockfile generado en Windows), hacemos fallback a npm install
COPY package*.json ./
RUN npm ci || (rm -f package-lock.json && npm install --no-audit --no-fund)

# intentar reconstruir deps nativas y, como último recurso, instalar el binario de rollup para linux
RUN npm rebuild || true
RUN npm install @rollup/rollup-linux-x64-gnu --no-save --no-audit || true

COPY . .
RUN npm run build

# Run stage (simple static server)
FROM node:18-slim
WORKDIR /app
ENV PORT=8080
COPY ./dist ./dist
RUN npm install -g serve@14
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]