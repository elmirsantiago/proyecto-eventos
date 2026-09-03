import { Router } from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  changeEventStatus
} from "../controllers/events.controller.js";

import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Público
router.get("/", getEvents);

// Público
router.get("/:id", getEventById);

// Organizer o admin
router.post(
  "/",
  auth,
  authorize("organizer", "admin"),
  createEvent
);

// Dueño del evento o admin
router.put(
  "/:id",
  auth,
  authorize("organizer", "admin"),
  updateEvent
);

// Dueño del evento o admin
router.patch(
  "/:id/status",
  auth,
  authorize("organizer", "admin"),
  changeEventStatus
);

export default router;