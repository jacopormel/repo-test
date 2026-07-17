# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN corepack enable

# --- deps: install with dev dependencies, needed to run the build ---
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=github_pat \
    pnpm config set "//npm.pkg.github.com/:_authToken" "$(cat /run/secrets/github_pat)" && \
    pnpm install --frozen-lockfile

# --- build: compile TypeScript to dist/ ---
FROM deps AS build
COPY . .
RUN pnpm run build

# --- runtime: only prod dependencies + compiled output ---
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=github_pat \
    pnpm config set "//npm.pkg.github.com/:_authToken" "$(cat /run/secrets/github_pat)" && \
    pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist

EXPOSE 3000
USER node

# Liveness only (is the process up and accepting connections), not readiness:
# /health also reflects third-party dependencies (e.g. the OAuth2 IDP), which
# legitimately reports degraded with placeholder .env values in local/dev.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD nc -z 127.0.0.1 ${APP_PORT:-3000} || exit 1

CMD ["node", "dist/main.js"]
