import express from "express";
import  verifyToken  from "../middleware/jwt.js";
import { 
  createApplication, 
  getApplications, 
  getApplicationById,
  getApplicationsForSeller,
  acceptApplication,      
  rejectApplication,       
  getApplicationsForGig      
} from "../controllers/application.controller.js";
import { updateApplicationStatus } from "../controllers/application.controller.js";

const router = express.Router();
router.put('/:id/status', verifyToken, updateApplicationStatus);


router.post('/', verifyToken, createApplication);

router.get('/', verifyToken, getApplications);

router.get('/seller', verifyToken, getApplicationsForSeller);

router.get('/gig/:gigId', verifyToken, getApplicationsForGig);

router.put('/:id/accept', verifyToken, acceptApplication);

router.put('/:id/reject', verifyToken, rejectApplication);

router.get('/:id', verifyToken, getApplicationById);

export default router;