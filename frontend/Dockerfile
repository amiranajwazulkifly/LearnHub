# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- dev: Vite dev server + HMR, source bind-mounted by compose ----
FROM base AS dev
RUN npm ci
COPY . .
EXPOSE 5175
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]

# ---- build: production bundle ----
FROM base AS build
RUN npm ci
COPY . .
# Vite inlines VITE_* vars into the bundle at build time, not runtime — so
# this has to be a build arg, not a plain container env var.
ARG VITE_API_BASE_URL=http://localhost:5001/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- prod: static files served by nginx ----
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
