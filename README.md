# 🎬 Reely

Buscá cualquier película o serie y descubrí **dónde verla en streaming** según tu país. Con cuentas de usuario, watchlist personal, ratings de IMDb y Rotten Tomatoes, y un catálogo explorable por secciones al estilo Netflix.

## Features

- **Autenticación completa**: registro con verificación por email (código de 6 dígitos), login con JWT, rate limiting con bloqueo temporal, recuperación y reseteo de contraseña.
- **Dónde ver**: disponibilidad por región (suscripción / alquiler / compra) con logos de cada plataforma, detección automática del país del usuario (con override manual desde el perfil), y avisos de "en cines" o "próximamente" para títulos sin streaming.
- **Búsqueda inteligente**: encuentra títulos buscados en español aunque su nombre original esté en otro idioma (ej. "obsesión" → *Obsession*), mostrando siempre póster y título en idioma original.
- **Ratings externos**: IMDb y Rotten Tomatoes integrados vía OMDb.
- **Watchlist persistente**: guardá películas/series desde cualquier card y accedé a tu lista desde el navbar.
- **Home por secciones**: Top 10 del día en tu región, aclamadas por la crítica, filas por género, clásicos de los 90 y más — con scroll horizontal y flechas.
- **Exploración con filtros**: pestañas de Películas/Series/Tendencias con filtros por año de estreno (desde 1900) y género.
- **Detalle completo**: sinopsis, duración, director/creador, clasificación por edad normalizada por país, reparto clickeable con página de actor y su filmografía.
- **Modo preview**: los visitantes sin cuenta pueden explorar los títulos en tendencia desde la landing antes de registrarse.
- **Preferencias de usuario**: región, idioma y servicios de streaming favoritos guardados en tu perfil.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5, JWT, bcrypt, Nodemailer |
| Base de datos | PostgreSQL 16 (Docker) |
| APIs externas | [TMDB](https://www.themoviedb.org/) (catálogo, streaming, cast), [OMDb](https://www.omdbapi.com/) (ratings) |

## Correr el proyecto localmente

### Requisitos

- Node.js 18+
- Docker Desktop
- API key de [TMDB](https://www.themoviedb.org/settings/api) (gratuita)
- API key de [OMDb](https://www.omdbapi.com/apikey.aspx) (gratuita, requiere confirmar por email)
- Una cuenta de Gmail con [contraseña de aplicación](https://myaccount.google.com/apppasswords) (para los emails de verificación)

### Pasos

```bash
# 1. Clonar e instalar dependencias
git clone <url-del-repo>
cd movie-app
npm install
cd backend && npm install && cd ..

# 2. Configurar variables de entorno
#    Completar las keys en ambos archivos:
cp .env.example .env
cp backend/.env.example backend/.env

# 3. Levantar la base de datos
docker compose up -d

# 4. Levantar el backend (en una terminal)
cd backend && npm run dev

# 5. Levantar el frontend (en otra terminal)
npm run dev
```

La app queda en `http://localhost:5173` y la API en `http://localhost:3000`.

## Deploy

El proyecto está preparado para deployarse en servicios con tier gratuito:

**Frontend (Vercel)**
1. Importar el repo en [Vercel](https://vercel.com) (framework: Vite; el `vercel.json` ya maneja las rutas del SPA).
2. Cargar las variables de entorno de `.env.example`, apuntando `VITE_API_URL` a la URL del backend deployado (ej. `https://tu-backend.onrender.com/api`).

**Backend + PostgreSQL (Render / Railway)**
1. Crear una base PostgreSQL y ejecutar [`backend/src/db/init.sql`](backend/src/db/init.sql) para crear las tablas.
2. Crear un web service desde la carpeta `backend/` con `npm start`.
3. Cargar las variables de `backend/.env.example`, usando `DATABASE_URL` (la connection string que da el hosting, con SSL soportado automáticamente) y `FRONTEND_URL` con la URL de Vercel (habilita el CORS).

## Estructura

```
├── src/                  # Frontend React
│   ├── pages/            # Landing/login, home, detalle de título, actor, watchlist
│   ├── components/       # Cards, filas, formularios de auth, menú de usuario, UI
│   ├── context/          # Sesión (JWT), preferencias, watchlist
│   ├── hooks/            # Búsqueda con debounce, detección de país, etc.
│   └── services/         # Clientes de TMDB, OMDb y la API propia
└── backend/
    └── src/
        ├── routes/       # /api/auth, /api/preferences, /api/watchlist
        ├── controllers/  # Auth, verificación por email, preferencias, watchlist
        ├── middleware/   # JWT, rate limiting
        └── db/           # Pool de Postgres + schema (init.sql)
```
