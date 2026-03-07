# Food Delivery App

Учебный проект по лабораторной работе №1-2 (TypeScript).

## Архитектура

Проект разделён на три backend-микросервиса и один frontend:

- `auth-service` — регистрация, логин, JWT и текущий пользователь
- `catalog-service` — каталог продуктов
- `cabinet-service` — профиль пользователя и заказы
- `frontend` — React + TypeScript, собирается в nginx-образ
- `shared-types` — разделяемые типы TypeScript

## Запуск

```bash
npm install --prefix shared-types
npm install --prefix auth-service
npm install --prefix catalog-service
npm install --prefix cabinet-service
npm install --prefix frontend

docker compose down -v
docker compose up --build
```

## Swagger / OpenAPI

После запуска документация доступна по адресам:

- Auth Swagger UI: `http://localhost:3001/docs`
- Auth OpenAPI JSON: `http://localhost:3001/docs.json`
- Catalog Swagger UI: `http://localhost:3002/docs`
- Catalog OpenAPI JSON: `http://localhost:3002/docs.json`
- Cabinet Swagger UI: `http://localhost:3003/docs`
- Cabinet OpenAPI JSON: `http://localhost:3003/docs.json`

### Что документировано

- `auth-service`: регистрация, логин, refresh, logout, текущий пользователь
- `catalog-service`: список продуктов и получение продукта по id
- `cabinet-service`: профиль пользователя, изменение профиля, список заказов, создание заказа, заказ по id

## Проверка

- Frontend: `http://localhost`
- Auth health: `http://localhost:3001/health`
- Catalog health: `http://localhost:3002/health`
- Cabinet health: `http://localhost:3003/health`
