# Marketplace de Emprendedores Universitarios

Plataforma web que conecta estudiantes emprendedores con compradores dentro de una universidad.

---

## Requisitos previos

Antes de iniciar, asegúrate de tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 9+ | incluido con Node.js |
| Git | cualquiera | https://git-scm.com |

Además necesitas acceso a una base de datos **PostgreSQL** (local o en Supabase).

---

## Estructura del proyecto

```
marketplace-universitario/
├── backend/          API REST con Express + Prisma ORM
├── frontend/         SPA con React + Vite + Tailwind CSS
└── docker-compose.yml
```

---

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd marketplace-universitario
```

---

## 2. Configurar el Backend

### 2.1 Instalar dependencias

```bash
cd backend
npm install
```

### 2.2 Crear el archivo de variables de entorno

Crea el archivo `backend/.env` con el siguiente contenido y rellena los valores:

```env
NODE_ENV=development
PORT=3001

# PostgreSQL — URL de conexión (Supabase o local)
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@HOST:5432/NOMBRE_DB

# JWT — usa una cadena aleatoria de mínimo 32 caracteres
JWT_SECRET=cambia-esto-por-un-secreto-seguro-de-32-chars
JWT_EXPIRES_IN=8h

# Bcrypt
BCRYPT_COST_FACTOR=12

# SendGrid (para emails de recuperación de contraseña)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=tu-email@dominio.com

# Supabase Storage (para imágenes de productos)
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=eyJ...

# CORS — URL donde corre el frontend
FRONTEND_URL=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> **Nota sobre Supabase:** Si usas Supabase y tu máquina no tiene IPv6, usa la URL del
> connection pooler en vez de la directa:
> `postgresql://postgres.TU-REF:CONTRASEÑA@aws-1-REGION.pooler.supabase.com:5432/postgres`

### 2.3 Sincronizar el schema con la base de datos

Si la base de datos ya tiene las tablas creadas (proyecto restaurado o existente):

```bash
npx prisma db pull       # Lee la estructura real de la DB y actualiza schema.prisma
npx prisma generate      # Genera el cliente Prisma con los tipos actualizados
```

Si la base de datos está vacía (primera vez):

```bash
npx prisma migrate dev --name init   # Crea las tablas y genera el cliente
```

### 2.4 (Opcional) Cargar datos de prueba

```bash
npm run db:seed          # Inserta categorías y usuario admin por defecto
```

### 2.5 Iniciar el servidor de desarrollo

```bash
npm run dev
```

El backend queda disponible en: **http://localhost:3001**

Verás en consola:
```
[nodemon] starting `node src/server.js`
📦 Database connected
🚀 Server running on port 3001
📖 Environment: development
🌐 CORS origin: http://localhost:5173
```

### 2.6 (Opcional) Ejecutar los tests

```bash
npm test                 # Corre todos los tests con reporte de cobertura
```

---

## 3. Configurar el Frontend

Abre una **nueva terminal** (el backend debe seguir corriendo).

### 3.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 3.2 Crear el archivo de variables de entorno

Crea el archivo `frontend/.env` con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Marketplace Universitario
```

> El valor de `VITE_API_URL` debe coincidir con el puerto donde corre el backend.

### 3.3 Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend queda disponible en: **http://localhost:5173**

Verás en consola:
```
VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 4. Resumen de comandos

### Backend (`cd backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload (nodemon) |
| `npm test` | Tests con reporte de cobertura |
| `npx prisma db pull` | Sincronizar schema desde la DB |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npx prisma migrate dev` | Crear y aplicar nueva migración |
| `npm run db:seed` | Insertar datos iniciales |
| `npm run db:studio` | Abrir Prisma Studio (GUI de la DB) |
| `npm run lint` | Verificar estilo de código |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Verificar estilo de código |

---

## 5. Endpoints principales de la API

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/register` | Registro (EMPRENDEDOR / COMPRADOR) |
| `POST` | `/api/auth/login` | Login → devuelve JWT en cookie httpOnly |
| `POST` | `/api/auth/logout` | Cierra sesión y limpia la cookie |
| `GET` | `/api/auth/me` | Datos del usuario autenticado |
| `POST` | `/api/auth/forgot-password` | Solicitar email de recuperación |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña con token |

### Productos
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products` | Catálogo paginado con filtros |
| `POST` | `/api/products` | [EMPRENDEDOR] Publicar producto |
| `GET` | `/api/products/:id` | Detalle de un producto |
| `PUT` | `/api/products/:id` | [EMPRENDEDOR] Editar producto propio |
| `DELETE` | `/api/products/:id` | [EMPRENDEDOR/ADMIN] Desactivar |

### Pedidos
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/orders` | [COMPRADOR] Crear pedido |
| `GET` | `/api/orders` | Mis pedidos (comprador o vendedor) |
| `PATCH` | `/api/orders/:id/accept` | [EMPRENDEDOR] Aceptar pedido |
| `PATCH` | `/api/orders/:id/reject` | [EMPRENDEDOR] Rechazar pedido |
| `PATCH` | `/api/orders/:id/cancel` | [COMPRADOR] Cancelar (solo si PENDING) |

### Usuarios y Reseñas
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/users/:id/profile` | Perfil público de un emprendedor |
| `PUT` | `/api/users/profile` | [EMPRENDEDOR] Editar perfil propio |
| `POST` | `/api/reviews` | [COMPRADOR] Reseñar pedido entregado |
| `GET` | `/api/reviews/profile/:id` | Reseñas y promedio de un emprendedor |

---

## 6. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios, Zustand |
| Backend | Node.js 20 LTS, Express 4.x, Prisma ORM |
| Base de datos | PostgreSQL 17 (Supabase) |
| Autenticación | JWT httpOnly cookie (8h), bcrypt factor 12 |
| Email | Nodemailer + SendGrid con retry exponential backoff |
| Storage | Supabase Storage |
| Testing | Jest + Supertest |
