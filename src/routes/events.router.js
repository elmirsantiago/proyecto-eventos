import { Router } from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  changeEventStatus
} from "../controllers/events.controller.js";

import {
  createTicket,
  getEventTickets
} from "../controllers/tickets.controller.js";

import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Público
router.get("/", getEvents);

// Crear ticket / inscripción
router.post(
  "/:eid/tickets",
  auth,
  createTicket
);

// Ver tickets de un evento
// El service verifica además que el organizer sea dueño del evento.
router.get(
  "/:eid/tickets",
  auth,
  authorize("organizer", "admin"),
  getEventTickets
);

// Público
router.get("/:id", getEventById);

// Crear evento
router.post(
  "/",
  auth,
  authorize("organizer", "admin"),
  createEvent
);

// Modificar evento
router.put(
  "/:id",
  auth,
  authorize("organizer", "admin"),
  updateEvent
);

// Cambiar estado
router.patch(
  "/:id/status",
  auth,
  authorize("organizer", "admin"),
  changeEventStatus
);

export default router;