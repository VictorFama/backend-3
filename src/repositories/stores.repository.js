import StoreModel from "../models/store.model.js";

// datos del dueño que mostramos junto al local
const DATOS_OWNER = "firstName lastName email";

export const storesRepository = {
  // por defecto solo trae los locales activos
  findAll: async ({ incluirInactivos = false } = {}) => {
    const filtro = {};
    if (!incluirInactivos) filtro.isActive = true;

    return StoreModel.find(filtro).populate("owner", DATOS_OWNER);
  },

  // busca un local por id
  findById: async (id) => {
    return StoreModel.findById(id).populate("owner", DATOS_OWNER);
  },

  // guarda un local nuevo
  create: async (storeData) => {
    return StoreModel.create(storeData);
  }
};
