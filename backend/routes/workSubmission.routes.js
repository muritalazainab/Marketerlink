import express from "express";
import verifyToken  from "../middleware/jwt.js";
import {
  submitWork,
  getSubmissionsForReview,
  approveWork,
  requestRevision,
  getMarketerProjects
} from "../controllers/workSubmission.controller.js";

const router = express.Router();

// Marketer routes
router.post('/submit', verifyToken, submitWork);
router.get('/my-projects', verifyToken, getMarketerProjects);

// Seller routes
router.get('/for-review', verifyToken, getSubmissionsForReview);
router.put('/:id/approve', verifyToken, approveWork);
router.put('/:id/request-revision', verifyToken, requestRevision);

export default router;
