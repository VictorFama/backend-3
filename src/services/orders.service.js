import { ordersRepository } from "../repositories/orders.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ORDER_STATUS, ORDER_STATUS_VALUES } from "../constants/orderstatus.js";

export const ordersService = {
  // devuelve los pedidos, valida el estado si viene como filtro
  getOrders: async ({ customer, store, status } = {}) => {
    if (status && !ORDER_STATUS_VALUES.includes(status)) {
      const error = new Error(`El estado "${status}" no existe. Validos: ${ORDER_STATUS_VALUES.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    return ordersRepository.findAll({ customer, store, status });
  },

  // devuelve un pedido o corta con 404
  getOrderById: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return order;
  },

  // crea el pedido: valida cliente, local e items, y calcula el total
  createOrder: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    if (!customer || !store || !deliveryAddress) {
      const error = new Error("Faltan datos obligatorios");
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error("El pedido tiene que incluir al menos un item");
      error.statusCode = 400;
      throw error;
    }

    const user = await usersRepository.findById(customer);
    if (!user) {
      const error = new Error("El cliente del pedido no existe");
      error.statusCode = 404;
      throw error;
    }

    const local = await storesRepository.findById(store);
    if (!local) {
      const error = new Error("El local del pedido no existe");
      error.statusCode = 404;
      throw error;
    }

    // el total lo calcula el service, no llega desde afuera
    let total = 0;

    for (const item of items) {
      const cantidad = Number(item.quantity);
      const precio = Number(item.price);

      if (!item.name || !Number.isInteger(cantidad) || cantidad < 1) {
        const error = new Error("Cada item necesita name y una quantity entera mayor a cero");
        error.statusCode = 400;
        throw error;
      }

      if (Number.isNaN(precio) || precio < 0) {
        const error = new Error(`El precio de "${item.name}" tiene que ser un numero positivo`);
        error.statusCode = 400;
        throw error;
      }

      total += precio * cantidad;
    }

    return ordersRepository.create({
      customer,
      store,
      items,
      deliveryAddress,
      total,
      priority,
      status: ORDER_STATUS.CREATED
    });
  },

  // cambia el estado del pedido
  updateOrderStatus: async (id, status) => {
    if (!ORDER_STATUS_VALUES.includes(status)) {
      const error = new Error(`El estado "${status}" no existe. Validos: ${ORDER_STATUS_VALUES.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const order = await ordersRepository.findById(id);
    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // un pedido entregado o cancelado ya no cambia mas
    if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)) {
      const error = new Error(`El pedido ya esta en estado "${order.status}" y no admite cambios`);
      error.statusCode = 409;
      throw error;
    }

    return ordersRepository.updateStatus(id, status);
  }
};
