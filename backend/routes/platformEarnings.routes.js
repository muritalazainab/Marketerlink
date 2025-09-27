import express from "express";
import  verifyToken  from "../middleware/jwt.js";
import { getPlatformEarnings } from "../controllers/platformEarnings.controller.js";

const router = express.Router();

// Platform earnings (admin only - you can add admin middleware)
router.get('/', verifyToken, getPlatformEarnings);

export default router;