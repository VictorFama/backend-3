import { Router } from "express";
import { getMockUsers, getMockOrders, generateData } from "../controllers/mocks.controller.js";

const router = Router();

router.get("/mockingusers", getMockUsers);

router.get("/mockingorders", getMockOrders);

router.post("/generateData", generateData);

export default router;