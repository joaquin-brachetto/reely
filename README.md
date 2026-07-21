# 🎬 Reely

> Buscá cualquier película o serie y descubrí **dónde verla en streaming según tu país**. Con cuentas de usuario, watchlist personal, ratings agregados y un catálogo explorable por secciones.

<p align="center">
  <a href="https://reely-smoky.vercel.app/login"><strong>🌐 Ver demo en vivo »</strong></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB">
  <img alt="Node" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_16-4169E1?logo=postgresql&logoColor=white">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind_4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white">
</p>

<!--
  👇 PENDIENTE: sumar un screenshot o GIF real de la app.
  Guardá la imagen en /docs (ej: docs/preview.png o docs/preview.gif),
  descomentá el bloque de abajo y apuntá el src.
  Un GIF de 5-8 seg (buscar → detalle → ver dónde está en streaming) vende muchísimo.

<p align="center">
  <img src="docs/preview.png" alt="Captura de Reely" width="800">
</p>
-->
<p align="center"><em>🖼️ Demo visual próximamente — mientras tanto, probá la <a href="https://reely-smoky.vercel.app/login">demo en vivo</a>.</em></p>

---

## ✨ Features

- 🔎 **Búsqueda de películas y series** con resultados en tiempo real (debounce) y catálogo explorable por secciones (trending, populares, etc.).
- 🌍 **Disponibilidad de streaming por región** — detecta tu país y muestra en qué plataformas está cada título.
- 👤 **Cuentas de usuario** con registro, verificación por email, login y recuperación de contraseña.
- 📌 **Watchlist personal** persistente por usuario.
- ⭐ **Ratings agregados** de múltiples fuentes (TMDB + OMDb) en una sola vista.
- 🎭 **Fichas de detalle** de títulos y de personas (reparto/equipo).
- ⚙️ **Preferencias** de usuario (país/región) guardadas en la cuenta.

## 🏗️ Arquitectura y decisiones técnicas

Lo que diferencia a este proyecto de un CRUD típico:

- **Proxy de API en el backend.** El frontend nunca habla directo con TMDB/OMDb: pasa por un proxy en Express que inyecta las API keys del lado servidor. Así **las keys nunca se exponen** en el navegador.
- **Caché en memoria con TTL.** Las respuestas de TMDB se cachean 1 hora, reduciendo llamadas a la API externa y mejorando la latencia percibida.
- **Autenticación segura.** JWT con contraseñas hasheadas con **bcrypt**, cookies `httpOnly` y **rate limiting** con bloqueo temporal tras varios intentos fallidos de login.
- **Verificación y recuperación por email** con Nodemailer (código de verificación + reset de contraseña).
- **UX de carga cuidada.** Barra de progreso superior (NProgress), skeletons, code-splitting con lazy loading y caché en cliente para navegación instantánea.
- **React 19 + React Compiler** para optimización automática de renders.

```
┌──────────────┐      ┌─────────────────────┐      ┌──────────────┐
│  React (SPA) │─────▶│  Express API + Proxy │─────▶│  TMDB / OMDb │
│  Vercel      │◀─────│  JWT · caché · rate  │◀─────│  (API keys)  │
└──────────────┘      │  limiting            │      └──────────────┘
                      └──────────┬───────────┘
                                 ▼
                         ┌──────────────┐
                         │ PostgreSQL   │
                         │ (Docker)     │
                         └──────────────┘
```

## 🧰 Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5, JWT, bcrypt, Nodemailer |
| Base de datos | PostgreSQL 16 (Docker) |
| Testing | Vitest, React Testing Library |
| APIs externas | [TMDB](https://www.themoviedb.org/) (catálogo, streaming, reparto), [OMDb](https://www.omdbapi.com/) (ratings) |
| Deploy | Vercel |

## 🚀 Correr en local

**Requisitos:** Node.js 18+, Docker, y API keys de [TMDB](https://www.themoviedb.org/settings/api) y [OMDb](https://www.omdbapi.com/apikey.aspx).

```bash
# 1. Clonar
git clone https://github.com/joaquin-brachetto/reely.git
cd reely

# 2. Levantar la base de datos
docker compose up -d

# 3. Backend
cd backend
cp .env.example .env      # completá tus variables (API keys, JWT, SMTP)
npm install
npm run dev

# 4. Frontend (en otra terminal, desde la raíz)
cp .env.example .env      # completá VITE_API_URL, etc.
npm install
npm run dev
```

La app queda en `http://localhost:5173` y la API en `http://localhost:3000`.

## 🧪 Tests

```bash
npm test
```

---

<p align="center">Desarrollado por <a href="https://github.com/joaquin-brachetto">Joaquín Brachetto</a></p>
