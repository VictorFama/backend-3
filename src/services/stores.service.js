import { storesRepository } from "../repositories/stores.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { USER_ROLES } from "../constants/userroles.js";

import { createError } from "../utils/AppError.js";

const CAMPOS_OBLIGATORIOS = ["name", "address", "owner"];

export const storesService = {
  // devuelve los locales activos
  getStores: async () => {
    return storesRepository.findAll();
  },

  // devuelve un local o corta con STORE_NOT_FOUND
  getStoreById: async (id) => {
    const store = await storesRepository.findById(id);
    if (!store) {
      throw createError("STORE_NOT_FOUND", `No hay ningun local con id ${id}`);
    }

    return store;
  },

  // crea un local, el dueño tiene que existir y tener rol store
  createStore: async (storeData) => {
    const { owner } = storeData;

    const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !storeData[campo]);
    if (faltantes.length > 0) {
      throw createError("VALIDATION_ERROR", `Faltan campos obligatorios: ${faltantes.join(", ")}`);
    }

    const user = await usersRepository.findById(owner);
    if (!user) {
      throw createError("USER_NOT_FOUND", `El dueño indicado (${owner}) no existe`);
    }

    // regla del dominio: un local solo lo puede tener un usuario con rol store
    if (user.role !== USER_ROLES.STORE) {
      throw createError("INVALID_STORE_OWNER", `El usuario ${owner} tiene rol "${user.role}"`);
    }

    return storesRepository.create(storeData);
  }
};
