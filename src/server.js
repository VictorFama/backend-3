import app from "./app.js";
import connectDB from "./config/db.js";
import { envConfig } from "./config/env.js";

import logger from "./config/logger.js";

const PORT = envConfig.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${PORT} (entorno ${envConfig.nodeEnv})`);
    });
  } catch (error) {
    // si no hay base de datos no tiene sentido seguir levantando la app
    logger.fatal(`No se pudo iniciar el servidor: ${error.message}`);

    // 1 segundo para que winston termine de escribir el archivo antes de morir
    setTimeout(() => process.exit(1), 1000);
  }
};

startServer();
