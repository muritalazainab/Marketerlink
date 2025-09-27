import express from "express";
import  verifyToken  from "../middleware/jwt.js";
import Conversation from "../models/conversation.model.js"; 


import {
  createConversation,
  getConversations,
  getSingleConversation,
  updateConversation,
  getConversationsWithUsers,
} from "../controllers/conversation.controller.js";


const router = express.Router();

router.get("/", verifyToken, getConversations);
router.post("/", verifyToken, createConversation);
router.get("/single/:id", verifyToken, getSingleConversation);
router.put("/:id", verifyToken, updateConversation);
router.get("/with-users", verifyToken, getConversationsWithUsers);
router.get("/unread-count", verifyToken, async (req, res, next) => {
  try {
    const userId = req.userId; // set by verifyToken
    const isSeller = req.isSeller;

    let unreadConversationsCount = 0;

    if (isSeller) {
      unreadConversationsCount = await Conversation.countDocuments({
        sellerId: userId,
        readBySeller: false,
      });
    } else {
      unreadConversationsCount = await Conversation.countDocuments({
        buyerId: userId,
        readByBuyer: false,
      });
    }

    res.status(200).send({ count: unreadConversationsCount });
  } catch (err) {
    next(err);
  }
});
export default router;