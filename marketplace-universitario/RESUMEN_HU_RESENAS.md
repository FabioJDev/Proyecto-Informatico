# 📋 Resumen de Implementación - Historias de Usuario de Reseñas

## ✅ Historias de Usuario Completadas

### US-17: Calificar un pedido entregado
**Descripción:** Como comprador autenticado, quiero calificar con 1-5 estrellas y dejar una reseña escrita a un emprendedor tras recibir mi pedido, para ayudar a otros compradores a tomar mejores decisiones.

**Status:** ✅ IMPLEMENTADO

**Flujo de Usuario:**
1. El comprador accede a "Mis pedidos"
2. Visualiza sus pedidos con estado "ENTREGADO"
3. Hace clic en el botón "Dejar Reseña"
4. Se abre un modal con:
   - Selector de estrellas (1-5)
   - Campo de comentario opcional (máx 300 caracteres)
5. Envía la reseña
6. La reseña se publica exitosamente
7. El botón cambia a un indicador de "Reseñado (X/5)"

---

### US-18: Ver reseñas en perfil del emprendedor
**Descripción:** Como visitante o usuario autenticado, quiero ver el promedio de calificaciones y las reseñas recibidas en el perfil de un emprendedor, para evaluar su reputación antes de hacer un pedido.

**Status:** ✅ IMPLEMENTADO

**Flujo de Usuario:**
1. El usuario accede al perfil de un emprendedor
2. Ve un resumen con:
   - Promedio de calificaciones
   - Número total de reseñas
   - Visualización de cada reseña con:
     - Nombre/Email del revisor
     - Calificación en estrellas
     - Comentario (si existe)
     - Nombre del producto reseñado
     - Fecha de la reseña
3. Las reseñas se paginan (5 por página)

---

## 🔧 Cambios Realizados

### Backend (Node.js + Express + Prisma)

**1. Schema Prisma** ✅
- Modelo `Review` ya existía con estructura correcta:
  ```prisma
  model Review {
    id         String   @id @default(dbgenerated("(gen_random_uuid())::text"))
    orderId    String   @unique
    profileId  String
    reviewerId String
    rating     Int
    comment    String?  @db.VarChar(300)
    createdAt  DateTime @default(now())
    order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
    profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
    reviewer   User     @relation("ReviewerRelation", fields: [reviewerId], references: [id], onDelete: Cascade)
  }
  ```

**2. Controller** ✅ (`src/controllers/reviews.controller.js`)
- **POST `/api/reviews`** - Crear reseña (requiere autenticación como COMPRADOR)
  - Validaciones:
    - Orden debe existir y pertenecer al comprador
    - Estatus del pedido debe ser "DELIVERED"
    - No puede haber reseña previa para ese pedido
    - Rating debe ser 1-5
    - Comentario opcional, máx 300 caracteres
  
- **GET `/api/reviews/profile/:profileId`** - Obtener reseñas de un perfil (público)
  - Devuelve:
    - Lista paginada de reseñas
    - Promedio de calificación
    - Total de reseñas
  - Incluye información del revisor y producto

**3. Validadores** ✅ (`src/middlewares/validators/reviews.validators.js`)
```javascript
const createReviewValidation = [
  body('orderId').notEmpty().withMessage('El ID del pedido es requerido.').trim(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe estar entre 1 y 5.').toInt(),
  body('comment').optional().trim().escape().isLength({ max: 300 }).withMessage('El comentario no puede superar 300 caracteres.')
]
```

**4. Rutas** ✅ (`src/routes/reviews.routes.js`)
- `GET /profile/:profileId` - Público
- `POST /` - Protegido (COMPRADOR)

**5. Integración en app.js** ✅
- Rutas de reviews registradas en `/api/reviews`

---

### Frontend (React + Vite)

**1. Componentes Existentes** ✅
- **OrderCard.jsx** - Mostrar botón "Dejar Reseña" cuando estado es DELIVERED y no hay reseña
- **StarRating.jsx** - Selector de estrellas interactivo
- **ReviewsSection.jsx** - Mostrar reseñas de un perfil con paginación
- **Modal.jsx** - Modal para crear reseña

**2. Cambios Realizados**

#### a) Hook `useOrders.js` ✅
**Cambio:** Agregar método `setPage`
```javascript
const setPage = (page) => {
  fetchOrders({ page });
};
```
**Por qué:** MyOrdersPage necesitaba este método para la paginación

#### b) Página `MyOrdersPage.jsx` ✅
**Cambios:**
- Agregar reset del estado `review` después de enviar:
  ```javascript
  setReview({ rating: 5, comment: '' });
  ```
- Flujo:
  1. Click en "Dejar Reseña" → abre modal
  2. Usuario selecciona estrella y comenta
  3. Click "Publicar reseña" → envía POST a `/api/reviews`
  4. Si éxito: cierra modal, reset state, refetch(), toast de éxito
  5. Si error: muestra toast de error

#### c) Página `ProfilePage.jsx` ✅
**Cambios:**
- Importar `ReviewsSection.jsx`
- Remover carga manual de reseñas
- Usar componente `ReviewsSection` para mostrar reseñas:
  ```javascript
  {profile?.id && (
    <div className="animate-in delay-2">
      <h1>Reseñas</h1>
      <ReviewsSection profileId={profile.id} />
    </div>
  )}
  ```
- Remover referencia a `reviews.averageRating` en header
- Simplificar lógica de carga

**3. Flujo de Datos**

```
┌─────────────────────────────────────────────────────────────┐
│                     HU-17: Crear Reseña                      │
├─────────────────────────────────────────────────────────────┤
│ 1. MyOrdersPage → onClick "Dejar Reseña"                    │
│ 2. SetReviewModal(orderId)                                   │
│ 3. Modal muestra StarRating + textarea                       │
│ 4. Usuario selecciona rating y comenta                       │
│ 5. API POST /reviews { orderId, rating, comment }            │
│ 6. Backend valida y crea Review                              │
│ 7. Refetch() de órdenes                                      │
│ 8. OrderCard ahora muestra "Reseñado (5/5)" ✓               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   HU-18: Ver Reseñas                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Usuario accede a ProfilePage/:userId                      │
│ 2. Carga userData + profile                                  │
│ 3. ReviewsSection(profileId) carga reseñas                  │
│ 4. API GET /reviews/profile/:profileId                       │
│ 5. Muestra promedio + lista paginada                         │
│ 6. Usuario puede cambiar páginas                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Validaciones de Seguridad

### Backend
- ✅ Solo el comprador puede crear reseña
- ✅ Validación de estado del pedido (DELIVERED)
- ✅ Una reseña por pedido (unique constraint)
- ✅ Rating entre 1-5
- ✅ Comentario máx 300 caracteres
- ✅ JWT verificado en rutas protegidas

### Frontend
- ✅ StarRating solo se muestra después de DELIVERED
- ✅ Modal cierra después de envío exitoso
- ✅ Estados de loading durante API calls
- ✅ Manejo de errores con toast notifications

---

## 📊 Endpoints API

### POST /api/reviews
**Crear reseña**
```javascript
// Request
{
  "orderId": "uuid",
  "rating": 5,
  "comment": "Excelente producto..."
}

// Response 201
{
  "success": true,
  "message": "Reseña publicada.",
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "profileId": "uuid",
    "rating": 5,
    "comment": "Excelente producto...",
    "reviewer": { "email": "buyer@example.com" },
    "profile": { "businessName": "Mi Negocio" }
  }
}
```

### GET /api/reviews/profile/:profileId
**Obtener reseñas de un perfil**
```javascript
// Response 200
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "businessName": "Mi Negocio"
    },
    "averageRating": 4.5,
    "totalReviews": 10,
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "Excelente...",
        "reviewer": { "email": "buyer@example.com" },
        "order": { "product": { "name": "Producto X" } },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 10,
    "pages": 2
  }
}
```

---

## 📝 Archivos Modificados

| Archivo | Cambios | Tipo |
|---------|---------|------|
| `frontend/src/hooks/useOrders.js` | Agregar método `setPage` | Minor |
| `frontend/src/modules/orders/MyOrdersPage.jsx` | Agregar reset de review state | Polish |
| `frontend/src/modules/profile/ProfilePage.jsx` | Usar ReviewsSection + remover lógica duplicada | Refactor |

---

## 🎯 Criterios de Aceptación - Verificación

### US-17: Calificar un pedido entregado
- ✅ Solo se muestra para pedidos con estado DELIVERED
- ✅ Solo el comprador del pedido puede reseñar
- ✅ Rating debe ser 1-5 estrellas
- ✅ Comentario es opcional, máx 300 caracteres
- ✅ No se puede reseñar dos veces
- ✅ Reseña se publica exitosamente
- ✅ UI actualiza correctamente (botón cambia a "Reseñado")

### US-18: Ver reseñas en perfil del emprendedor
- ✅ Visitantes pueden ver reseñas (sin autenticación)
- ✅ Usuarios autenticados pueden ver reseñas
- ✅ Se muestra promedio de calificaciones
- ✅ Se muestra total de reseñas
- ✅ Se muestran detalles de cada reseña
- ✅ Las reseñas están paginadas
- ✅ Se muestra producto reseñado
- ✅ Se muestra nombre del revisor y fecha

---

## 🚀 Testing Manual

### HU-17: Crear Reseña
1. Iniciar sesión como COMPRADOR
2. Ir a "Mis pedidos"
3. Buscar un pedido con estado "ENTREGADO" (sin reseña previa)
4. Hacer clic en "Dejar Reseña"
5. Seleccionar 4-5 estrellas
6. Escribir comentario
7. Hacer clic en "Publicar reseña"
8. ✅ Debería ver toast de éxito y el botón cambiar a "Reseñado"

### HU-18: Ver Reseñas
1. Buscar un emprendedor que tenga reseñas
2. Acceder a su perfil (sin necesidad de autenticación)
3. ✅ Debería ver:
   - Promedio de calificación
   - Número de reseñas
   - Lista de reseñas con detalles
4. Cambiar de página en la paginación
5. ✅ Las reseñas deberían actualizarse

---

## 📚 Notas Técnicas

- **Paginación:** 5 reseñas por página en ReviewsSection
- **Base de datos:** PostgreSQL con Prisma ORM
- **Autenticación:** JWT en httpOnly cookies
- **Rate limiting:** Aplica limit general para todas las rutas
- **CORS:** Configurado para desarrollo local y producción
- **Validación:** Express-validator en backend, validación en frontend

---

**Fecha de implementación:** April 2026
**Estado final:** ✅ COMPLETO Y FUNCIONAL
