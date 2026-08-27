import { createError } from "../utils/AppError.js";

// se ejecuta solo si ninguna ruta anterior matcheo
export const notFoundHandler = (req, res, next) => {
  next(createError("ROUTE_NOT_FOUND", `${req.method} ${req.originalUrl}`));
};