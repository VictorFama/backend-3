import logger from "../config/logger.js";

// GET /loggerTest pruebo los distintos niveles
export const loggerTest = (req, res) => {
  logger.debug("debug - informacion detallada para pruebas");
  logger.http("http - registro de una solicitud HTTP");
  logger.info("info - informacion general del sistema");
  logger.warning("warning - algo merece atencion");
  logger.error("error - una operacion fallo");
  logger.fatal("fatal - error critico del sistema");

  res.json({
    status: "success",
    message: "Logs generados correctamente"
  });
};