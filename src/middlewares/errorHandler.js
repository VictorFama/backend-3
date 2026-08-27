import { AppError, createError } from "../utils/AppError.js";
import { envConfig } from "../config/env.js";

export const errorHandler = (error, req, res, next) => {
  // si el error no lo fabricamos nosotros, es inesperado
  const appError = error instanceof AppError
    ? error
    : createError("INTERNAL_SERVER_ERROR", error.message);

  // si no es prod
  if (!envConfig.isProd) {
    console.error(`[${appError.code}] ${req.method} ${req.originalUrl} -> ${error.message}`);
  }

  const respuesta = {
    status: "error",
    error: appError.code,
    message: appError.message
  };

  if (!envConfig.isProd && appError.details) {
    respuesta.details = appError.details;
  }

  res.status(appError.statusCode).json(respuesta);
};