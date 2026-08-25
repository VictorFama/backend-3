import OrderModel from "../models/order.model.js";

// datos que mostramos del cliente y del local junto al pedido
const DATOS_CLIENTE = "firstName lastName email";
const DATOS_LOCAL = "name address";

export const ordersRepository = {
  // lista los pedidos, se puede filtrar por cliente, local o estado
  findAll: async ({ customer, store, status } = {}) => {
    const filtro = {};
    if (customer) filtro.customer = customer;
    if (store) filtro.store = store;
    if (status) filtro.status = status;

    // populate para no devolver un objectid pelado
    return OrderModel.find(filtro)
      .populate("customer", DATOS_CLIENTE)
      .populate("store", DATOS_LOCAL);
  },

  // busca un pedido por id
  findById: async (id) => {
    return OrderModel.findById(id)
      .populate("customer", DATOS_CLIENTE)
      .populate("store", DATOS_LOCAL);
  },

  // guarda un pedido nuevo
  create: async (orderData) => {
    return OrderModel.create(orderData);
  },

  // le cambia el estado a un pedido
  updateStatus: async (id, status) => {
    const order = await OrderModel.findById(id);
    order.status = status;
    return order.save();
  }
};
