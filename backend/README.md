# AgendaMe Backend (NestJS)

API para autenticación, gestión de usuarios, negocios, servicios, etiquetas, almacenamiento y búsqueda.

## Módulos principales
- `auth` JWT y registro/login
- `user` usuarios y roles (`client`, `business`, `admin`)
- `business` negocios y su información
- `service` servicios de un negocio
- `appointment` citas entre clientes y negocios
- `tag` etiquetas para clasificar negocios/servicios
- `search` endpoint de búsqueda con filtros
- `storage` subida de imágenes (por ejemplo, logos, portadas, imágenes de servicios)

## Requisitos
- Node.js 18+
- pnpm 8+
- Base de datos PostgreSQL (Supabase)

## Configuración
```bash
cd backend
cp .env.example .env 
# editar .env con SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET, PORT
pnpm install
pnpm run start:dev
# http://localhost:3000
```

## Scripts útiles
```bash
pnpm run start:dev   # desarrollo con watch
pnpm run build       # compila a dist/
pnpm run start:prod  # producción
```

## Endpoints principales
- `POST /auth/login`, `POST /auth/register`
- `GET /users/:id`
- `GET /business` y CRUD por id
- `GET /service` y CRUD por id
- `GET /tag` y CRUD por id
- `GET /search/businesses?q=&tags=&location=&limit=&offset=`

## Notas
- La autenticación usa JWT en el header Authorization.
- Algunas rutas aceptan acceso público de solo lectura (por ejemplo, etiquetas).

## Arquitectura y convenciones
- NestJS modular con inyección de dependencias.
- DTOs para validación de entrada y entidades para persistencia.
- Servicios encapsulan la lógica de negocio; controladores solo orquestan.
- Manejo de errores mediante excepciones HTTP estándar de Nest.
