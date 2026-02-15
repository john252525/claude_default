# Деплой на Railway.com

## Архитектура на Railway

```
Railway Project
├── PostgreSQL          (плагин — бесплатная БД)
├── backend             (NestJS API — сервис из /backend)
└── frontend            (React SPA — сервис из /frontend)
```

---

## Пошаговая инструкция

### 1. Создать проект

1. Зайти на [railway.app](https://railway.app) и залогиниться через GitHub
2. Нажать **"New Project"**
3. Выбрать **"Empty Project"**

### 2. Добавить PostgreSQL

1. В проекте нажать **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст БД и переменную `DATABASE_URL`
3. Запомнить — эту переменную нужно будет прокинуть в backend

### 3. Задеплоить Backend

1. В проекте нажать **"+ New"** → **"GitHub Repo"**
2. Выбрать репозиторий с проектом
3. Railway спросит настройки — указать:

**Settings:**
| Параметр | Значение |
|----------|----------|
| Root Directory | `backend` |
| Builder | Dockerfile |

**Variables (Environment):**
| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (ссылка на плагин) |
| `JWT_SECRET` | любой длинный случайный ключ (32+ символов) |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3001` |
| `CORS_ORIGINS` | `https://<frontend-домен>.up.railway.app` |

> `CORS_ORIGINS` — заполнить после деплоя frontend (шаг 4), когда будет известен его домен

4. Нажать **"Deploy"**
5. После деплоя — в **Settings** → **Networking** → **"Generate Domain"** (получите публичный URL бэкенда)

### 4. Задеплоить Frontend

1. В проекте нажать **"+ New"** → **"GitHub Repo"**
2. Выбрать **тот же репозиторий**
3. Настройки:

**Settings:**
| Параметр | Значение |
|----------|----------|
| Root Directory | `frontend` |
| Builder | Dockerfile |

**Variables (Environment):**
| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | `https://<backend-домен>.up.railway.app/api` |
| `PORT` | `80` |

> `VITE_API_URL` — подставить реальный URL backend из шага 3.5

4. Нажать **"Deploy"**
5. В **Settings** → **Networking** → **"Generate Domain"**

### 5. Связать CORS

После того как оба сервиса задеплоились:

1. Открыть **backend** сервис → **Variables**
2. Обновить `CORS_ORIGINS` — указать реальный домен frontend:
   ```
   https://frontend-production-xxxx.up.railway.app
   ```
3. Backend автоматически передеплоится

### 6. Засидить базу данных

Открыть **backend** сервис → вкладку **"Settings"** → **"Custom Start Command"**:

Первый раз (для seed):
```bash
npx prisma migrate deploy && npx prisma db seed && node dist/main
```

После первого деплоя вернуть обратно:
```bash
npx prisma migrate deploy && node dist/main
```

Или выполнить seed через **Railway CLI**:
```bash
railway run -s backend npx prisma db seed
```

---

## Альтернатива: Railway CLI (быстрее)

### Установить CLI

```bash
npm install -g @railway/cli
railway login
```

### Создать проект и сервисы

```bash
# Создать проект
railway init

# Добавить PostgreSQL
railway add --plugin postgresql

# Создать backend сервис
railway service create backend
railway service set backend
railway variables set JWT_SECRET=your-secret-key-here-change-me JWT_EXPIRES_IN=7d
railway link  # связать с GitHub

# Создать frontend сервис
railway service create frontend
railway service set frontend
railway link
```

---

## Свой домен (Custom Domain)

1. Открыть сервис **frontend** → **Settings** → **Networking**
2. Нажать **"Custom Domain"**
3. Ввести свой домен (например `admin.mycompany.com`)
4. Добавить CNAME-запись в DNS:
   ```
   admin.mycompany.com → <frontend-xxx>.up.railway.app
   ```
5. Railway автоматически выпустит SSL-сертификат

Аналогично для backend API:
```
api.mycompany.com → <backend-xxx>.up.railway.app
```

---

## Стоимость

| Компонент | Бесплатный план | Hobby ($5/мес) |
|-----------|----------------|----------------|
| PostgreSQL | 500 MB, 1 GB RAM | Без ограничений |
| Backend | 500 часов/мес | Без ограничений |
| Frontend | 500 часов/мес | Без ограничений |
| Execution | 512 MB RAM | До 8 GB RAM |

> Для старта хватит **Hobby** плана за $5/мес с запасом.

---

## Переменные окружения (сводка)

### Backend
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<сгенерировать: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGINS=https://<frontend>.up.railway.app
```

### Frontend
```env
VITE_API_URL=https://<backend>.up.railway.app/api
PORT=80
```

---

## Troubleshooting

**Backend не стартует:**
- Проверить логи: клик на сервис → **"Logs"**
- Убедиться что `DATABASE_URL` правильно ссылается на PostgreSQL плагин
- Проверить что Prisma миграции применились

**Frontend показывает ошибки API:**
- Проверить `VITE_API_URL` — должен быть полный URL с `https://` и `/api`
- Проверить `CORS_ORIGINS` в backend — должен содержать домен frontend
- Важно: `VITE_API_URL` вкомпиливается при билде, после изменения нужен redeploy

**Prisma миграции не работают:**
- Убедиться что `DATABASE_URL` использует формат `postgresql://...`
- Railway PostgreSQL выдаёт URL в правильном формате автоматически
