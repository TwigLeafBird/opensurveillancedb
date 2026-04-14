FROM node:22-alpine AS build

WORKDIR /app

# Placeholder values so Vite can resolve $env/dynamic/public imports at build time.
# Real values are injected at runtime via --env-file in the systemd service.
ARG PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=placeholder-public-key
ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=${PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY}

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run prepare && npm run build

FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

RUN addgroup -S app && adduser -S -G app app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build

USER app
EXPOSE 3000

CMD ["node", "build/index.js"]