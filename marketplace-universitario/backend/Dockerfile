# ─────────────────────────────────────────────
# Stage 1: Install production dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────
# Stage 2: Generate Prisma Client
# ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

# ─────────────────────────────────────────────
# Stage 3: Development (hot-reload)
# ─────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

RUN npm install -g nodemon

COPY package*.json ./
RUN npm ci

COPY . .
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────
# Stage 4: Production runner (minimal image)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

# Run Prisma migrate on startup before server launch
RUN chown -R expressjs:nodejs /app
USER expressjs

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
