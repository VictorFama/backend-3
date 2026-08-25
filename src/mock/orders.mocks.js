import { faker } from "@faker-js/faker";
import { ORDER_STATUS } from "../constants/orderstatus.js";
import { ORDER_PRIORITY_VALUES } from "../constants/priority.js";

// genero un pedido falso para un cliente y un local que ya existen
export const generateMockOrder = (customerId, storeId) => {
  const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 5 }),
    price: faker.number.int({ min: 1000, max: 10000 })
  }));

  // el total sale de los items, igual que en el service real
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    customer: customerId,
    store: storeId,
    items,
    deliveryAddress: faker.location.streetAddress(),
    total,
    status: ORDER_STATUS.CREATED,
    priority: faker.helpers.arrayElement(ORDER_PRIORITY_VALUES)
  };
};

// genero varios pedidos repartiendo clientes y locales al azar
export const generateMockOrders = (qty, customers, stores) => {
  return Array.from({ length: qty }, () => {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    return generateMockOrder(customer._id, store._id);
  });
};