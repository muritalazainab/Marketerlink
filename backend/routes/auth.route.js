import express from "express";
import { register , login, logout,registerAdmin,adminLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.post("/register-admin", registerAdmin);
router.post("/admin-login", adminLogin);




export default router;