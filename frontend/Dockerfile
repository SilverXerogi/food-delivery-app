FROM node:20-alpine AS builder

WORKDIR /app

COPY shared-types/package*.json ./shared-types/
COPY frontend/package*.json ./frontend/

RUN cd /app/shared-types && npm install
RUN cd /app/frontend && npm install

COPY shared-types ./shared-types
COPY frontend ./frontend

RUN cd /app/frontend && npm run build

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
