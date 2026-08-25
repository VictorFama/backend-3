import { faker } from "@faker-js/faker";
import { USER_ROLES } from "../constants/userroles.js";

// genero un usuario falso, el rol se puede forzar
export const generateMockUser = (role = USER_ROLES.CUSTOMER) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // el dominio lleva un sufijo al azar porque el email es unique en el modelo
  const dominio = `${faker.string.alphanumeric(6).toLowerCase()}.test.com`;

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName, provider: dominio }).toLowerCase(),
    password: faker.internet.password(),
    role
  };
};

// genero varios usuarios de una
export const generateMockUsers = (qty, role) => {
  return Array.from({ length: qty }, () => generateMockUser(role));
};