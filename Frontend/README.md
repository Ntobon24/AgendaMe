# AgendaMe Frontend (Angular)

Aplicación web para explorar negocios, gestionar perfiles de negocio y agendar citas.

## Qué incluye
- Home con listado de negocios
- Autenticación (login, registro) con JWT
- Perfil de usuario
- Perfil de negocio (crear/editar negocio, horarios, servicios)
- Búsqueda de negocios por texto, ubicación y etiquetas
- Citas de cliente y de negocio (gestión, estados)
- Panel de administración (usuarios, negocios, etiquetas)

## Requisitos
- Node.js 18+
- npm 9+

## Configuración
```bash
cd Frontend
npm install
npm start
# http://localhost:4200
```

## Variables de entorno
- La URL del backend y el puerto se configuran en los servicios HTTP cuando aplica.

## Estructura relevante
- `src/app/features/pages/` páginas (home, login, sign-up, business-profile, business-search, appointments, admin)
- `src/app/shared/` servicios, guards, interceptors, interfaces

## Principales rutas de la app
- `/` inicio
- `/login` login, `/sign-up` registro
- `/business-search` búsqueda de negocios
- `/business-profile` perfil de negocio
- `/my-appointments` citas de cliente
- `/business-appointments` citas de negocio
- `/admin` panel administrador

## Comandos
```bash
npm start       # desarrollo
npm run build   # producción (dist/)
```

## Notas de arquitectura
- Angular standalone components, Reactive Forms y servicios centralizados.
- Manejo de sesión con JWT guardado en localStorage.
- Estilos minimalistas con una paleta consistente.