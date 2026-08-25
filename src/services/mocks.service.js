import { generateMockUsers } from "../mock/users.mocks.js";
import { generateMockStores } from "../mock/stores.mocks.js";
import { generateMockOrders } from "../mock/orders.mocks.js";
import { usersRepository } from "../repositories/users.repository.js";
import { storesRepository } from "../repositories/stores.repository.js";
import { ordersRepository } from "../repositories/orders.repository.js";
import { USER_ROLES } from "../constants/userroles.js";

// tope de registros por reques
const MAX_MOCK_ITEMS = 100;

export const mocksService = {

  // valido que una cantidad sea entera no negativa y que no pase el tope
  validarCantidad: (valor, nombre) => {
    const cantidad = Number(valor);

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      const error = new Error(`"${nombre}" tiene que ser un numero entero mayor o igual a cero`);
      error.statusCode = 400;
      throw error;
    }

    if (cantidad > MAX_MOCK_ITEMS) {
      const error = new Error(`"${nombre}" no puede superar ${MAX_MOCK_ITEMS}`);
      error.statusCode = 400;
      throw error;
    }

    return cantidad;
  },

  // genero usuarios falsos sin guardarlos
  getMockUsers: (qty) => {
    const cantidad = mocksService.validarCantidad(qty ?? 10, "qty");
    return generateMockUsers(cantidad);
  },

  // genero pedidos falsos sin guardarlos apuntando a clientes y locales reales
  getMockOrders: async (qty) => {
    const cantidad = mocksService.validarCantidad(qty ?? 5, "qty");

    const clientes = await usersRepository.findAll({ role: USER_ROLES.CUSTOMER });
    const locales = await storesRepository.findAll();

    // un pedido necesita cliente y local si no hay no se puede inventar
    if (clientes.length === 0 || locales.length === 0) {
      const error = new Error("Primero hay que cargar clientes y locales con POST /api/mocks/generateData");
      error.statusCode = 409;
      throw error;
    }

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
      ? await usersRepository.insertMany([
          ...generateMockUsers(cantClientes, USER_ROLES.CUSTOMER),
          ...generateMockUsers(cantDuenios, USER_ROLES.STORE)
        ])
      : [];

    // si no se pidieron usuarios nuevos uso los que ya estan en la base
    const duenios = usuariosCreados.filter((u) => u.role === USER_ROLES.STORE);
    const clientes = usuariosCreados.filter((u) => u.role === USER_ROLES.CUSTOMER);

    const dueniosDisponibles = duenios.length > 0
      ? duenios
      : await usersRepository.findAll({ role: USER_ROLES.STORE });

    if (cantStores > 0 && dueniosDisponibles.length === 0) {
      const error = new Error("Para crear locales hacen falta usuarios con rol store");
      error.statusCode = 409;
      throw error;
    }

    const localesCreados = cantStores > 0
      ? await storesRepository.insertMany(generateMockStores(cantStores, dueniosDisponibles))
      : [];

      const clientesDisponibles = clientes.length > 0
      ? clientes
      : await usersRepository.findAll({ role: USER_ROLES.CUSTOMER });

    const localesDisponibles = localesCreados.length > 0
      ? localesCreados
      : await storesRepository.findAll();

    if (cantOrders > 0 && (clientesDisponibles.length === 0 || localesDisponibles.length === 0)) {
      const error = new Error("Para crear pedidos hacen falta clientes y locales");
      error.statusCode = 409;
      throw error;
    }

    const pedidosCreados = cantOrders > 0
      ? await ordersRepository.insertMany(
          generateMockOrders(cantOrders, clientesDisponibles, localesDisponibles)
        )
      : [];

    return {
      users: usuariosCreados.length,
      stores: localesCreados.length,
      orders: pedidosCreados.length
    };
  }
};