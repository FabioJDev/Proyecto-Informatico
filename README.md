# Marketplace de Emprendedores Universitarios

> Plataforma web que conecta estudiantes emprendedores con compradores
> dentro del campus universitario de la UAO.

**Proyecto Informático | Docente: Jorge González R. | UAO 2026**

[![CI Pipeline](https://github.com/FabioJDev/Proyecto-Informatico/actions/workflows/ci.yml/badge.svg)](https://github.com/FabioJDev/Proyecto-Informatico/actions/workflows/ci.yml)

---

## Integrantes

| Nombre | Código |
|--------|--------|
| Fabio Jordan Cañaveral | 2230140 |
| Juan David Morales | 2230123 |
| Andrés Felipe Perafan Rozo | 2236501 |

---

## Stack Tecnológico

| Capa | Tecnología | Hosting |
|------|-----------|---------|
| Frontend | React 18 + Tailwind CSS + Zustand | Vercel |
| Backend | Node.js 20 + Express + Prisma ORM | Railway (Docker) |
| Base de datos | PostgreSQL | Supabase |
| Almacenamiento | Cloudinary | CDN global |
| Email | Nodemailer + SendGrid | — |
| CI/CD | GitHub Actions | — |

---

## Estrategia de Ramas

Este repositorio aplica **Feature Branch Workflow**:

```
main                              ← producción, siempre deployable
├── feature/us-01-registro-emprendedor
├── feature/us-02-registro-comprador
├── feature/us-03-login
├── feature/us-04-recuperar-password
├── feature/us-05-perfil-emprendimiento
├── feature/us-06-editar-perfil
├── feature/us-07-publicar-producto
├── feature/us-08-editar-publicacion
├── feature/us-09-eliminar-publicacion
├── feature/us-10-catalogo-publico
├── feature/us-11-buscar-filtrar
└── feature/us-19-email-confirmacion
```

**Reglas:**
- Nunca hacer commit directo a `main`
- Toda funcionalidad va en su propia rama `feature/us-XX-descripcion`
- Todo cambio entra a `main` únicamente mediante Pull Request
- Mínimo 1 aprobación requerida antes de fusionar

---

## Convención de Commits (Conventional Commits)

```
tipo(scope): descripción corta [US-XX]
```

Tipos: `feat` | `fix` | `refactor` | `test` | `docs` | `chore` | `style`

**Ejemplos:**
```bash
feat(auth): implementar endpoint POST /api/auth/register [US-01]
fix(catalog): corregir validación de precio con step=any [US-07]
feat(catalog): agregar paginación 12 items por página [US-10]
chore: agregar GitHub Actions CI pipeline
docs: actualizar README con estrategia de ramas
```

---

## Flujo de Trabajo (Workflow)

```bash
# 1. Partir siempre de main actualizado
git checkout main && git pull origin main

# 2. Crear rama para la historia de usuario
git checkout -b feature/us-10-catalogo-publico

# 3. Desarrollar con commits atómicos
git add <archivos-específicos>
git commit -m "feat(catalog): descripción [US-10]"

# 4. Subir la rama
git push origin feature/us-10-catalogo-publico

# 5. Abrir Pull Request en GitHub hacia main
# 6. Asignar reviewer (compañero del equipo)
# 7. Reviewer aprueba → Squash and merge
# 8. Eliminar la rama feature
```

---

## Configuración Local

### Prerrequisitos
- Node.js 20+
- Git

### Backend
```bash
cd marketplace-universitario/backend
cp .env.example .env
# Editar .env con las variables del proyecto
npm install
npx prisma generate
npm run dev
# API disponible en http://localhost:3001
```

### Frontend
```bash
cd marketplace-universitario/frontend
cp .env.example .env
# Editar .env con VITE_API_URL=http://localhost:3001
npm install
npm run dev
# App disponible en http://localhost:5173
```

---

## Estructura del Proyecto

```
marketplace-universitario/
├── frontend/
│   └── src/
│       └── modules/
│           ├── auth/       ← US-01 al US-04
│           ├── profile/    ← US-05, US-06
│           ├── catalog/    ← US-07 al US-11
│           ├── orders/     ← US-12 al US-16
│           ├── reviews/    ← US-17, US-18
│           └── admin/      ← US-22 al US-26
└── backend/
    └── src/
        ├── controllers/
        ├── routes/
        ├── services/
        ├── middlewares/
        └── utils/
```

---

## Variables de Entorno

Las variables de entorno **NUNCA se suben al repositorio**.
Cada archivo `.env` está en el `.gitignore`.
Usa los archivos `.env.example` como plantilla.

---

*Documento elaborado como parte del curso Proyecto Informático | UAO 2026*
