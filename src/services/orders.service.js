import { ordersRepository } from "../repositories/orders.repository.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ORDER_STATUS, ORDER_STATUS_VALUES } from "../constants/orderstatus.js";

import { createError } from "../utils/AppError.js";

const CAMPOS_OBLIGATORIOS = ["customer", "store", "deliveryAddress"];
export const ordersService = {
  // devuelve los pedidos, valida el estado si viene como filtro
  getOrders: async ({ customer, store, status } = {}) => {
    if (status && !ORDER_STATUS_VALUES.includes(status)) {
            throw createError("INVALID_ORDER_STATUS", `Llego "${status}". Validos: ${ORDER_STATUS_VALUES.join(", ")}`);
    }

    return ordersRepository.findAll({ customer, store, status });
  },

  // devuelve un pedido o corta con ORDER_NOT_FOUND
  getOrderById: async (id) => {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND", `No hay ningun pedido con id ${id}`);
    }

    return order;
  },

  // crea el pedido: valida cliente, local e items, y calcula el total
  createOrder: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !orderData[campo]);
    if (faltantes.length > 0) {
      throw createError("VALIDATION_ERROR", `Faltan campos obligatorios: ${faltantes.join(", ")}`);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw createError("ORDER_ITEMS_REQUIRED", "items llego vacio o no es un array");
    }

    const user = await usersRepository.findById(customer);
    if (!user) {
      throw createError("USER_NOT_FOUND", `El cliente del pedido (${customer}) no existe`);
    }

    const local = await storesRepository.findById(store);
    if (!local) {
      throw createError("STORE_NOT_FOUND", `El local del pedido (${store}) no existe`);
    }

    // el total lo calcula el service, no llega desde afuera
    let total = 0;

    for (const item of items) {
      const cantidad = Number(item.quantity);
      const precio = Number(item.price);

      if (!item.name || !Number.isInteger(cantidad) || cantidad < 1) {
        throw createError("INVALID_ORDER_ITEM", "Cada item necesita name y una quantity entera mayor a cero");
      }

      if (Number.isNaN(precio) || precio < 0) {
        throw createError("INVALID_ORDER_ITEM", `El precio de "${item.name}" tiene que ser un numero positivo`);
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
      throw createError("INVALID_ORDER_STATUS", `Llego "${status}". Validos: ${ORDER_STATUS_VALUES.join(", ")}`);

    }

    const order = await ordersRepository.findById(id);
    if (!order) {
      throw createError("ORDER_NOT_FOUND", `No hay ningun pedido con id ${id}`);
    }

    // un pedido entregado o cancelado ya no cambia mas
    if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)) {
      throw createError("ORDER_ALREADY_CLOSED", `El pedido esta en estado "${order.status}"`);
    }

    return ordersRepository.updateStatus(id, status);
  }
};
