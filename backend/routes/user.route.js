import express from "express";
import { deleteUser, getUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();


router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", getUser);
// Get user basic info by ID (for profile fallback)
router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});
export default router;