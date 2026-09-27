import { Router } from "express";
import { getOrders, getOrderById, createOrder, updateOrderStatus, uploadOrderProof, cancelOrder } from "../controllers/orders.controller.js";
import { subirArchivo } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getOrders);

router.get("/:oid", getOrderById);

router.post("/", createOrder);

router.put("/:oid/status", updateOrderStatus);

router.delete("/:oid", cancelOrder);

router.post("/:oid/proof", subirArchivo("proof"), uploadOrderProof);

export default router;
