import multer from "multer";
import path from "path";
import fs from "fs";
import { createError } from "../utils/AppError.js";

// una carpeta por campo el documento del usuario y el comprobante del pedido
const CARPETAS = Object.freeze({
  document: "uploads/documents",
  proof: "uploads/proofs"
});

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const TAMANIO_MAXIMO = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const carpeta = CARPETAS[file.fieldname];

    // multer no crea la carpeta destino, y uploads/ esta en el gitignore
    fs.mkdirSync(carpeta, { recursive: true });

    callback(null, carpeta);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    callback(null, nombre);
  }
});

const fileFilter = (req, file, callback) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return callback(null, true);
  }

  callback(createError("INVALID_FILE_TYPE", `Llego "${file.mimetype}". Permitidos: ${TIPOS_PERMITIDOS.join(", ")}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: TAMANIO_MAXIMO
  }
});

// los errores de multer no son AppError, hay que traducirlos al diccionario
const CODIGOS_DE_MULTER = Object.freeze({
  LIMIT_FILE_SIZE: "FILE_TOO_LARGE",
  LIMIT_UNEXPECTED_FILE: "INVALID_FILE_FIELD"
});

export const subirArchivo = (campo) => (req, res, next) => {
  upload.single(campo)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const codigo = CODIGOS_DE_MULTER[error.code] ?? "UPLOAD_ERROR";
      return next(createError(codigo, `${error.code} en el campo "${error.field ?? campo}"`));
    }

    // el del fileFilter ya sale del diccionario
    if (error) {
      return next(error);
    }

    next();
  });
};

