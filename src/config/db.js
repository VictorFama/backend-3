import mongoose from "mongoose";
import { envConfig } from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  logger.debug("Conectando a Mongo");
  await mongoose.connect(envConfig.mongoUri);
  logger.info(`Conexion a Mongo establecida (${mongoose.connection.name})`);
};

export default connectDB;
