import { generateMockUsers } from "../mock/users.mocks.js";
import { generateMockStores } from "../mock/stores.mocks.js";
import { generateMockOrders } from "../mock/orders.mocks.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ordersRepository } from "../repositories/orders.repository.js";
import { USER_ROLES } from "../constants/userroles.js";


import { createError } from "../utils/AppError.js";

import logger from "../config/logger.js";

// tope de registros por reques
const MAX_MOCK_ITEMS = 100;

export const mocksService = {

  // valido que una cantidad sea entera no negativa y que no pase el tope
  validarCantidad: (valor, nombre) => {
    const cantidad = Number(valor);

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      throw createError("INVALID_MOCK_AMOUNT", `"${nombre}" tiene que ser un numero entero mayor o igual a cero y llego "${valor}"`);
    }

    if (cantidad > MAX_MOCK_ITEMS) {
      throw createError("INVALID_MOCK_AMOUNT", `"${nombre}" no puede superar ${MAX_MOCK_ITEMS} y llego ${cantidad}`);
    }

    return cantidad;
  },

   // si la carga en mongo falla la devuelvo como MOCK_GENERATION_ERROR
  insertarOFallar: async (nombre, insercion) => {
    try {
      return await insercion();
    } catch (error) {
      throw createError("MOCK_GENERATION_ERROR", `Fallo la insercion de ${nombre}: ${error.message}`);
    }
  },

  // genero usuarios falsos sin guardarlos
  getMockUsers: (qty) => {
    const cantidad = mocksService.validarCantidad(qty ?? 10, "qty");
    logger.debug(`Generando ${cantidad} usuarios`);
    return generateMockUsers(cantidad);
  },

  // genero pedidos falsos sin guardarlos apuntando a clientes y locales reales
  getMockOrders: async (qty) => {
    const cantidad = mocksService.validarCantidad(qty ?? 5, "qty");

    const clientes = await usersRepository.findAll({ role: USER_ROLES.CUSTOMER });
    const locales = await storesRepository.findAll();

    // un pedido necesita cliente y local si no hay no se puede inventar
    if (clientes.length === 0 || locales.length === 0) {
      throw createError("MOCK_DEPENDENCIES_MISSING", "Primero hay que cargar clientes y locales");
    }

    logger.debug(`Generando ${cantidad} pedidos sobre ${clientes.length} clientes y ${locales.length} locales`);

    return generateMockOrders(cantidad, clientes, locales);
  },

  // inserto en la base respetando el orden
  generateData: async ({ users = 0, stores = 0, orders = 0 }) => {
    const cantUsers = mocksService.validarCantidad(users, "users");
    const cantStores = mocksService.validarCantidad(stores, "stores");
    const cantOrders = mocksService.validarCantidad(orders, "orders");

    const cantDuenios = Math.ceil(cantUsers / 2);
    const cantClientes = cantUsers - cantDuenios;

    const usuariosCreados = cantUsers > 0
      ? await mocksService.insertarOFallar("usuarios", () => usersRepository.insertMany([
          ...generateMockUsers(cantClientes, USER_ROLES.CUSTOMER),
          ...generateMockUsers(cantDuenios, USER_ROLES.STORE)
        ]))
      : [];


    // si no se pidieron usuarios nuevos uso los que ya estan en la base
    const duenios = usuariosCreados.filter((u) => u.role === USER_ROLES.STORE);
    const clientes = usuariosCreados.filter((u) => u.role === USER_ROLES.CUSTOMER);

    const dueniosDisponibles = duenios.length > 0
      ? duenios
      : await usersRepository.findAll({ role: USER_ROLES.STORE });

    if (cantStores > 0 && dueniosDisponibles.length === 0) {
      throw createError("MOCK_DEPENDENCIES_MISSING", "Para crear locales hacen falta usuarios con rol store");
    }

    const localesCreados = cantStores > 0
      ? await mocksService.insertarOFallar("locales", () => storesRepository.insertMany(
          generateMockStores(cantStores, dueniosDisponibles)
        ))
      : [];

      const clientesDisponibles = clientes.length > 0
      ? clientes
      : await usersRepository.findAll({ role: USER_ROLES.CUSTOMER });

    const localesDisponibles = localesCreados.length > 0
      ? localesCreados
      : await storesRepository.findAll();

    if (cantOrders > 0 && (clientesDisponibles.length === 0 || localesDisponibles.length === 0)) {
      throw createError("MOCK_DEPENDENCIES_MISSING", "Para crear pedidos hacen falta clientes y locales");
    }

    const pedidosCreados = cantOrders > 0
      ? await mocksService.insertarOFallar("pedidos", () => ordersRepository.insertMany(
          generateMockOrders(cantOrders, clientesDisponibles, localesDisponibles)
        ))
      : [];

    logger.info(
      `Datos de prueba cargados en MongoDB: ${usuariosCreados.length} usuarios, ` +
      `${localesCreados.length} locales, ${pedidosCreados.length} pedidos`
    );

    return {
      users: usuariosCreados.length,
      stores: localesCreados.length,
      orders: pedidosCreados.length
    };
  }
};