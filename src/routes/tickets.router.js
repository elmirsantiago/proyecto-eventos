import { Router } from "express";

import {
  getMyTickets,
  cancelTicket
} from "../controllers/tickets.controller.js";

import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

// Tickets del usuario autenticado
router.get(
  "/my-tickets",
  auth,
  getMyTickets
);

// Cancelar ticket propio o como admin
router.patch(
  "/:tid/cancel",
  auth,
  cancelTicket
);

export default router;