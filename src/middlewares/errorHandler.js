import { AppError, createError } from "../utils/AppError.js";
import { envConfig } from "../config/env.js";
import logger from "../config/logger.js";

export const errorHandler = (error, req, res, next) => {
  // si el error no lo fabricamos nosotros, es inesperado
  const appError = error instanceof AppError
    ? error
    : createError("INTERNAL_SERVER_ERROR", error.message);

  // un 4xx es culpa del cliente entonces es warning, un 5xx es error mio entonces es error
  const nivel = appError.statusCode >= 500 ? "error" : "warning";

  logger[nivel](`${appError.code} - ${req.method} ${req.originalUrl} -> ${error.message}`);

  if (appError.statusCode >= 500) {
    logger.debug(error.stack ?? "(sin stack)");
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