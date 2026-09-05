import { storesService } from "../services/stores.service.js";

// GET /api/stores - lista los locales activos, acepta ?page= ?limit=
export const getStores = async (req, res, next) => {
  try {
    // si no vienen, la lista sale paginada de a 10 igual
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const stores = await storesService.getStores({ page, limit });

    res.json({ status: "success", page, limit, payload: stores });
  } catch (error) {
    // no armo la respuesta se la pasa al middleware
    next(error);
  }
};

// GET /api/stores/:sid - devuelve un local
export const getStoreById = async (req, res, next) => {
  try {
    const store = await storesService.getStoreById(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};

// POST /api/stores - crea un local
export const createStore = async (req, res, next) => {
  try {
    const store = await storesService.createStore(req.body);
    res.status(201).json({ status: "success", payload: store });
  } catch (error) {
    next(error);
  }
};
