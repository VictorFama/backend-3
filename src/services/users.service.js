// reglas de negocio de usuarios, no conoce express ni mongoose
import { usersRepository } from "../repositories/users.repository.js";
import { USER_ROLE_VALUES } from "../constants/userroles.js";

export const usersService = {
  // devuelve los usuarios, valida el rol antes de ir a la base
  getUsers: async ({ role } = {}) => {
    if (role && !USER_ROLE_VALUES.includes(role)) {
      const error = new Error(`El rol "${role}" no existe. Validos: ${USER_ROLE_VALUES.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    return usersRepository.findAll({ role });
  },

  // devuelve un usuario o corta con 404
  getUserById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  // crea un usuario validando datos obligatorios, rol y email repetido
  createUser: async (userData) => {
    const { firstName, lastName, email, password, role } = userData;

    if (!firstName || !lastName || !email || !password) {
      const error = new Error("Faltan datos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    if (role && !USER_ROLE_VALUES.includes(role)) {
      const error = new Error(`El rol "${role}" no existe. Validos: ${USER_ROLE_VALUES.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    // el email es la identidad del usuario, no puede repetirse
    if (await usersRepository.existsByEmail(email)) {
      const error = new Error("Ya existe un usuario con ese email");
      error.statusCode = 409;
      throw error;
    }

    return usersRepository.create(userData);
  }
};
