// las rutas solo conectan el path con la funcion del controller
import { Router } from "express";
import { getUsers, getUserById, createUser, uploadUserDocument } from "../controllers/users.controller.js";
import { subirArchivo } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getUsers);

router.get("/:uid", getUserById);

router.post("/", createUser);

router.post("/:uid/documents", subirArchivo("document"), uploadUserDocument);

export default router;
