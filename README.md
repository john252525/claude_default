# Admin Dashboard

Админ-панель и личные кабинеты с ролевым разграничением доступа (RBAC).

## Стек

- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL + JWT + Swagger
- **Frontend:** React + Vite + Ant Design + Zustand + React Router
- **Инфра:** Docker + Docker Compose + Nginx

## Роли

| Роль | Описание |
|------|----------|
| `admin` | Полный доступ ко всем разделам |
| `director` | Доступ к управлению и аналитике |
| `manager` | Управление клиентами и заказами |
| `support` | Техподдержка пользователей |
| `sales` | Работа с продажами |
| `marketer` | Маркетинговые кампании |
| `client` | Личный кабинет |
| `partner` | Партнёрский доступ |

## Быстрый старт (Docker)

```bash
docker-compose up -d
```

Приложение будет доступно:
- Frontend: http://localhost
- API: http://localhost:3001/api
- Swagger docs: http://localhost:3001/api/docs

## Локальная разработка

### Требования
- Node.js 20+
- PostgreSQL 16+

### Установка

```bash
# Установить зависимости
npm install

# Настроить переменные окружения
cp backend/.env.example backend/.env

# Запустить миграции и сид
cd backend
npx prisma migrate dev
npx prisma db seed

# Запустить в режиме разработки (из корня)
cd ..
npm run dev
```

### Учётные данные по умолчанию

- **Email:** admin@example.com
- **Пароль:** admin123

## Структура проекта

```
├── backend/              # NestJS API
│   ├── prisma/           # Схема БД и миграции
│   └── src/
│       ├── common/       # Декораторы, гарды
│       └── modules/      # Модули (auth, users, roles)
├── frontend/             # React SPA
│   └── src/
│       ├── api/          # API-клиент
│       ├── layouts/      # Шаблоны страниц
│       ├── pages/        # Страницы
│       └── stores/       # Zustand stores
└── docker-compose.yml
```

## API Endpoints

### Auth
- `POST /api/auth/login` — авторизация
- `POST /api/auth/register` — регистрация
- `GET /api/auth/profile` — текущий пользователь

### Users
- `GET /api/users` — список (требует `read:User`)
- `GET /api/users/me` — свой профиль
- `PUT /api/users/me` — обновить профиль
- `POST /api/users` — создать (admin)
- `PUT /api/users/:id` — обновить (admin)
- `DELETE /api/users/:id` — удалить (admin)

### Roles
- `GET /api/roles` — список ролей (admin, director)
- `GET /api/roles/permissions` — все разрешения (admin)
