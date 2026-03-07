// src/server.ts
import app from './app';

// FIX: Берём PORT из переменной окружения, fallback на 3000
const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`);
});

// FIX: Экспортируем app, если он нужен для тестирования или других целей
export default app;