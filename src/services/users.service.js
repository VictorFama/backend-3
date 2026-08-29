// reglas de negocio de usuarios, no conoce express ni mongoose
import { usersRepository } from "../repositories/users.repository.js";
import { USER_ROLE_VALUES } from "../constants/userroles.js";
import { DOCUMENT_TYPE_VALUES } from "../constants/documentTypes.js";

import { createError } from "../utils/AppError.js";

import logger from "../config/logger.js";

const CAMPOS_OBLIGATORIOS = ["firstName", "lastName", "email", "password"];

export const usersService = {
  // devuelve los usuarios, valida el rol antes de ir a la base
  getUsers: async ({ role } = {}) => {
    if (role && !USER_ROLE_VALUES.includes(role)) {
      throw createError("INVALID_USER_ROLE", `Llego "${role}". Validos: ${USER_ROLE_VALUES.join(", ")}`);
    }
    return usersRepository.findAll({ role });
  },

  // devuelve un usuario o corta con USER_NOT_FOUND
  getUserById: async (id) => {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw createError("USER_NOT_FOUND", `No hay ningun usuario con id ${id}`);
    }

    return user;
  },

  // crea un usuario validando datos obligatorios, rol y email repetido
  createUser: async (userData) => {
    const { email, role } = userData;

    const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => !userData[campo]);
    if (faltantes.length > 0) {
      throw createError("VALIDATION_ERROR", `Faltan campos obligatorios: ${faltantes.join(", ")}`);
    }

    if (role && !USER_ROLE_VALUES.includes(role)) {
      throw createError("INVALID_USER_ROLE", `Llego "${role}". Validos: ${USER_ROLE_VALUES.join(", ")}`);
    }

    // email es unico no se puede repetir
    if (await usersRepository.existsByEmail(email)) {
      throw createError("USER_ALREADY_EXISTS", `El email ${email} ya esta registrado`);
    }

    return usersRepository.create(userData);
  },

  // guarda los metadatos del archivo dentro del usuario
  addDocument: async (id, file, type) => {
    if (!file) {
      throw createError("FILE_REQUIRED", "No llego ningun archivo en el campo document");
    }

    if (!DOCUMENT_TYPE_VALUES.includes(type)) {
      throw createError("INVALID_DOCUMENT_TYPE", `Llego "${type}". Validos: ${DOCUMENT_TYPE_VALUES.join(", ")}`);
    }

    const user = await usersRepository.findById(id);
    if (!user) {
      throw createError("USER_NOT_FOUND", `No hay ningun usuario con id ${id}`);
    }

    // en la base van los metadatos, el archivo se queda en uploads/
    const document = {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      type,
      uploadedAt: new Date()
    };

    const actualizado = await usersRepository.update(id, { documents: [...user.documents, document] });

    logger.info(`Documento "${document.originalName}" (${type}, ${document.size} bytes) cargado para el usuario ${id}`);

    return actualizado;
  }
};
