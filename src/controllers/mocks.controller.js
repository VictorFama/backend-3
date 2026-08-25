import { mocksService } from "../services/mocks.service.js";

// GET /api/mocks/mockingusers - usuarios falsos que no se guardan
export const getMockUsers = async (req, res) => {
  try {
    const users = mocksService.getMockUsers(req.query.qty);
    res.json({ status: "success", payload: users });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// GET /api/mocks/mockingorders - pedidos falsos que no se guardan
export const getMockOrders = async (req, res) => {
  try {
    const orders = await mocksService.getMockOrders(req.query.qty);
    res.json({ status: "success", payload: orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// POST /api/mocks/generateData - inserto en la base
export const generateData = async (req, res) => {
  try {
    const resultado = await mocksService.generateData(req.body);
    res.status(201).json({ status: "success", message: "Datos generados", payload: resultado });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};