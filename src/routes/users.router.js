// las rutas solo conectan el path con la funcion del controller
import { Router } from "express";
import { getUsers, getUserById, createUser } from "../controllers/users.controller.js";

const router = Router();

router.get("/", getUsers);

router.get("/:uid", getUserById);

router.post("/", createUser);

export default router;
