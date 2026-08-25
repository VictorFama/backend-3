import { storesService } from "../services/stores.service.js";

// GET /api/stores - lista los locales activos
export const getStores = async (req, res) => {
  try {
    const stores = await storesService.getStores();
    res.json({ status: "success", payload: stores });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// GET /api/stores/:sid - devuelve un local
export const getStoreById = async (req, res) => {
  try {
    const store = await storesService.getStoreById(req.params.sid);
    res.json({ status: "success", payload: store });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// POST /api/stores - crea un local
export const createStore = async (req, res) => {
  try {
    const store = await storesService.createStore(req.body);
    res.status(201).json({ status: "success", payload: store });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};
