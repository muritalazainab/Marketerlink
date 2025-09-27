
// controllers/workSubmission.controller.js
import Application from "../models/application.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
import PlatformEarnings from "../models/platformEarnings.model.js";
import Notification from "../models/notification.model.js";
import createError from "../utils/createError.js";
import upload from "../utils/upload.js";

// Submit work by marketer
export const submitWork = async (req, res, next) => {
  try {
    const { applicationId, submissionMessage, deliverables } = req.body;

    const application = await Application.findById(applicationId).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the marketer owns this application
    if (application.marketerId.toString() !== req.userId) {
      return next(createError(403, "You can only submit work for your own applications"));
    }

    // Check if application is accepted
    if (application.status !== 'accepted') {
      return next(createError(400, "You can only submit work for accepted applications"));
    }

    // Update application with submission
    application.status = 'submitted';
    application.submittedAt = new Date();
    application.submissionMessage = submissionMessage;
    application.deliverables = deliverables || [];
    
    await application.save();

    // Create notification for seller
    try {
      const notification = new Notification({
        userId: application.gigId.userId,
        type: 'work_submitted',
        title: 'Work Submitted for Review',
        message: `${req.user?.username || 'A marketer'} has submitted work for "${application.gigId.title}". Please review and approve.`,
        relatedId: application._id,
        isRead: false
      });
      await notification.save();
    } catch (notifError) {
      console.log("Failed to create notification:", notifError);
    }

    res.status(200).json({
      message: "Work submitted successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

// Get work submissions for review (seller)
export const getSubmissionsForReview = async (req, res, next) => {
  try {
    const applications = await Application.find({
      status: { $in: ['submitted', 'under_review'] }
    })
    .populate({
      path: 'gigId',
      match: { userId: req.userId }
    })
    .populate('marketerId', 'username email img')
    .sort({ submittedAt: -1 });

    // Filter out applications where gig doesn't belong to this seller
    const sellerSubmissions = applications.filter(app => app.gigId !== null);

    res.status(200).json(sellerSubmissions);
  } catch (error) {
    next(error);
  }
};

// Approve work and release escrow
export const approveWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const application = await Application.findById(id).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the gig belongs to the current user
    if (application.gigId.userId !== req.userId) {
      return next(createError(403, "You can only approve work for your own gigs"));
    }

    // Check if work is submitted
    if (application.status !== 'submitted' && application.status !== 'under_review') {
      return next(createError(400, "Work must be submitted before approval"));
    }

    // Update application status
    application.status = 'completed';
    application.reviewNotes = reviewNotes || '';
    await application.save();

    // Create platform earnings record
    try {
      const platformEarnings = new PlatformEarnings({
        transactionId: `txn_${application._id}_${Date.now()}`,
        applicationId: application._id,
        gigId: application.gigId._id,
        marketerId: application.marketerId,
        sellerId: req.userId,
        totalAmount: application.bidAmount,
        platformFee: application.bidAmount * 0.05,
        marketerEarning: application.bidAmount * 0.95
      });
      
      await platformEarnings.save();
    } catch (earningsError) {
      console.log("Failed to create earnings record:", earningsError);
    }

    // Create notifications
    try {
      const marketerNotification = new Notification({
        userId: application.marketerId,
        type: 'work_approved',
        title: 'Work Approved!',
        message: `Your work for "${application.gigId.title}" has been approved. Congratulations!`,
        relatedId: application._id,
        isRead: false
      });
      await marketerNotification.save();

      const sellerNotification = new Notification({
        userId: req.userId,
        type: 'work_completion',
        title: 'Project Completed',
        message: `Work for "${application.gigId.title}" has been completed and approved.`,
        relatedId: application._id,
        isRead: true
      });
      await sellerNotification.save();
    } catch (notifError) {
      console.log("Failed to create notifications:", notifError);
    }

    res.status(200).json({
      message: "Work approved and payment released",
      application
    });
  } catch (error) {
    next(error);
  }
};

// Request revision
export const requestRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { revisionInstructions } = req.body;

    const application = await Application.findById(id).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the gig belongs to the current user
    if (application.gigId.userId !== req.userId) {
      return next(createError(403, "You can only request revisions for your own gigs"));
    }

    // Check revision limit
    if (application.revisionCount >= application.remainingRevisions) {
      return next(createError(400, "Revision limit exceeded"));
    }

    // Update application
    application.status = 'revision_requested';
    application.revisionInstructions = revisionInstructions;
    application.revisionCount += 1;
    application.remainingRevisions -= 1;
    
    await application.save();

    // Create notification for marketer
    try {
      const notification = new Notification({
        userId: application.marketerId,
        type: 'revision_requested',
        title: 'Revision Requested',
        message: `Revision has been requested for "${application.gigId.title}". Please check the feedback and resubmit.`,
        relatedId: application._id,
        isRead: false
      });
      await notification.save();
    } catch (notifError) {
      console.log("Failed to create notification:", notifError);
    }

    res.status(200).json({
      message: "Revision requested",
      application
    });
  } catch (error) {
    next(error);
  }
};

// Get marketer's active projects
export const getMarketerProjects = async (req, res, next) => {
  try {
    const applications = await Application.find({
      marketerId: req.userId,
      status: { $in: ['accepted', 'in_progress', 'submitted', 'under_review', 'revision_requested'] }
    })
    .populate('gigId')
    .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

