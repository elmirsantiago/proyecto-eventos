import {
  generateToken
} from "../utils/jwt.js";

import {
  UserDTO
} from "../dto/user.dto.js";


// ==============================
// REGISTER
// ==============================

export const registerUser = async (
  req,
  res,
  next
) => {
  try {
    const user =
      new UserDTO(req.user);

    return res.status(201).json({
      status: "success",
      message:
        "Usuario registrado correctamente",
      payload: user
    });
  } catch (error) {
    next(error);
  }
};


// ==============================
// LOGIN
// ==============================

export const loginUser = async (
  req,
  res,
  next
) => {
  try {
    const user = req.user;

    const token =
      generateToken(user);

    res.cookie(
      "currentUser",
      token,
      {
        httpOnly: true,
        sameSite: "lax",
        maxAge:
          60 * 60 * 1000,
        secure:
          process.env.NODE_ENV ===
          "production"
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    next(error);
  }
};


// ==============================
// CURRENT
// ==============================

export const currentUser = async (
  req,
  res,
  next
) => {
  try {
    const user =
      new UserDTO(req.user);

    return res.status(200).json({
      status: "success",
      payload: user
    });
  } catch (error) {
    next(error);
  }
};


// ==============================
// LOGOUT
// ==============================

export const logoutUser = async (
  req,
  res,
  next
) => {
  try {
    res.clearCookie(
      "currentUser",
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production"
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Sesión cerrada"
    });
  } catch (error) {
    next(error);
  }
};