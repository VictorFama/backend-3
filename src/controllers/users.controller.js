// unica capa que toca req y res, no sabe nada de la base
import { usersService } from "../services/users.service.js";

// GET /api/users - lista los usuarios, acepta ?role=
export const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers({ role: req.query.role });
    res.json({ status: "success", payload: users });
  } catch (error) {
    // el status lo decide el service, si no lo puso es un error inesperado
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// GET /api/users/:uid - devuelve un usuario
export const getUserById = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};

// POST /api/users - crea un usuario
export const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: "error", message: error.message });
  }
};
