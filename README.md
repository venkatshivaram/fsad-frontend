# Student Course Selection and Scheduling System

React + Vite web application with role-based flows for Students and Admins.

## Tech Stack
- React (Functional Components + Hooks)
- React Router DOM
- Context API
- Tailwind CSS
- Mock JSON data (no backend)

## Features
- Role-based login (`student`, `admin`)
- Student course browsing, registration, conflict detection, schedule grid
- Admin course management (add, edit, delete)
- Global state via Context API
- Toast notifications and responsive sidebar layout

## Routes
- `/login`
- `/student/dashboard`
- `/student/courses`
- `/student/schedule`
- `/admin/dashboard`
- `/admin/manage-courses`

## Setup
```bash
npm install
npm run dev
```

## Environment
For local development, the app uses `http://localhost:8080/api` by default.

When deploying, set:

```bash
VITE_API_URL=https://your-backend-domain.com/api
```

The backend also needs:

```bash
APP_FRONTEND_BASE_URL=https://your-frontend-domain.com
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

`APP_FRONTEND_BASE_URL` is the URL used in forgot-password emails.

## Railway Database
The backend is configured to use Railway's MySQL environment variables. It supports Railway's URL variables:

```bash
MYSQL_URL=...
MYSQL_PUBLIC_URL=...
```

It also supports Railway's separate MySQL variables, with or without underscores:

```bash
MYSQL_HOST=...
MYSQL_PORT=...
MYSQL_DATABASE=...
MYSQL_USER=...
MYSQL_PASSWORD=...
```

```bash
MYSQLHOST=...
MYSQLPORT=...
MYSQLDATABASE=...
MYSQLUSER=...
MYSQLPASSWORD=...
```

Railway injects these automatically when a MySQL database is attached to the backend service. If you prefer one custom JDBC URL, set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.

## Build
```bash
npm run build
npm run preview
```

## Conflict Logic
A registration is blocked when:
- same day, and
- `newStart < existingEnd`, and
- `newEnd > existingStart`

Implemented in `src/utils/checkTimeConflict.js`.
