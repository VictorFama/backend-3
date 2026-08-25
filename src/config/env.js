import dotenv from "dotenv";

dotenv.config();

// variables sin las que la app no puede funcionar
const REQUERIDAS = ["PORT", "MONGODB_URI", "NODE_ENV"];

const faltantes = REQUERIDAS.filter((nombre) => !process.env[nombre]);

// si falta alguna cortamos aca, en el arranque, y no en el primer request
if (faltantes.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${faltantes.join(", ")}. ` +
    "Copia .env.example a .env y completa los valores antes de arrancar."
  );
}

const ENTORNOS_VALIDOS = ["development", "production", "test"];

if (!ENTORNOS_VALIDOS.includes(process.env.NODE_ENV)) {
  throw new Error(
    `NODE_ENV tiene un valor invalido: "${process.env.NODE_ENV}". ` +
    `Los permitidos son: ${ENTORNOS_VALIDOS.join(", ")}.`
  );
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT tiene que ser un numero entero positivo, llego: "${process.env.PORT}".`);
}

// el resto del proyecto importa esto, nunca process.env
export const envConfig = {
  port,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === "production"
};
