import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import {
  getUserByEmail,
  saveUser
} from "../repositories/users.repository.js";

import {
  createHash,
  isValidPassword
} from "../utils/hash.js";


// ==============================
// Estrategia REGISTER
// ==============================

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        const { first_name, last_name } = req.body;

        // Validación de campos obligatorios
        if (!first_name || !last_name || !email || !password) {
          return done(null, false, {
            message: "Faltan campos obligatorios",
            statusCode: 400
          });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
          return done(null, false, {
            message: "Email inválido",
            statusCode: 400
          });
        }

        // Validación de longitud de contraseña
        if (password.length < 8) {
          return done(null, false, {
            message: "La contraseña debe tener al menos 8 caracteres",
            statusCode: 400
          });
        }

        // Verificar email duplicado
        const existingUser = await getUserByEmail(normalizedEmail);

        if (existingUser) {
          return done(null, false, {
            message: "El email ya está registrado",
            statusCode: 409
          });
        }

        // Hash de contraseña
        const hashedPassword = await createHash(password);

        // El rol se fuerza a "user".
        // No usamos ningún role que venga en req.body.
        const user = await saveUser({
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "user"
        });

        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  )
);


// ==============================
// Estrategia LOGIN
// ==============================

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          return done(null, false, {
            message: "Credenciales inválidas"
          });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await getUserByEmail(normalizedEmail);

        // No revelamos si el email existe o no
        if (!user) {
          return done(null, false, {
            message: "Credenciales inválidas"
          });
        }

        const validPassword = await isValidPassword(
          password,
          user.password
        );

        // Mismo mensaje si falla la contraseña
        if (!validPassword) {
          return done(null, false, {
            message: "Credenciales inválidas"
          });
        }

        return done(null, user);

      } catch (error) {
        return done(error);
      }
    }
  )
);


// ==============================
// Estrategia CURRENT
// ==============================

// Passport toma el JWT directamente de la cookie currentUser.
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.currentUser || null;
  }

  return null;
};

passport.use(
  "current",
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        // El payload del JWT solamente contiene:
        // id, email y role.
        return done(null, payload);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


// ==============================
// Inicialización centralizada
// ==============================

export const initializePassport = () => {
  return passport.initialize();
};

export default passport;