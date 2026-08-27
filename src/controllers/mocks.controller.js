import { mocksService } from "../services/mocks.service.js";

// GET /api/mocks/mockingusers - usuarios falsos que no se guardan
export const getMockUsers = async (req, res, next) => {
  try {
    const users = mocksService.getMockUsers(req.query.qty);
    res.json({ status: "success", payload: users });
  } catch (error) {
    // no armo la respuesta se la pasa al middleware
    next(error);
  }
};

// GET /api/mocks/mockingorders - pedidos falsos que no se guardan
export const getMockOrders = async (req, res, next) => {
  try {
    const orders = await mocksService.getMockOrders(req.query.qty);
    res.json({ status: "success", payload: orders });
  } catch (error) {
    next(error);
  }
};

// POST /api/mocks/generateData - inserto en la base
export const generateData = async (req, res, next) => {
  try {
    const resultado = await mocksService.generateData(req.body);
    res.status(201).json({ status: "success", message: "Datos generados", payload: resultado });
  } catch (error) {
    next(error);
  }
};