import { Router } from "express";
import { loggerTest } from "../controllers/logger.controller.js";

const router = Router();

router.get("/loggerTest", loggerTest);

export default router;