FROM node:20-alpine AS builder

WORKDIR /app

COPY shared-types/package*.json ./shared-types/
COPY auth-service/package*.json ./auth-service/

RUN cd /app/shared-types && npm install
RUN cd /app/auth-service && npm install

COPY shared-types ./shared-types
COPY auth-service ./auth-service

RUN cd /app/shared-types && npm run build
RUN cd /app/auth-service && npm run build

FROM node:20-alpine AS runtime

WORKDIR /usr/src/app
RUN apk add --no-cache dumb-init

COPY auth-service/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/auth-service/dist ./dist

USER node
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
