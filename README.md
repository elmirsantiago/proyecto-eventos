# Plataforma de Eventos

API REST desarrollada con Node.js y Express para una plataforma de gestión de eventos, usuarios y sesiones de autenticación.

## Temática

El proyecto permite administrar eventos, usuarios, autenticación y autorización por roles.

La autenticación se encuentra centralizada mediante Passport.js, utilizando estrategias para registro, login y validación del usuario autenticado.

Además, la API implementa un sistema de autorización por roles para diferenciar qué acciones puede realizar cada tipo de usuario.

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
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   └── authorize.middleware.js
├── models/
│   ├── event.js
│   └── user.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   ├── sessions.router.js
│   └── users.router.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Passport.js

La autenticación está centralizada en:

```text
src/config/passport.config.js
```

Passport se inicializa en `app.js`, mientras que las estrategias se configuran de forma independiente en `passport.config.js`.

Actualmente se implementan tres estrategias:

### Estrategia register

La estrategia `register` se encarga de:

- Validar los campos obligatorios.
- Validar el formato del email.
- Normalizar el email mediante `trim` y `lowercase`.
- Validar la longitud mínima de la contraseña.
- Verificar que el email no esté registrado.
- Hashear la contraseña mediante bcrypt.
- Establecer el rol `user` por defecto.
- Crear el usuario en MongoDB.

El registro público no permite crear usuarios con rol `organizer` o `admin` desde el body.

### Estrategia login

La estrategia `login`:

- Normaliza el email.
- Busca el usuario registrado.
- Compara la contraseña mediante bcrypt.
- Utiliza un mensaje genérico ante credenciales incorrectas.

Una vez autenticado el usuario, el controller genera el JWT y almacena el token en la cookie `currentUser`.

La generación del JWT no se realiza dentro de Passport.

### Estrategia current

La estrategia `current`:

- Obtiene el JWT desde la cookie `currentUser`.
- Verifica la firma y validez del token.
- Deja los datos autenticados disponibles en `req.user`.
- Rechaza el acceso con `401 Unauthorized` cuando no existe un token válido.

## Preparación para providers externos

La configuración de Passport se encuentra centralizada y separada de `app.js`.

Esto permite incorporar en el futuro nuevas estrategias y providers externos, como Google o GitHub, sin modificar la configuración principal de Express.

## Roles

El modelo `User` permite los siguientes roles:

- `user`
- `organizer`
- `admin`

El rol por defecto es:

```text
user
```

El registro público siempre asigna el rol `user`.

No es posible crear directamente usuarios `organizer` o `admin` enviando el rol desde el body del registro.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---|---|---|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

## Autenticación y autorización

La aplicación separa la autenticación de la autorización mediante middlewares reutilizables.

### Middleware de autenticación

Archivo:

```text
src/middlewares/auth.middleware.js
```

Este middleware:

- Lee el JWT desde la cookie `currentUser`.
- Verifica el token.
- Guarda el payload autenticado en `req.user`.
- Devuelve `401 Unauthorized` cuando no existe una sesión válida.

### Middleware de autorización

Archivo:

```text
src/middlewares/authorize.middleware.js
```

Este middleware recibe los roles permitidos para cada ruta.

Por ejemplo:

```javascript
authorize("organizer", "admin")
```

permite el acceso únicamente a usuarios con rol `organizer` o `admin`.

Si el usuario está autenticado pero no tiene permisos, devuelve:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

con código:

```text
403 Forbidden
```

## Diferencia entre 401 y 403

La API diferencia correctamente autenticación y autorización.

### 401 Unauthorized

Se utiliza cuando el usuario no posee una sesión válida.

Por ejemplo:

- No existe la cookie `currentUser`.
- El JWT es inválido.
- El JWT fue manipulado.
- El JWT expiró.

Respuesta:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

### 403 Forbidden

Se utiliza cuando el usuario está autenticado correctamente, pero su rol no tiene permisos para realizar determinada acción.

Respuesta:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

## Rutas disponibles

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Comprueba que el servidor está activo |
| GET | `/api/events` | Público | Devuelve los eventos publicados |
| POST | `/api/events` | organizer / admin | Crea un evento |
| PUT | `/api/events/:eid` | organizer propietario / admin | Modifica un evento |
| POST | `/api/sessions/register` | Público | Registra un nuevo usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Devuelve los datos del usuario autenticado |
| POST | `/api/sessions/logout` | Autenticado | Cierra la sesión |
| GET | `/api/users` | admin | Devuelve todos los usuarios |

## Health

`GET /api/health`

Comprueba que el servidor se encuentra activo.

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

## Events

### Consultar eventos

`GET /api/events`

Devuelve los eventos publicados.

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

### Crear evento

`POST /api/events`

Solo puede ser utilizado por usuarios con rol:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Congreso Tech 2026",
  "description": "Evento de tecnología y desarrollo",
  "date": "2026-10-15T18:00:00.000Z",
  "location": "Rosario"
}
```

Respuesta exitosa — `201 Created`:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_EVENTO",
    "title": "Congreso Tech 2026",
    "description": "Evento de tecnología y desarrollo",
    "date": "2026-10-15T18:00:00.000Z",
    "location": "Rosario",
    "organizer": "ID_DEL_USUARIO",
    "status": "published"
  }
}
```

Si un usuario con rol `user` intenta crear un evento:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

con `403 Forbidden`.

### Modificar evento

`PUT /api/events/:eid`

Un usuario con rol `organizer` solamente puede modificar sus propios eventos.

Un usuario con rol `admin` puede modificar cualquier evento.

Si un organizer intenta modificar un evento perteneciente a otro usuario:

```json
{
  "status": "error",
  "message": "No tenés permisos para modificar este evento"
}
```

con `403 Forbidden`.

## Propiedad de recursos

Cada evento almacena el identificador de su creador en el campo:

```text
organizer
```

Cuando un usuario con rol `organizer` intenta modificar un evento, se compara:

```text
event.organizer
```

con:

```text
req.user.id
```

Si ambos identificadores no coinciden, la modificación es rechazada con `403 Forbidden`.

Los administradores pueden modificar cualquier evento.

## Registro de usuarios

`POST /api/sessions/register`

Permite registrar un nuevo usuario mediante la estrategia `register` de Passport.

### Campos obligatorios

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

Respuesta exitosa — `201 Created`:

```json
{
  "status": "success",
  "message": "Usuario registrado correctamente",
  "payload": {
    "id": "ID_GENERADO_POR_MONGODB",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña se almacena hasheada mediante bcrypt y nunca se devuelve en las respuestas.

### Validaciones del registro

Campos faltantes — `400 Bad Request`:

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

Email inválido — `400 Bad Request`:

```json
{
  "status": "error",
  "message": "Email inválido"
}
```

Contraseña demasiado corta — `400 Bad Request`:

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

Email duplicado — `409 Conflict`:

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Login

`POST /api/sessions/login`

Utiliza la estrategia `login` de Passport para validar las credenciales.

Ejemplo:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Respuesta exitosa — `200 OK`:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

Después de una autenticación exitosa, el controller genera el JWT y lo almacena en la cookie `currentUser`.

La cookie utiliza:

- `httpOnly: true`
- `sameSite: "lax"`
- `maxAge: 3600000`
- `secure: true` únicamente en producción

Credenciales incorrectas — `401 Unauthorized`:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

El mismo mensaje se utiliza tanto para un email inexistente como para una contraseña incorrecta.

## Usuario actual

`GET /api/sessions/current`

Devuelve los datos del usuario autenticado.

Respuesta exitosa — `200 OK`:

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

La respuesta nunca incluye la contraseña.

Sin cookie o con un token inválido, manipulado o expirado:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

con `401 Unauthorized`.

## Ruta administrativa

`GET /api/users`

Esta ruta solamente puede ser utilizada por usuarios con rol `admin`.

Respuesta exitosa — `200 OK`:

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "ID_DEL_USUARIO",
      "first_name": "Ana",
      "last_name": "Pérez",
      "email": "ana@mail.com",
      "role": "user"
    }
  ]
}
```

Las contraseñas no se incluyen en la respuesta.

Si un `organizer` intenta acceder:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

con `403 Forbidden`.

## Logout

`POST /api/sessions/logout`

El controller elimina la cookie `currentUser`.

Respuesta exitosa — `200 OK`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, cualquier intento de acceder a una ruta privada devuelve `401 Unauthorized`.

## Casos de autorización comprobados

Antes de la entrega se probaron los siguientes casos:

- `POST /api/events` con rol `user` → `403 Forbidden`.
- `POST /api/events` con rol `organizer` → `201 Created`.
- Ruta administrativa con rol `organizer` → `403 Forbidden`.
- Ruta administrativa con rol `admin` → `200 OK`.
- Ruta privada sin cookie → `401 Unauthorized`.
- `organizer` intentando modificar un evento ajeno → `403 Forbidden`.

## Seguridad

- Las contraseñas se hashean utilizando bcrypt.
- Los emails se normalizan mediante `trim` y `lowercase`.
- El rol del registro público siempre se establece como `user`.
- El rol no puede establecerse desde el body del registro público.
- Las contraseñas nunca se devuelven en las respuestas.
- La autenticación se encuentra centralizada mediante Passport.js.
- Las estrategias `register`, `login` y `current` se encuentran en `passport.config.js`.
- El JWT contiene únicamente `id`, `email` y `role`.
- El JWT es generado por el controller después de un login exitoso.
- El JWT se firma utilizando `JWT_SECRET`.
- La expiración se configura mediante `JWT_EXPIRES_IN`.
- El token se almacena en la cookie `currentUser` con `httpOnly: true`.
- Los tokens inválidos, manipulados o expirados son rechazados.
- La autorización por roles se realiza mediante un middleware reutilizable.
- La API diferencia correctamente errores `401` y `403`.
- Los organizers solamente pueden modificar sus propios eventos.
- Los administradores pueden modificar cualquier evento.
- `.env` y `node_modules` están excluidos del repositorio mediante `.gitignore`.