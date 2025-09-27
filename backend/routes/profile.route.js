// routes/profiles.js
import express from "express";
import verifyToken  from "../middleware/jwt.js";
import {
  createOrUpdateProfile,
  getProfile,
  getMyProfile,
  updateAvatar,
  getAllProfiles
} from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/", verifyToken, createOrUpdateProfile);

router.get("/me", verifyToken, getMyProfile);

router.get("/user/:userId", verifyToken, getProfile);

router.patch("/avatar", verifyToken, updateAvatar);

router.get("/", getAllProfiles);

export default router;