import { Router } from "express";
import { getStores, getStoreById, createStore } from "../controllers/stores.controller.js";

const router = Router();

router.get("/", getStores);

router.get("/:sid", getStoreById);

router.post("/", createStore);

export default router;
