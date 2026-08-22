# Plataforma de Eventos

API REST desarrollada con Node.js y Express para una plataforma de gestión de eventos, usuarios y sesiones de autenticación.

## Temática

El proyecto permitirá administrar eventos, usuarios y sesiones de autenticación.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- bcrypt
- JSON Web Token (JWT)
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

El archivo `.env` no debe subirse al repositorio.

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
│   └── db.js
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   └── auth.middleware.js
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── services/
│   └── sessions.service.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba que el servidor está activo |
| GET | `/api/events` | Devuelve la lista de eventos |
| POST | `/api/sessions/register` | Registra un nuevo usuario |
| POST | `/api/sessions/login` | Inicia sesión y genera la cookie de autenticación |
| GET | `/api/sessions/current` | Devuelve los datos del usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie |

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

`GET /api/events`

Devuelve la lista de eventos.

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

## Registro de usuarios

`POST /api/sessions/register`

Permite registrar un nuevo usuario de forma segura.

### Campos obligatorios

- `first_name`
- `last_name`
- `email`
- `password`

Ejemplo de request:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Respuesta exitosa — `201 Created`:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_GENERADO_POR_MONGODB",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña se almacena hasheada mediante bcrypt y nunca se devuelve en la respuesta de la API.

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

La contraseña debe tener al menos 8 caracteres.

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

Permite iniciar sesión utilizando email y contraseña.

Ejemplo de request:

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

Al iniciar sesión correctamente se genera un JWT y se almacena en una cookie llamada `currentUser`.

La cookie utiliza:

- `httpOnly: true`
- `sameSite: "lax"`
- `maxAge: 3600000`
- `secure: true` solamente en producción

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

Ruta protegida que requiere una sesión válida.

El middleware de autenticación obtiene el JWT desde la cookie `currentUser`, verifica el token y guarda sus datos en `req.user`.

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

Sin cookie o con un token inválido/expirado — `401 Unauthorized`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

## Logout

`POST /api/sessions/logout`

Cierra la sesión eliminando la cookie `currentUser`.

Respuesta exitosa — `200 OK`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, intentar acceder nuevamente a `/api/sessions/current` devuelve `401 Unauthorized`.

## Seguridad

- Las contraseñas se hashean utilizando bcrypt antes de almacenarse.
- Los emails se normalizan utilizando `trim` y `lowercase`.
- El rol del registro público siempre se establece como `user`.
- El rol no puede modificarse desde el body del registro público.
- La contraseña nunca se devuelve en las respuestas de la API.
- La autenticación utiliza JSON Web Tokens (JWT).
- El JWT contiene únicamente `id`, `email` y `role`.
- El JWT se firma utilizando `JWT_SECRET` desde las variables de entorno.
- La expiración del JWT se configura mediante `JWT_EXPIRES_IN`.
- El token se almacena en la cookie `currentUser` con `httpOnly: true`.
- La cookie utiliza `sameSite: "lax"` y `secure: true` únicamente en producción.
- La ruta `/api/sessions/current` está protegida mediante un middleware de autenticación.
- El logout elimina la cookie `currentUser`.
- Las variables sensibles se almacenan en `.env`.
- `.env` y `node_modules` están excluidos del repositorio mediante `.gitignore`.