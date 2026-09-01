# Plataforma de Eventos

API REST desarrollada con Node.js y Express para una plataforma de gestión de eventos, usuarios y sesiones de autenticación.

## Temática

El proyecto permitirá administrar eventos, usuarios y sesiones de autenticación.

La autenticación se encuentra centralizada mediante Passport.js, utilizando estrategias para registro, login y validación del usuario autenticado.

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
│   └── sessions.controller.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   └── auth.middleware.js
├── models/
│   ├── event.js
│   └── user.js
├── repositories/
│   └── users.repository.js
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
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

La ruta delega la autenticación mediante:

```text
passport.authenticate("register", ...)
```

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

Por ejemplo, se podrían agregar nuevas estrategias dentro de `passport.config.js` manteniendo la misma organización del proyecto.

## Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Comprueba que el servidor está activo |
| GET | `/api/events` | Devuelve la lista de eventos |
| POST | `/api/sessions/register` | Registra un nuevo usuario mediante Passport |
| POST | `/api/sessions/login` | Autentica al usuario y genera la cookie |
| GET | `/api/sessions/current` | Valida el JWT mediante Passport |
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

Utiliza la estrategia `current` de Passport.

La estrategia obtiene el JWT desde la cookie `currentUser`, verifica su validez y deja los datos disponibles en `req.user`.

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

Sin cookie, con un token inválido, manipulado o expirado — `401 Unauthorized`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

## Logout

`POST /api/sessions/logout`

El logout no utiliza una estrategia de Passport.

El controller elimina directamente la cookie `currentUser`.

Respuesta exitosa — `200 OK`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, intentar acceder nuevamente a `/api/sessions/current` devuelve `401 Unauthorized`.

## Seguridad

- Las contraseñas se hashean utilizando bcrypt.
- Los emails se normalizan mediante `trim` y `lowercase`.
- El rol del registro público siempre se establece como `user`.
- El rol no puede establecerse desde el body del registro.
- Las contraseñas nunca se devuelven en las respuestas.
- La autenticación se encuentra centralizada mediante Passport.js.
- Las estrategias `register`, `login` y `current` se encuentran en `passport.config.js`.
- El JWT contiene únicamente `id`, `email` y `role`.
- El JWT es generado por el controller después de un login exitoso.
- El JWT se firma utilizando `JWT_SECRET`.
- La expiración se configura mediante `JWT_EXPIRES_IN`.
- El token se almacena en la cookie `currentUser` con `httpOnly: true`.
- `/api/sessions/current` valida el JWT mediante la estrategia `current`.
- Los tokens inválidos, manipulados o expirados son rechazados.
- El logout elimina la cookie `currentUser`.
- `.env` y `node_modules` están excluidos del repositorio mediante `.gitignore`.