import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.test" });

if (process.env.NODE_ENV !== "test") {
  throw new Error("Los tests solo corren con NODE_ENV=test. Falta el archivo .env.test.");
}

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // los test pueden borrar datos, asi q si no esta conectado a la base de test corto
  if (!mongoose.connection.name.includes("test")) {
    const base = mongoose.connection.name;
    await mongoose.connection.close();
    throw new Error(`Conectado a la base "${base}", que no es de testing. Revisa MONGODB_URI en .env.test.`);
  }
});

after(async () => {
  await mongoose.connection.close();
});