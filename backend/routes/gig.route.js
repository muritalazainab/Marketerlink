import express from "express";
import {
  createGig,
  deleteGig,
  getGig,
  getGigs,
  fundGig,
  getMyGigs
} from "../controllers/gig.controller.js";
import  verifyToken from "../middleware/jwt.js";
import Gig from "../models/gig.model.js";

const router = express.Router();
// router.put("/:id/complete", verifyToken, completeProject);

// Debug routes (temporary)
router.get("/debug/me", verifyToken, (req, res) => {
  res.json({
    currentUserId: req.userId,
    isSeller: req.isSeller,
    tokenExists: !!req.cookies.accessToken
  });
});

router.get("/debug/gig/:id", (req, res) => {
  Gig.findById(req.params.id)
    .then(gig => {
      if (!gig) return res.status(404).json("Gig not found");
      res.json({
        gigId: gig._id,
        gigOwner: gig.userId,
        gigStatus: gig.status,
        isFunded: gig.isFunded,
        paymentIntentId: gig.paymentIntentId
      });
    })
    .catch(err => res.status(500).json(err));
});


router.post("/", verifyToken, createGig);
router.put("/:id/fund", verifyToken, fundGig);
router.delete("/:id", verifyToken, deleteGig);
router.get("/single/:id", getGig);
router.get("/my", verifyToken, getMyGigs);
router.get("/", getGigs);

export default router;