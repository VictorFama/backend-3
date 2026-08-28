import logger from "../config/logger.js";

// genera una linea por cada HTTP: metodo url status y tiempo de respuesta
export const httpLogger = (req, res, next) => {
  const inicio = Date.now();

  //esperamos a que la respuesta termine para saber el status
  res.on("finish", () => {
    logger.http(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio}ms)`);
  });

  next();
};