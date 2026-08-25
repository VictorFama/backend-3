import mongoose from "mongoose";
import { envConfig } from "./env.js";

const connectDB = async () => {
  await mongoose.connect(envConfig.mongoUri);
  console.log("MongoDB conectado");
};

export default connectDB;
