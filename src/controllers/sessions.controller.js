import { generateToken } from "../utils/jwt.js";


// ==============================
// REGISTER
// ==============================

export const registerUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      payload: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};


// ==============================
// LOGIN
// ==============================

export const loginUser = async (req, res) => {
  try {
    const user = req.user;

    const token = generateToken(user);

    res.cookie("currentUser", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};


// ==============================
// CURRENT
// ==============================

export const currentUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      status: "success",
      payload: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};


// ==============================
// LOGOUT
// ==============================

export const logoutUser = async (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};