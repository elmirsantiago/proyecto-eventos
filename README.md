# Plataforma de Eventos

API REST desarrollada con Node.js, Express y MongoDB para una plataforma de gestión de eventos, usuarios, autenticación y autorización.

El proyecto utiliza una arquitectura organizada por capas, autenticación mediante Passport.js y JWT, autorización basada en roles y un CRUD de eventos con validaciones de negocio, filtros, paginación y ordenamiento.

## Temática

La plataforma permite administrar:

- Usuarios.
- Sesiones de autenticación.
- Roles y permisos.
- Eventos.
- Estados de eventos.
- Propiedad de eventos.
- Filtros y búsqueda.
- Paginación y ordenamiento.

La autenticación se encuentra centralizada mediante Passport.js y JWT.

La autorización utiliza roles y middlewares reutilizables para controlar el acceso a los diferentes endpoints.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- bcrypt
- JSON Web Token (JWT)
- Passport.js
- Passport Local
- Passport JWT
- Cookie Parser
- Dotenv
- ES Modules

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/events-platform
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1h
```

El archivo `.env` contiene información sensible y no debe subirse al repositorio.

## Ejecución

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para ejecutar normalmente:

```bash
npm start
```

El servidor se ejecuta por defecto en:

```text
http://localhost:8080
```

## Arquitectura

El proyecto utiliza una arquitectura organizada por capas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model / MongoDB
```

Cada capa tiene una responsabilidad específica.

### Routes

Definen los endpoints y aplican los middlewares correspondientes.

### Controllers

Manejan las requests y responses HTTP.

Los controllers delegan la lógica de negocio a los services.

### Services

Contienen las reglas y validaciones de negocio.

Por ejemplo:

- Validación de fechas.
- Validación de capacidad y precio.
- Control de propiedad de eventos.
- Restricciones según el estado del evento.
- Construcción de filtros.
- Paginación.
- Ordenamiento.

### Repositories

Actúan como intermediarios entre los services y los DAO.

### DAO

Realizan el acceso directo a los datos utilizando Mongoose.

### Models

Definen los schemas utilizados por MongoDB.

## Estructura del proyecto

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── passport.config.js
├── controllers/
│   ├── events.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   └── authorize.middleware.js
├── models/
│   ├── event.js
│   └── user.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   └── users.router.js
├── services/
│   └── events.service.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Modelo User

El modelo de usuario contiene los siguientes campos principales:

- `first_name`
- `last_name`
- `email`
- `password`
- `role`

Los roles permitidos son:

```text
user
organizer
admin
```

El rol por defecto es:

```text
user
```

El registro público siempre asigna el rol `user`.

No es posible crear usuarios `organizer` o `admin` enviando el rol desde el body del registro público.

## Modelo Event

El modelo `Event` contiene los siguientes campos:

- `title`
- `description`
- `category`
- `date`
- `location`
- `capacity`
- `price`
- `status`
- `organizer`

También incluye automáticamente:

- `createdAt`
- `updatedAt`

### Organizer

El campo `organizer` es una referencia `ObjectId` al modelo `User`.

```javascript
organizer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
```

El usuario completo no se almacena dentro del evento.

Al crear un evento, el organizer se obtiene automáticamente desde:

```text
req.user.id
```

Por seguridad, el organizer enviado desde el body no se utiliza.

### Estados de un evento

Los estados permitidos son:

```text
draft
published
cancelled
finished
```

El estado por defecto es:

```text
draft
```

Los eventos no se eliminan físicamente de la base de datos.

Cancelar un evento significa cambiar su estado a:

```text
cancelled
```

## Validaciones del modelo Event

Los siguientes campos son obligatorios:

- `title`
- `description`
- `category`
- `date`
- `location`
- `capacity`
- `price`
- `organizer`

Además:

```text
capacity > 0
price >= 0
```

El campo `status` solamente acepta los valores definidos en el modelo.

## Passport.js

La autenticación está centralizada en:

```text
src/config/passport.config.js
```

Passport se inicializa desde la configuración de la aplicación.

Actualmente se implementan tres estrategias:

- `register`
- `login`
- `current`

## Estrategia register

La estrategia `register` se encarga de:

- Validar los campos obligatorios.
- Validar el formato del email.
- Normalizar el email.
- Validar la longitud mínima de la contraseña.
- Verificar que el email no esté registrado.
- Hashear la contraseña mediante bcrypt.
- Establecer el rol `user`.
- Crear el usuario en MongoDB.

El registro público no permite asignar roles elevados desde el body.

## Estrategia login

La estrategia `login`:

- Normaliza el email.
- Busca el usuario registrado.
- Compara la contraseña mediante bcrypt.
- Utiliza un mensaje genérico ante credenciales incorrectas.

Después de una autenticación exitosa, el controller genera un JWT y lo almacena en la cookie:

```text
currentUser
```

## Estrategia current

La estrategia `current`:

- Obtiene el JWT desde la cookie `currentUser`.
- Verifica la firma y validez del token.
- Deja los datos autenticados disponibles en `req.user`.
- Rechaza tokens inexistentes, inválidos o expirados.

## Roles y autorización

La API implementa autorización basada en roles.

### user

Puede:

- Registrarse.
- Iniciar sesión.
- Consultar eventos públicos.
- Consultar un evento por ID.

No puede:

- Crear eventos.
- Modificar eventos.
- Acceder a rutas administrativas.

### organizer

Puede:

- Consultar eventos.
- Crear eventos.
- Modificar sus propios eventos.
- Cambiar el estado de sus propios eventos.

No puede modificar eventos pertenecientes a otros organizers.

### admin

Puede:

- Consultar eventos.
- Crear eventos.
- Modificar cualquier evento.
- Cambiar el estado de cualquier evento.
- Consultar la lista de usuarios.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos | Sí | Sí | Sí |
| Consultar evento por ID | Sí | Sí | Sí |
| Crear eventos | No | Sí | Sí |
| Modificar evento propio | No | Sí | Sí |
| Modificar evento ajeno | No | No | Sí |
| Cambiar estado propio | No | Sí | Sí |
| Cambiar estado ajeno | No | No | Sí |
| Consultar todos los usuarios | No | No | Sí |

## Middleware de autenticación

Archivo:

```text
src/middlewares/auth.middleware.js
```

El middleware:

- Lee el JWT desde la cookie `currentUser`.
- Verifica el token.
- Guarda el payload en `req.user`.
- Devuelve `401 Unauthorized` cuando no existe una sesión válida.

## Middleware de autorización

Archivo:

```text
src/middlewares/authorize.middleware.js
```

Permite definir los roles autorizados para una ruta.

Ejemplo:

```javascript
authorize("organizer", "admin")
```

Si el usuario está autenticado pero no tiene el rol requerido, devuelve:

```text
403 Forbidden
```

## Diferencia entre 401 y 403

La API diferencia autenticación y autorización.

### 401 Unauthorized

Significa que no existe una sesión válida.

Puede ocurrir cuando:

- No existe la cookie.
- No existe un JWT.
- El token es inválido.
- El token fue manipulado.
- El token expiró.

Ejemplo:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### 403 Forbidden

Significa que el usuario está autenticado, pero no posee permisos suficientes.

Ejemplo:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

## Rutas disponibles

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Comprueba el estado del servidor |
| POST | `/api/sessions/register` | Público | Registra un usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Obtiene el usuario autenticado |
| POST | `/api/sessions/logout` | Autenticado | Cierra la sesión |
| GET | `/api/users` | admin | Lista los usuarios |
| POST | `/api/events` | organizer / admin | Crea un evento |
| GET | `/api/events` | Público | Lista eventos con filtros y paginación |
| GET | `/api/events/:id` | Público | Obtiene un evento |
| PUT | `/api/events/:id` | dueño / admin | Modifica un evento |
| PATCH | `/api/events/:id/status` | dueño / admin | Cambia el estado de un evento |

# Endpoints de eventos

## Crear evento

```text
POST /api/events
```

Acceso:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Workshop Backend",
  "description": "Workshop de desarrollo backend con Node.js",
  "category": "workshop",
  "date": "2026-11-20T18:00:00.000Z",
  "location": "Rosario",
  "capacity": 50,
  "price": 10000,
  "status": "published"
}
```

El campo `organizer` no debe enviarse.

La API lo obtiene automáticamente desde el usuario autenticado.

Respuesta exitosa:

```text
201 Created
```

Ejemplo:

```json
{
  "status": "success",
  "data": {
    "_id": "ID_DEL_EVENTO",
    "title": "Workshop Backend",
    "description": "Workshop de desarrollo backend con Node.js",
    "category": "workshop",
    "date": "2026-11-20T18:00:00.000Z",
    "location": "Rosario",
    "capacity": 50,
    "price": 10000,
    "status": "published",
    "organizer": "ID_DEL_ORGANIZER"
  }
}
```

## Reglas de creación

Al crear un evento:

- La fecha debe ser futura.
- `capacity` debe ser mayor a `0`.
- `price` debe ser mayor o igual a `0`.
- El organizer se obtiene desde `req.user`.
- El organizer enviado desde el body es ignorado.
- El estado inicial puede ser `draft` o `published`.

### Fecha pasada

Ejemplo de error:

```json
{
  "status": "error",
  "message": "La fecha del evento debe ser futura"
}
```

### Capacidad inválida

Ejemplo:

```json
{
  "status": "error",
  "message": "La capacidad debe ser mayor a 0"
}
```

### Precio inválido

Ejemplo:

```json
{
  "status": "error",
  "message": "El precio no puede ser negativo"
}
```

## Listar eventos

```text
GET /api/events
```

El endpoint es público.

El listado soporta:

- Filtros.
- Rango de fechas.
- Paginación.
- Ordenamiento.

## Filtros disponibles

### Status

```text
GET /api/events?status=published
```

### Category

```text
GET /api/events?category=workshop
```

### Location

```text
GET /api/events?location=Rosario
```

### Fecha desde

```text
GET /api/events?dateFrom=2026-10-01
```

### Fecha hasta

```text
GET /api/events?dateTo=2026-12-31
```

### Rango de fechas

```text
GET /api/events?dateFrom=2026-10-01&dateTo=2026-12-31
```

Los filtros pueden combinarse.

Ejemplo:

```text
GET /api/events?status=published&category=workshop&location=Rosario
```

## Paginación

Los parámetros disponibles son:

```text
page
limit
```

Valores por defecto:

```text
page=1
limit=10
```

Ejemplo:

```text
GET /api/events?page=2&limit=5
```

La respuesta incluye:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

## Filtros y paginación combinados

Ejemplo:

```text
GET /api/events?status=published&category=workshop&page=2&limit=5
```

Respuesta:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

## Ordenamiento

El endpoint soporta el parámetro:

```text
sort
```

Los campos disponibles son:

- `date`
- `price`
- `capacity`
- `createdAt`

Ejemplo:

```text
GET /api/events?sort=date
```

Orden descendente:

```text
GET /api/events?sort=-date
```

También pueden utilizarse:

```text
sort=price
sort=-price
sort=capacity
sort=-capacity
sort=createdAt
sort=-createdAt
```

## Consultar evento por ID

```text
GET /api/events/:id
```

El endpoint es público.

Ejemplo:

```text
GET /api/events/ID_DEL_EVENTO
```

Respuesta exitosa:

```text
200 OK
```

Si el evento no existe:

```text
404 Not Found
```

Respuesta:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

## Modificar evento

```text
PUT /api/events/:id
```

Acceso:

- Organizer propietario.
- Admin.

Un organizer solamente puede modificar sus propios eventos.

Si intenta modificar un evento ajeno:

```text
403 Forbidden
```

Ejemplo:

```json
{
  "status": "error",
  "message": "No tenés permisos para modificar este evento"
}
```

Un admin puede modificar eventos pertenecientes a cualquier organizer.

Los campos modificables son:

- `title`
- `description`
- `category`
- `date`
- `location`
- `capacity`
- `price`

El campo `organizer` no puede modificarse mediante este endpoint.

El estado se modifica mediante el endpoint específico de cambio de estado.

## Propiedad de eventos

Cada evento almacena el ID del usuario que lo creó:

```text
organizer
```

Cuando un organizer intenta modificar un evento, el service compara:

```text
event.organizer
```

con:

```text
req.user.id
```

Si no coinciden, la operación es rechazada con:

```text
403 Forbidden
```

Los usuarios con rol `admin` pueden modificar cualquier evento.

## Cambiar estado de un evento

```text
PATCH /api/events/:id/status
```

Acceso:

- Organizer propietario.
- Admin.

Ejemplo:

```json
{
  "status": "cancelled"
}
```

Los estados válidos son:

```text
draft
published
cancelled
finished
```

## Cancelación de eventos

Los eventos no se eliminan físicamente.

Para cancelar un evento se utiliza:

```json
{
  "status": "cancelled"
}
```

Una vez cancelado, el evento permanece almacenado en MongoDB.

## Eventos cancelados

Un evento cancelado no puede modificarse.

Tampoco puede cambiar nuevamente de estado.

Ejemplo:

```json
{
  "status": "error",
  "message": "No se puede cambiar el estado de un evento cancelado"
}
```

## Publicación de eventos

No se permite publicar un evento cuya fecha ya haya finalizado.

Si se intenta cambiar a `published` un evento cuya fecha ya pasó, la operación es rechazada.

## Registro de usuarios

```text
POST /api/sessions/register
```

Campos obligatorios:

- `first_name`
- `last_name`
- `email`
- `password`

Ejemplo:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com",
  "password": "Secreta123"
}
```

Respuesta exitosa:

```text
201 Created
```

```json
{
  "status": "success",
  "message": "Usuario registrado correctamente",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña se almacena hasheada y nunca se devuelve.

## Login

```text
POST /api/sessions/login
```

Ejemplo:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Respuesta:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Después del login se genera un JWT almacenado en la cookie `currentUser`.

La cookie utiliza:

- `httpOnly: true`
- `sameSite: "lax"`
- `maxAge: 3600000`
- `secure: true` únicamente en producción

## Usuario actual

```text
GET /api/sessions/current
```

Devuelve los datos del usuario autenticado.

Ejemplo:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_USUARIO",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña nunca se incluye.

## Ruta administrativa

```text
GET /api/users
```

Acceso:

```text
admin
```

Devuelve la lista de usuarios sin incluir las contraseñas.

Un usuario autenticado sin rol `admin` recibe:

```text
403 Forbidden
```

## Logout

```text
POST /api/sessions/logout
```

Elimina la cookie:

```text
currentUser
```

Respuesta:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

## Reglas de negocio principales

La lógica de negocio relacionada con eventos se encuentra en:

```text
src/services/events.service.js
```

Las reglas principales son:

1. No se pueden crear eventos con fecha pasada.
2. La capacidad debe ser mayor a `0`.
3. El precio debe ser mayor o igual a `0`.
4. El organizer se obtiene automáticamente del usuario autenticado.
5. Un organizer solamente puede modificar sus propios eventos.
6. Un admin puede modificar eventos de cualquier organizer.
7. Los eventos cancelados no pueden modificarse.
8. Los eventos cancelados no pueden volver a cambiar de estado.
9. No se pueden publicar eventos cuya fecha ya haya finalizado.
10. Cancelar un evento no lo elimina de MongoDB.
11. Los eventos se consultan mediante filtros y paginación.
12. Las validaciones de negocio no se encuentran en las rutas ni en los controllers.

## Casos de prueba realizados

Antes de la entrega se comprobaron los siguientes casos:

### 1. Crear evento con rol user

Resultado:

```text
403 Forbidden
```

El usuario autenticado no posee permisos para crear eventos.

### 2. Crear evento con fecha pasada

Resultado:

```text
400 Bad Request
```

Respuesta:

```json
{
  "status": "error",
  "message": "La fecha del evento debe ser futura"
}
```

### 3. Crear evento con capacity igual a 0

Resultado:

```text
400 Bad Request
```

Respuesta:

```json
{
  "status": "error",
  "message": "La capacidad debe ser mayor a 0"
}
```

### 4. Organizer modifica evento propio

Resultado:

```text
200 OK
```

El organizer puede modificar correctamente un evento creado por él mismo.

### 5. Organizer modifica evento ajeno

Resultado:

```text
403 Forbidden
```

Respuesta:

```json
{
  "status": "error",
  "message": "No tenés permisos para modificar este evento"
}
```

### 6. Admin modifica evento de otro organizer

Resultado:

```text
200 OK
```

El administrador puede modificar eventos pertenecientes a otros organizers.

### 7. Cambiar estado de evento cancelado

Resultado:

```text
400 Bad Request
```

Respuesta:

```json
{
  "status": "error",
  "message": "No se puede cambiar el estado de un evento cancelado"
}
```

### 8. Listado con filtros y paginación

Request:

```text
GET /api/events?status=published&category=workshop&page=2&limit=5
```

Respuesta comprobada:

```json
{
  "status": "success",
  "data": [],
  "page": 2,
  "limit": 5,
  "total": 0,
  "totalPages": 0
}
```

### 9. Consultar evento inexistente

Resultado:

```text
404 Not Found
```

Respuesta:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

## Seguridad

- Las contraseñas se hashean utilizando bcrypt.
- Los emails se normalizan.
- Las contraseñas nunca se devuelven en las respuestas.
- El registro público siempre asigna el rol `user`.
- Los roles elevados no pueden asignarse desde el body del registro público.
- La autenticación utiliza Passport.js.
- El JWT contiene únicamente la información necesaria del usuario.
- El JWT se firma utilizando `JWT_SECRET`.
- La expiración se configura mediante `JWT_EXPIRES_IN`.
- El JWT se almacena en una cookie `httpOnly`.
- Los tokens inválidos, manipulados o expirados son rechazados.
- La API diferencia errores `401 Unauthorized` y `403 Forbidden`.
- La autorización por roles utiliza middlewares reutilizables.
- Los organizers solamente pueden modificar sus propios eventos.
- Los administradores pueden modificar eventos de cualquier organizer.
- El organizer de un evento se guarda como referencia `ObjectId`.
- El organizer no puede asignarse desde el body al crear un evento.
- Los eventos cancelados no se eliminan físicamente.
- Las validaciones de negocio se encuentran en la capa de services.
- El acceso a datos se realiza mediante repositories y DAO.
- Los controllers se limitan al manejo de request y response.
- `.env` y `node_modules` están excluidos mediante `.gitignore`.

## Estado del proyecto

La API cuenta actualmente con:

- Registro seguro de usuarios.
- Login con Passport.js.
- Autenticación mediante JWT y cookies.
- Consulta del usuario autenticado.
- Logout.
- Autorización basada en roles.
- Control de propiedad de recursos.
- Ruta administrativa.
- Modelo completo de eventos.
- Creación de eventos.
- Consulta de eventos.
- Consulta de eventos por ID.
- Modificación de eventos.
- Cambio de estado.
- Cancelación lógica de eventos.
- Validaciones de negocio.
- Filtros.
- Rango de fechas.
- Paginación.
- Ordenamiento.
- Arquitectura organizada por capas.
# Pre-entrega 7 - Tickets, inscripciones y control de cupos

## Modelo Ticket

La plataforma incorpora un sistema de tickets para gestionar las inscripciones de los usuarios a eventos.

El modelo `Ticket` contiene:

- `user`
- `event`
- `status`
- `quantity`
- `reservationCode`
- `createdAt`
- `updatedAt`
- `cancelledAt`

Los campos `user` y `event` se almacenan como referencias `ObjectId` a los modelos correspondientes.

```javascript
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}

event: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Event",
  required: true
}
```

No se almacenan objetos completos de usuarios o eventos dentro del ticket.

## Estados de Ticket

Los estados permitidos son:

```text
confirmed
pending
cancelled
```

El estado por defecto de una nueva inscripción es:

```text
confirmed
```

Un ticket cancelado permanece almacenado en MongoDB y deja de ocupar cupo.

---

## Arquitectura de Tickets

La gestión de tickets mantiene la arquitectura por capas utilizada en el resto del proyecto:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model / MongoDB
```

Archivos principales:

```text
src/
├── controllers/
│   └── tickets.controller.js
├── dao/
│   └── tickets.dao.js
├── models/
│   └── ticket.js
├── repositories/
│   └── tickets.repository.js
├── routes/
│   └── tickets.router.js
├── services/
│   └── tickets.service.js
└── utils/
    └── mailer.js
```

Las validaciones de cupos, duplicados, estados y propiedad se encuentran en `tickets.service.js`.

Los controllers solamente manejan `request` y `response`.

El acceso a MongoDB se realiza mediante Repository y DAO.

---

# Endpoints de Tickets

## Crear inscripción

```text
POST /api/events/:eid/tickets
```

Acceso:

```text
Usuario autenticado
```

Ejemplo de body:

```json
{
  "quantity": 1
}
```

Respuesta exitosa:

```text
201 Created
```

Ejemplo:

```json
{
  "status": "success",
  "message": "Inscripción realizada correctamente",
  "data": {
    "user": "ID_DEL_USUARIO",
    "event": "ID_DEL_EVENTO",
    "status": "confirmed",
    "quantity": 1,
    "reservationCode": "CODIGO_DE_RESERVA",
    "cancelledAt": null
  }
}
```

El código de reserva se genera automáticamente mediante `crypto.randomUUID()`.

---

## Validaciones de inscripción

Antes de crear un ticket se comprueba:

1. Que el evento exista.
2. Que el evento esté en estado `published`.
3. Que el evento no esté `cancelled`.
4. Que el evento no esté `finished`.
5. Que `quantity` sea un número entero mayor a `0`.
6. Que exista cupo suficiente.
7. Que el usuario no posea otra inscripción activa para el mismo evento.

Todas estas validaciones se realizan en la capa de services.

---

## Control de cupos

La cantidad de lugares ocupados se calcula sumando `quantity` únicamente de tickets con estados activos:

```text
confirmed
pending
```

Los tickets con estado:

```text
cancelled
```

no se incluyen en el cálculo.

El cupo disponible se calcula como:

```text
cupo disponible = capacidad del evento - cupos ocupados
```

Si la cantidad solicitada supera el cupo disponible, la inscripción es rechazada.

Ejemplo:

```json
{
  "status": "error",
  "message": "Cupo insuficiente. Lugares disponibles: 2"
}
```

Al cancelar un ticket, su cantidad deja automáticamente de formar parte del cálculo de cupos.

---

## Prevención de inscripciones duplicadas

Un usuario no puede tener más de un ticket activo para el mismo evento.

Se consideran activos los tickets:

```text
confirmed
pending
```

Si ya existe una inscripción activa:

```text
409 Conflict
```

Ejemplo:

```json
{
  "status": "error",
  "message": "Ya tenés una inscripción activa para este evento"
}
```

Un ticket cancelado no impide realizar una nueva inscripción.

---

## Consultar mis tickets

```text
GET /api/tickets/my-tickets
```

Acceso:

```text
Usuario autenticado
```

El endpoint devuelve únicamente los tickets pertenecientes al usuario autenticado.

Los datos principales del evento se obtienen mediante `populate`:

```text
title
date
location
```

Ejemplo conceptual:

```json
{
  "status": "success",
  "data": [
    {
      "event": {
        "title": "Workshop Backend",
        "date": "2026-12-15T18:00:00.000Z",
        "location": "Rosario"
      },
      "status": "confirmed",
      "quantity": 1,
      "reservationCode": "CODIGO_DE_RESERVA"
    }
  ]
}
```

No se exponen datos sensibles pertenecientes a otros usuarios.

---

## Consultar tickets de un evento

```text
GET /api/events/:eid/tickets
```

Acceso:

```text
Organizer propietario del evento
Admin
```

Un organizer solamente puede consultar las inscripciones correspondientes a sus propios eventos.

Si intenta consultar tickets de un evento perteneciente a otro organizer:

```text
403 Forbidden
```

Un usuario con rol `admin` puede consultar los tickets de cualquier evento.

---

## Cancelar ticket

```text
PATCH /api/tickets/:tid/cancel
```

Acceso:

```text
Dueño del ticket
Admin
```

La cancelación es lógica.

El documento no se elimina de MongoDB.

Al cancelar:

```text
status = cancelled
cancelledAt = fecha actual
```

Ejemplo:

```json
{
  "status": "success",
  "message": "Ticket cancelado correctamente",
  "data": {
    "status": "cancelled",
    "cancelledAt": "FECHA_DE_CANCELACION"
  }
}
```

No se permite cancelar nuevamente un ticket que ya se encuentra cancelado.

Un usuario común no puede cancelar tickets pertenecientes a otros usuarios.

---

# Notificaciones por email

La plataforma utiliza `Nodemailer` para enviar una confirmación cuando una inscripción se realiza correctamente.

El correo contiene:

- Confirmación de inscripción.
- Nombre del evento.
- Fecha.
- Lugar.
- Cantidad de lugares reservados.
- Código de reserva.

El envío se realiza desde:

```text
src/utils/mailer.js
```

Las credenciales SMTP no se encuentran hardcodeadas en el código.

Se obtienen exclusivamente mediante variables de entorno.

## Variables de email

`.env.example` debe contener:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Para Gmail, `MAIL_PASS` corresponde a una contraseña de aplicación y no a la contraseña normal de la cuenta.

Las credenciales reales solamente deben almacenarse en `.env`.

El archivo `.env` nunca debe subirse al repositorio.

---

# Rutas incorporadas en Pre-entrega 7

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/events/:eid/tickets` | Autenticado | Inscripción a un evento |
| GET | `/api/tickets/my-tickets` | Autenticado | Consulta los tickets propios |
| GET | `/api/events/:eid/tickets` | Organizer dueño / Admin | Consulta las inscripciones de un evento |
| PATCH | `/api/tickets/:tid/cancel` | Dueño / Admin | Cancela lógicamente un ticket |

---

# Reglas de negocio de Tickets

1. El evento debe existir.
2. Solamente se permiten inscripciones a eventos `published`.
3. No se permiten inscripciones a eventos `cancelled`.
4. No se permiten inscripciones a eventos `finished`.
5. `quantity` debe ser un entero mayor a `0`.
6. La cantidad solicitada no puede superar el cupo disponible.
7. Los tickets `cancelled` no ocupan cupo.
8. Un usuario no puede poseer dos tickets activos para el mismo evento.
9. La cancelación no elimina físicamente el ticket.
10. Solamente el dueño del ticket o un admin puede cancelarlo.
11. Un organizer solamente puede consultar tickets de sus propios eventos.
12. Un admin puede consultar tickets de cualquier evento.
13. Las validaciones de negocio se realizan en services.
14. Las rutas y controllers no contienen lógica de cálculo de cupos.

---

# Casos de prueba - Pre-entrega 7

Los casos definidos para validar el flujo completo son:

1. Inscripción exitosa y recepción del email de confirmación.
2. Inscripción sin sesión → `401 Unauthorized`.
3. Inscripción a evento inexistente → `404 Not Found`.
4. Inscripción a evento cancelado o finalizado → error de negocio.
5. Inscripción sin cupo suficiente → error con mensaje indicando disponibilidad.
6. Inscripción duplicada activa → `409 Conflict`.
7. Cancelación propia y posterior reutilización del cupo.
8. Cancelación de ticket ajeno como `user` → `403 Forbidden`.
9. Consulta de tickets de evento como `user` → `403 Forbidden`.
10. Consulta como `organizer` de tickets pertenecientes a evento ajeno → `403 Forbidden`.

## Pruebas verificadas durante el desarrollo

### Inscripción exitosa

Se verificó una inscripción real obteniendo:

```text
201 Created
```

El ticket fue almacenado con:

```text
status: confirmed
quantity: 1
reservationCode: generado automáticamente
cancelledAt: null
```

También se comprobó la recepción real del email de confirmación mediante Nodemailer.

### Inscripción sin autenticación

Se verificó:

```text
401 Unauthorized
```

Respuesta:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### Inscripción duplicada

Durante las pruebas también se verificó el rechazo de una segunda inscripción activa para el mismo usuario y evento:

```text
409 Conflict
```

```json
{
  "status": "error",
  "message": "Ya tenés una inscripción activa para este evento"
}
```

Los casos restantes forman parte del conjunto de pruebas funcionales definido para la entrega.

---

# Seguridad de Tickets y Email

- Los tickets almacenan referencias `ObjectId` y no objetos completos.
- La identidad del usuario se obtiene desde el JWT autenticado.
- El usuario no puede indicar otro `user` desde el body de la inscripción.
- Los tickets cancelados no se eliminan físicamente.
- Los tickets cancelados dejan de ocupar cupo.
- Se controla la propiedad del ticket antes de una cancelación.
- Se controla la propiedad del evento antes de mostrar sus inscripciones a un organizer.
- Las credenciales SMTP se almacenan exclusivamente en variables de entorno.
- `MAIL_PASS` nunca se encuentra hardcodeado.
- `.env` permanece excluido del repositorio.
- `.env.example` no contiene credenciales privadas.
- Las validaciones de negocio se encuentran en services.
- El acceso a MongoDB se encuentra separado mediante Repository y DAO.

---

# Estado actual del proyecto

La API cuenta actualmente con:

- Registro seguro de usuarios.
- Login con Passport.js.
- JWT mediante cookies.
- Autorización basada en roles.
- Control de propiedad de eventos.
- CRUD de eventos.
- Filtros.
- Paginación.
- Ordenamiento.
- Modelo de tickets.
- Inscripciones a eventos.
- Control de cupos.
- Prevención de inscripciones duplicadas.
- Cancelación lógica de tickets.
- Liberación automática de cupos.
- Consulta de tickets propios.
- Consulta de inscripciones por organizer/admin.
- Generación de códigos de reserva.
- Notificaciones de confirmación mediante Nodemailer.
- Credenciales SMTP mediante variables de entorno.
- Arquitectura organizada por capas.