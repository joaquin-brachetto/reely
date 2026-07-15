# 🎬 Reely

Buscá cualquier película o serie y descubrí dónde verla en streaming según tu país. Con cuentas de usuario, watchlist personal, ratings y un catálogo explorable por secciones.

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
