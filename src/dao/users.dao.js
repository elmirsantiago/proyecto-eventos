import User from "../models/user.js";

export const findUserByIdDAO = async (id) => {
  return User.findById(id);
};

export const findUserByEmailDAO = async (email) => {
  return User.findOne({ email });
};

export const createUserDAO = async (userData) => {
  return User.create(userData);
};

export const findAllUsersDAO = async () => {
  return User.find().select("-password");
};

export const updateUserDAO = async (id, updateData) => {
  return User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
};