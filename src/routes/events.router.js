import { Router } from "express";

import {
  getEvents,
  createEvent,
  updateEvent
} from "../controllers/events.controller.js";

import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();


// Público
router.get("/", getEvents);


// Solo organizer o admin
router.post(
  "/",
  auth,
  authorize("organizer", "admin"),
  createEvent
);


// Organizer dueño del evento o admin
router.put(
  "/:eid",
  auth,
  authorize("organizer", "admin"),
  updateEvent
);


export default router;