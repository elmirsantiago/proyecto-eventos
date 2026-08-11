import { Router } from "express";
import { sessionsStatus } from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", sessionsStatus);

export default router;