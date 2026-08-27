// unica capa que toca req y res, no sabe nada de la base
import { usersService } from "../services/users.service.js";

// GET /api/users - lista los usuarios, acepta ?role=
export const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getUsers({ role: req.query.role });
    res.json({ status: "success", payload: users });
  } catch (error) {
    // no armo la respuesta se la pasa al middleware
    next(error);
  }
};

// GET /api/users/:uid - devuelve un usuario
export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.uid);
    res.json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users - crea un usuario
export const createUser = async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json({ status: "success", payload: user });
  } catch (error) {
    next(error);
  }
};
