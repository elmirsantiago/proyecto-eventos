import { getAllUsers } from "../repositories/users.repository.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      status: "success",
      payload: users
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor"
    });
  }
};