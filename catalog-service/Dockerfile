FROM node:20-alpine AS builder
ENV npm_config_registry=https://registry.npmjs.org/
WORKDIR /app

COPY shared-types/package*.json ./shared-types/
COPY shared-types ./shared-types
RUN cd /app/shared-types && rm -f tsconfig.tsbuildinfo && npm ci && npm run build

COPY catalog-service/package*.json ./catalog-service/
RUN cd /app/catalog-service && npm ci --include=dev
COPY catalog-service ./catalog-service
RUN cd /app/catalog-service && npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
RUN apk add --no-cache dumb-init

COPY catalog-service/package*.json ./
COPY --from=builder /app/catalog-service/node_modules ./node_modules
COPY --from=builder /app/catalog-service/dist ./dist

USER node
EXPOSE 3002
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
