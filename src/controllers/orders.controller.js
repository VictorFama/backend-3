import { ordersService } from "../services/orders.service.js";
import fs from "fs";

// GET /api/orders - lista los pedidos, acepta ?customer= ?store= ?status= ?page= ?limit=
export const getOrders = async (req, res, next) => {
  try {
    // si no vienen, la lista sale paginada de a 10 igual
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const orders = await ordersService.getOrders({
      customer: req.query.customer,
      store: req.query.store,
      status: req.query.status,
      page,
      limit
    });

    res.json({ status: "success", page, limit, payload: orders });
  } catch (error) {
    // no armo la respuesta se la pasa al middleware
    next(error);
  }
};

// GET /api/orders/:oid - devuelve un pedido
export const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.params.oid);
    res.json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders - crea un pedido
export const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:oid/status - cambia el estado del pedido
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus(req.params.oid, req.body.status);
    res.json({ status: "success", payload: order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/:oid/proof - sube el comprobante de entrega del pedido
export const uploadOrderProof = async (req, res, next) => {
  try {
    const order = await ordersService.addProof(req.params.oid, req.file);
    res.json({ status: "success", payload: order });
  } catch (error) {
    if (req.file) {
      await fs.promises.unlink(req.file.path);
    }
    next(error);
  }
};