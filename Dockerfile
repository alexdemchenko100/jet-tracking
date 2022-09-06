# --------------> The build image
FROM node:16-alpine AS build

WORKDIR /app

# dependencies
RUN npm install -g pnpm

COPY pnpm-lock.yaml ./

# downloads all packages to the host machine store cache..
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
  pnpm fetch

# copy all source files
# uses .dockerignore to avoid copying dist, .git, node_modules
COPY . ./

# use the cache to install all needed packages and create node_modules etc
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store\
  pnpm -r install --frozen-lockfile --offline

# build step
ARG VITE_PROJECT_ID=httpmon-test
ARG VITE_STRIPE_PUBLIC_KEY=pk_test_51LPpMdIPGf5DGRkK2ueVuSCFMdwv053JEQD7kfX66xdvUC4AG6D1aAlAnfvyN20JosLFNycDC1l7kysmGsPooZA600x3kSwLH2
RUN pnpm build

# run --------------> The production image
FROM node:lts-alpine
RUN apk add dumb-init
ENV NODE_ENV production
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/packages/api/dist /app/packages/api/dist
COPY --chown=node:node --from=build /app/packages/web/dist /app/packages/web/dist

CMD ["dumb-init", "node", "./packages/api/dist/index.js"]
EXPOSE 8080