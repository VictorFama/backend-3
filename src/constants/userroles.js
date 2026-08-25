// Object.freeze deja el objeto de solo lectura, nadie lo puede pisar en runtime
export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  CUSTOMER: "customer",
  STORE: "store"
});

export const USER_ROLE_VALUES = Object.values(USER_ROLES);
