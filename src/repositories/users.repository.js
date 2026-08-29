// unica capa que conoce mongoose
import UserModel from "../models/user.model.js";

// el password no sale nunca en las consultas
const SIN_PASSWORD = "-password";

export const usersRepository = {
  // trae los usuarios, se puede filtrar por rol
  findAll: async ({ role } = {}) => {
    const filtro = {};
    if (role) filtro.role = role;

    return UserModel.find(filtro).select(SIN_PASSWORD);
  },

  // busca un usuario por id
  findById: async (id) => {
    return UserModel.findById(id).select(SIN_PASSWORD);
  },

  // dice si ya hay alguien registrado con ese email
  existsByEmail: async (email) => {
    const user = await UserModel.findOne({ email });
    return user !== null;
  },

  // guarda un usuario nuevo y lo devuelve sin el password
  create: async (userData) => {
    const user = await UserModel.create(userData);
    const { password, ...sinPassword } = user.toObject();
    return sinPassword;
  },

  // piso los campos que le paso y devuelve el usuario ya actualizado
  update: async (id, updates) => {
    return UserModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select(SIN_PASSWORD);
  },

   // guardo muchos usuarios de una sola vez
  insertMany: async (users) => {
    return UserModel.insertMany(users);
  }
};

 
