FROM node:20-alpine AS builder
ENV npm_config_registry=https://registry.npmjs.org/
WORKDIR /app

COPY shared-types/package*.json ./shared-types/
COPY shared-types ./shared-types
RUN cd /app/shared-types && rm -f tsconfig.tsbuildinfo && npm ci && npm run build

COPY cabinet-service/package*.json ./cabinet-service/
RUN cd /app/cabinet-service && npm ci --include=dev
COPY cabinet-service ./cabinet-service
RUN cd /app/cabinet-service && npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
RUN apk add --no-cache dumb-init

COPY cabinet-service/package*.json ./
COPY --from=builder /app/cabinet-service/node_modules ./node_modules
COPY --from=builder /app/cabinet-service/dist ./dist

USER node
EXPOSE 3003
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
