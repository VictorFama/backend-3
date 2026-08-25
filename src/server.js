import app from "./app.js";
import connectDB from "./config/db.js";
import { envConfig } from "./config/env.js";

const PORT = envConfig.port;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    // si no hay base de datos no tiene sentido seguir levantando la app
    console.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
