import { ordersService } from "../services/orders.service.js";

// GET /api/orders - lista los pedidos, acepta ?customer= ?store= ?status=
export const getOrders = async (req, res) => {
  try {
    const orders = await ordersService.getOrders({
      customer: req.query.customer,
      store: req.query.store,
      status: req.query.status
    });
    res.json({ status: "success", payload: orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// GET /api/orders/:oid - devuelve un pedido
export const getOrderById = async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// POST /api/orders - crea un pedido
export const createOrder = async (req, res) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json({ status: "success", payload: order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// PUT /api/orders/:oid/status - cambia el estado del pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await ordersService.updateOrderStatus(req.params.oid, req.body.status);
    res.json({ status: "success", payload: order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};
