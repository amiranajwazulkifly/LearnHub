# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- dev: nodemon + full devDependencies, source bind-mounted by compose ----
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5001
CMD ["npm", "run", "dev"]

# ---- deps: production-only node_modules, reused by the prod stage ----
FROM base AS deps
RUN npm ci --omit=dev

# ---- prod: no devDependencies, no bind mount, just the built image ----
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5001
CMD ["node", "index.js"]
