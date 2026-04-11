FROM node:20-slim

# Instalar OpenSSL (requerido por Prisma en produccion)
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias (cache layer)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev
RUN npx prisma generate

# Copiar codigo fuente
COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
