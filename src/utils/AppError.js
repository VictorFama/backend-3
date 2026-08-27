import { ERROR_DICTIONARY } from "./errorDictionary.js";


export class AppError extends Error {
  constructor(code, message, statusCode, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // el stack apunta a la linea que lanzo el error, no a este constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

// AppError a partir de una entrada del diccionario
export const createError = (code, details = null) => {
  const definicion = ERROR_DICTIONARY[code];

  // si el codigo no existe el problema es nuestro no del cliente
  if (!definicion) {
    return new AppError(
      "INTERNAL_SERVER_ERROR",
      ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.message,
      500,
      `Codigo de error desconocido: "${code}"`
    );
  }

  return new AppError(code, definicion.message, definicion.statusCode, details);
};