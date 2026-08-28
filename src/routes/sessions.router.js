import { Router } from "express";
import passport from "passport";

import {
  registerUser,
  loginUser,
  currentUser,
  logoutUser
} from "../controllers/sessions.controller.js";

const router = Router();


// Middleware auxiliar para manejar Passport
const authenticate = (
  strategy,
  defaultMessage,
  defaultStatus = 401,
  useInfoMessage = false
) => {
  return (req, res, next) => {
    passport.authenticate(
      strategy,
      { session: false },
      (error, user, info) => {
        if (error) {
          return next(error);
        }

        if (!user) {
          return res.status(info?.statusCode || defaultStatus).json({
            status: "error",
            message:
              useInfoMessage && info?.message
                ? info.message
                : defaultMessage
          });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
};


// REGISTER
router.post(
  "/register",
  authenticate(
    "register",
    "No se pudo registrar el usuario",
    400,
    true
  ),
  registerUser
);


// LOGIN
router.post(
  "/login",
  authenticate(
    "login",
    "Credenciales inválidas",
    401
  ),
  loginUser
);


// CURRENT
router.get(
  "/current",
  authenticate(
    "current",
    "No autenticado",
    401
  ),
  currentUser
);


// LOGOUT
router.post(
  "/logout",
  logoutUser
);


export default router;