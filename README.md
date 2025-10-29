# AgendaMe

Sistema de agendamiento con Angular (Frontend) y NestJS (Backend).

## Descripción
AgendaMe permite a negocios publicar sus servicios y a clientes buscar y reservar citas. Ofrece perfiles de negocio, gestión de servicios, estados de citas y un panel de administración para usuarios, etiquetas y negocios.

## Requisitos
- Node.js 18+
- pnpm 8+ (backend)
- npm 9+ (frontend)
- PostgreSQL/Supabase

## Puesta en marcha rápida
Backend
```bash
cd backend
cp .env.example .env   # si existe
# editar .env: SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, PORT=3000
pnpm install
pnpm run start:dev
```

Frontend
```bash
cd Frontend
npm install
npm start    # http://localhost:4200
```

## Estructura
- `backend/` API NestJS (auth, users, business, service, appointment, tag, search, storage)
- `Frontend/` Angular (páginas en `features/pages`, servicios en `shared/services`)

## Notas
- Autenticación vía JWT.
- Algunas rutas públicas permiten lectura sin token (p. ej., etiquetas y búsqueda).

## Funcionalidades clave
- Autenticación y roles (`client`, `business`, `admin`).
- Perfil de negocio con horarios, imágenes y servicios.
- Búsqueda por texto, etiquetas y ubicación.
- Gestión de citas (cliente y negocio) con estados.
- Panel de administración para usuarios, negocios y etiquetas.

## Documentos
- Frontend: `Frontend/README.md`
- Backend: `backend/README.md`
