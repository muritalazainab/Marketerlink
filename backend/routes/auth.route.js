import express from "express";
import { register , login, logout} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});
export default router;