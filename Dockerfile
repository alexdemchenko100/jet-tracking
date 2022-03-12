# --------------> The build image
FROM node:16-alpine AS build

# dependencies
RUN npm install -g pnpm

WORKDIR /app

COPY . ./

RUN pnpm i --frozen-lockfile

# build

#RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production
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
EXPOSE 3006