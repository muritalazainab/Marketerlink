// routes/profile.routes.js
import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createOrUpdateProfile,
  getProfile,
  getMyProfile,
  updateAvatar,
  getAllProfiles
} from "../controllers/profile.controller.js";

const router = express.Router();

// Get all public profiles
router.get('/all', getAllProfiles);

// Get current user's profile
router.get('/me', verifyToken, getMyProfile);

// Create or update profile
router.post('/', verifyToken, createOrUpdateProfile);
router.put('/', verifyToken, createOrUpdateProfile);

// Update avatar
router.put('/avatar', verifyToken, updateAvatar);

// Get profile by user ID
router.get('/:userId', getProfile);

export default router;