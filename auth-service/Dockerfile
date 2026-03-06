FROM node:18-alpine

WORKDIR /app

COPY auth-service/package*.json ./
RUN npm ci

COPY shared-types ./shared-types

COPY auth-service/src ./src

COPY auth-service/tsconfig.json ./tsconfig.json

RUN echo '{ "extends": "./tsconfig.json", "compilerOptions": { "baseUrl": ".", "paths": { "@shared/*": ["./shared-types/src/*"] } }, "include": ["src/**/*", "./shared-types/src/**/*"] }' > tsconfig.docker.build.json

RUN npx tsc --project tsconfig.docker.build.json

RUN rm -rf src shared-types
RUN rm -rf node_modules

COPY auth-service/package*.json ./
RUN npm ci --only=production

EXPOSE 3000

CMD [ "node", "dist/index.js" ]