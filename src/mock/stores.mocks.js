import { faker } from "@faker-js/faker";

// genero un local falso para un dueño que ya existe
export const generateMockStore = (ownerId) => {
  return {
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    owner: ownerId
  };
};

// genero varios locales repartiendo los dueños al azar
export const generateMockStores = (qty, owners) => {
  return Array.from({ length: qty }, () => {
    const owner = owners[Math.floor(Math.random() * owners.length)];
    return generateMockStore(owner._id);
  });
};