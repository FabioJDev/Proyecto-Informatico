FROM node:20.19.1-slim

# Instalar OpenSSL 3 (requerido por Prisma en Debian)
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar manifiestos y schema de Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo dev para prisma CLI)
RUN npm ci

# Generar cliente Prisma con el binary correcto para Debian/OpenSSL 3
RUN npx prisma generate

# Copiar el resto del codigo fuente
COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
