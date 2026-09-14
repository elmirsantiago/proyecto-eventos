import {
  findUserByIdDAO,
  findUserByEmailDAO,
  createUserDAO,
  findAllUsersDAO,
  updateUserDAO
} from "../dao/users.dao.js";

export const getUserById = async (id) => {
  return findUserByIdDAO(id);
};

export const getUserByEmail = async (email) => {
  return findUserByEmailDAO(email);
};

export const saveUser = async (userData) => {
  return createUserDAO(userData);
};

export const getAllUsers = async () => {
  return findAllUsersDAO();
};

export const updateUser = async (id, updateData) => {
  return updateUserDAO(id, updateData);
};