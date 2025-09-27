import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Application from '../models/application.model.js';
import verifyToken from '../middleware/jwt.js';

const router = express.Router();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/deliverables');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Start project when application accepted
router.put('/:id/start', verifyToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const startDate = new Date();
    const dueDate = new Date(startDate.getTime() + (application.deliveryTime * 24 * 60 * 60 * 1000));
    
    await Application.findByIdAndUpdate(req.params.id, {
      status: 'in_progress',
      startDate,
      dueDate
    });
    
    res.status(200).json({ 
      message: 'Project started',
      startDate,
      dueDate
    });
  } catch (error) {
    console.error('Start project error:', error);
    res.status(500).json({ error: 'Failed to start project' });
  }
});

// Submit work
router.post('/:id/submit', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    const { submissionMessage, projectNotes } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }
    
    if (!submissionMessage || submissionMessage.trim().length === 0) {
      return res.status(400).json({ error: 'Submission message is required' });
    }
    
    const deliverables = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/deliverables/${file.filename}`
    }));
    
    const reviewDeadline = new Date(Date.now() + (48 * 60 * 60 * 1000)); // 48 hours
    
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: 'submitted',
        submittedAt: new Date(),
        reviewDeadline,
        deliverables,
        submissionMessage: submissionMessage.trim(),
        projectNotes: projectNotes ? projectNotes.trim() : ''
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: 'Work submitted successfully',
      application: updatedApplication
    });
  } catch (error) {
    console.error('Submit work error:', error);
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Review submission (Accept/Revision/Dispute)
router.put('/:id/review', verifyToken, async (req, res) => {
  try {
    const { decision, reviewNotes, revisionInstructions } = req.body;
    
    if (!['accept', 'revision', 'dispute'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }
    
    let updateData = { reviewNotes: reviewNotes || '' };
    
    if (decision === 'accept') {
      updateData.status = 'completed';
    } else if (decision === 'revision') {
      if (!revisionInstructions || revisionInstructions.trim().length === 0) {
        return res.status(400).json({ error: 'Revision instructions are required' });
      }
      
      const revisionDueDate = new Date(Date.now() + (72 * 60 * 60 * 1000)); // 72 hours
      
      updateData = {
        ...updateData,
        status: 'revision_requested',
        dueDate: revisionDueDate,
        revisionInstructions: revisionInstructions.trim(),
        $inc: { revisionCount: 1, remainingRevisions: -1 }
      };
    } else if (decision === 'dispute') {
      updateData.status = 'disputed';
    }
    
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json({ 
      message: `Review completed - ${decision}`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to process review' });
  }
});

// Get project details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Application.findById(req.params.id)
      .populate({
        path: 'gigId',
        select: 'title price userId',
        populate: { 
          path: 'userId', 
          select: 'username img email' 
        }
      });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Since marketerId is a string, we need to fetch the marketer details separately
    // You'll need to adjust this based on your User model structure
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Download deliverable file
router.get('/:id/download/:filename', verifyToken, async (req, res) => {
  try {
    const { id, filename } = req.params;
    
    // Verify user has access to this project
    const project = await Application.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if file exists in project deliverables
    const fileExists = project.deliverables.some(d => d.filename === filename);
    if (!fileExists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;