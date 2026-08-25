import { storesRepository } from "../repositories/stores.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { USER_ROLES } from "../constants/userroles.js";

export const storesService = {
  // devuelve los locales activos
  getStores: async () => {
    return storesRepository.findAll();
  },

  // devuelve un local o corta con 404
  getStoreById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) {
      const error = new Error("Local no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return store;
  },

  // crea un local, el dueño tiene que existir y tener rol store
  createStore: async (storeData) => {
    const { name, address, owner } = storeData;

    if (!name || !address || !owner) {
      const error = new Error("Faltan datos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    const user = await usersRepository.findById(owner);
    if (!user) {
      const error = new Error("El dueño indicado no existe");
      error.statusCode = 404;
      throw error;
    }

    // regla del dominio: un local solo lo puede tener un usuario con rol store
    if (user.role !== USER_ROLES.STORE) {
      const error = new Error("El usuario indicado no tiene rol de local");
      error.statusCode = 409;
      throw error;
    }

    return storesRepository.create(storeData);
  }
};
