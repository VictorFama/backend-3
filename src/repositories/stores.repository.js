import StoreModel from "../models/store.model.js";

// datos del dueño que mostramos junto al local
const DATOS_OWNER = "firstName lastName email";

export const storesRepository = {
  // por defecto solo trae los locales activos
  findAll: async ({ incluirInactivos = false, page = 1, limit = 10 } = {}) => {
    const filtro = {};
    if (!incluirInactivos) filtro.isActive = true;

    // salteo los de las paginas anteriores y corto en limit
    const skip = (page - 1) * limit;

    return StoreModel.find(filtro).populate("owner", DATOS_OWNER).skip(skip).limit(limit);
  },

  // busca un local por id
  findById: async (id) => {
    return StoreModel.findById(id).populate("owner", DATOS_OWNER);
  },

  // guarda un local nuevo
  create: async (storeData) => {
    return StoreModel.create(storeData);
  },

  // guardo muchos locales de una sola vez
  insertMany: async (stores) => {
    return StoreModel.insertMany(stores);
  }
};
