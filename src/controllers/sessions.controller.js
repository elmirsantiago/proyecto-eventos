import {
  registerUser,
  loginUser
} from "../services/sessions.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      status: "success",
      payload: user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor"
    });
  }
};

export const login = async (req, res) => {
  try {
    const token = await loginUser(req.body);

    res.cookie("currentUser", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
      secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Error interno del servidor"
    });
  }
};

export const current = (req, res) => {
  res.status(200).json({
    status: "success",
    payload: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};

export const logout = (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.status(200).json({
    status: "success",
    message: "Sesión cerrada"
  });
};