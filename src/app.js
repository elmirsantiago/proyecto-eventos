import express from "express";
import cookieParser from "cookie-parser";

import eventsRouter from "./routes/events.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/users.router.js";
import ticketsRouter from "./routes/tickets.router.js";

import {
  initializePassport
} from "./config/passport.config.js";

import {
  errorHandler
} from "./middlewares/error.middleware.js";

const app = express();

// ==============================
// MIDDLEWARES GENERALES
// ==============================

app.use(express.json());
app.use(cookieParser());
app.use(initializePassport());

// ==============================
// HEALTH
// ==============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor activo"
  });
});

// ==============================
// ROUTES
// ==============================

app.use("/api/events", eventsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

// ==============================
// ERROR HANDLER
// Siempre debe ir después de las rutas
// ==============================

app.use(errorHandler);

export default app;