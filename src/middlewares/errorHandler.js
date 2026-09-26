import { AppError, createError } from "../utils/AppError.js";
import { envConfig } from "../config/env.js";
import logger from "../config/logger.js";

export const errorHandler = (error, req, res, next) => {
  // un id de mongo mal formado lo tira mongoose, y es culpa del cliente, no del servidor
  const traducido = error.name === "CastError"
    ? createError("VALIDATION_ERROR", `El id "${error.value}" no es valido`)
    : error;

  // si el error no lo fabricamos nosotros, es inesperado
  const appError = traducido instanceof AppError
    ? traducido
    : createError("INTERNAL_SERVER_ERROR", traducido.message);

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