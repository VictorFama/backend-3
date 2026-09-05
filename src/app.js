//config
import { envConfig } from "./config/env.js";

import express from "express";
import cors from "cors";

//routes
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/mocks.router.js";


//middlewares
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";

//logger
import { httpLogger } from "./middlewares/httpLogger.js";
import loggerRouter from "./routes/logger.router.js";

//swagger
import swaggerUI from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger.config.js";
const app = express();

app.use(httpLogger);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API"
  });
});

// lo miran docker y los servicios de deploy para saber si la API esta activa
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando",
    environment: envConfig.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);


// mocks y loggerTest son herramientas en produccion no se activan
if (!envConfig.isProd) {
  app.use("/api/mocks", mocksRouter);

  app.use(loggerRouter);
  app.use("/api", loggerRouter);
}

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpecs));

// si ninguna ruta matcheo cae aca
app.use(notFoundHandler);

app.use(errorHandler);

export default app;
