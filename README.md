# Plataforma de Eventos

API REST desarrollada con Node.js y Express para una futura plataforma de gestión de eventos.

## Temática

El proyecto permitirá administrar eventos, usuarios y sesiones de autenticación.

## Tecnologías

- Node.js
- Express
- Dotenv
- ES Modules

## Instalación

Clonar el repositorio e instalar dependencias:

```bash
npm install
## Variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://127.0.0.1:27017/events-platform
JWT_SECRET=your_secret_here
```

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
├── controllers/
│   ├── events.controller.js
│   └── sessions.controller.js
├── dao/
├── middlewares/
├── models/
│   ├── Event.js
│   └── User.js
├── repositories/
├── routes/
│   ├── events.router.js
│   └── sessions.router.js
├── services/
└── utils/
```

## Rutas disponibles

### Health

`GET /api/health`

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### Events

`GET /api/events`

Respuesta:

```json
{
  "status": "success",
  "payload": []
}
```

### Sessions

Se encuentra creada la estructura inicial de rutas y controlador para el recurso `sessions`. La lógica de autenticación se implementará en una entrega posterior.