import OrderModel from "../models/order.model.js";

// datos que mostramos del cliente y del local junto al pedido
const DATOS_CLIENTE = "firstName lastName email";
const DATOS_LOCAL = "name address";

export const ordersRepository = {
  // lista los pedidos, se puede filtrar por cliente, local o estado
  findAll: async ({ customer, store, status, page = 1, limit = 10 } = {}) => {
    const filtro = {};
    if (customer) filtro.customer = customer;
    if (store) filtro.store = store;
    if (status) filtro.status = status;

    // salteo los de las paginas anteriores y corto en limit
    const skip = (page - 1) * limit;

    // populate para no devolver un objectid pelado
    return OrderModel.find(filtro)
      .populate("customer", DATOS_CLIENTE)
      .populate("store", DATOS_LOCAL)
      .skip(skip)
      .limit(limit);
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
  },

  // piso los campos que le paso y devuelve el pedido ya actualizado
  update: async (id, updates) => {
    return OrderModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("customer", DATOS_CLIENTE)
      .populate("store", DATOS_LOCAL);
  },

  // guardo muchos pedidos de una sola vez
  insertMany: async (orders) => {
    return OrderModel.insertMany(orders);
  },
};
