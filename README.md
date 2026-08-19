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
    └── hash.js
```

## Rutas disponibles

### Health

`GET /api/health`

Comprueba que el servidor se encuentra activo.

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Events

`GET /api/events`

Devuelve la lista de eventos.

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

### Registro de usuarios

`POST /api/sessions/register`

Permite registrar un nuevo usuario de forma segura.

Campos obligatorios:

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

## Validaciones del registro

### Campos faltantes — 400

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Email inválido — 400

```json
{
  "status": "error",
  "message": "Email inválido"
}
```

### Contraseña demasiado corta — 400

La contraseña debe tener al menos 8 caracteres.

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Email duplicado — 409

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

## Seguridad

- Las contraseñas se hashean utilizando bcrypt antes de almacenarse.
- Los emails se normalizan utilizando `trim` y `lowercase`.
- El rol del registro público siempre se establece como `user`.
- El rol no puede modificarse desde el body del registro público.
- La contraseña nunca se devuelve en las respuestas de la API.
- Las variables sensibles se almacenan en `.env`.
- `.env` y `node_modules` están excluidos del repositorio mediante `.gitignore`.