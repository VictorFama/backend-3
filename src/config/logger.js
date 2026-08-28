import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { envConfig } from "./env.js";

// menor numero mayor gravedad
const NIVELES = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5
};


const linea = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]`.padEnd(31) + message;
});

const formatoBase = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  linea
);

const consola = new winston.transports.Console();


const archivoDeErrores = new DailyRotateFile({
  level: "error",                       // guardo fatal y error
  filename: "logs/errors-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d"                       // dura 14 dias y se borra
});

const logger = winston.createLogger({
  levels: NIVELES,
  level: envConfig.logLevel,
  format: formatoBase,
  transports: [consola, archivoDeErrores]
});

export default logger;