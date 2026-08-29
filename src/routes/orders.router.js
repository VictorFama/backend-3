import { Router } from "express";
import { getOrders, getOrderById, createOrder, updateOrderStatus, uploadOrderProof } from "../controllers/orders.controller.js";
import { subirArchivo } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getOrders);

router.get("/:oid", getOrderById);

router.post("/", createOrder);

router.put("/:oid/status", updateOrderStatus);

router.post("/:oid/proof", subirArchivo("proof"), uploadOrderProof);

export default router;
