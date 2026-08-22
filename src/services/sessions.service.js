import {
  getUserByEmail,
  saveUser
} from "../repositories/users.repository.js";

import {
  createHash,
  isValidPassword
} from "../utils/hash.js";

import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password
}) => {
  if (!first_name || !last_name || !email || !password) {
    const error = new Error("Faltan campos obligatorios");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error("Email inválido");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error(
      "La contraseña debe tener al menos 8 caracteres"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("El email ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await createHash(password);

  const user = await saveUser({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "user"
  });

  return {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const passwordIsValid = await isValidPassword(
    password,
    user.password
  );

  if (!passwordIsValid) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return token;
};