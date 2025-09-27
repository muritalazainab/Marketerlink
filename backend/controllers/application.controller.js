import Application from "../models/application.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js"; // Add this import
import Notification from "../models/notification.model.js"; // Add this import (you'll need to create this model)
import createError from "../utils/createError.js";

export const createApplication = async (req, res, next) => {
  try {
    const { gigId, proposal, bidAmount, deliveryTime } = req.body;

    // Verify the gig exists and get gig details
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return next(createError(404, "Gig not found"));
    }

    // Prevent sellers from applying to their own gigs
    if (gig.userId === req.userId) {
      return next(createError(403, "You cannot apply to your own gig"));
    }

    // Check if user has already applied to this gig
    const existingApplication = await Application.findOne({
      gigId,
      marketerId: req.userId
    });

    if (existingApplication) {
      return next(createError(400, "You have already applied to this gig"));
    }

    const newApplication = new Application({
      gigId,
      marketerId: req.userId,
      proposal,
      bidAmount,
      deliveryTime,
      status: 'pending',
      createdAt: new Date()
    });
    
    await newApplication.save();
    
    // ADDED: Create notification for gig owner (seller)
    try {
      const notification = new Notification({
        userId: gig.userId, // The gig owner
        type: 'new_application',
        title: 'New Application Received!',
        message: `You received a new application for "${gig.title}" with a bid of $${bidAmount}.`,
        relatedId: newApplication._id,
        isRead: false
      });
      await notification.save();
    } catch (notifError) {
      console.log("Failed to create notification:", notifError);
      // Don't fail the whole request if notification fails
    }
    
    // Manually populate since marketerId is String
    const populatedApplication = await Application.findById(newApplication._id).populate('gigId');
    const marketerUser = await User.findById(req.userId);
    
    const responseData = {
      ...populatedApplication.toObject(),
      marketerId: marketerUser
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ marketerId: req.userId })
      .populate('gigId')
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('gigId');
    
    if (!application) {
      return next(createError(404, "Application not found!"));
    }
    
    // Manually populate marketer
    const marketerUser = await User.findById(application.marketerId);
    const responseData = {
      ...application.toObject(),
      marketerId: marketerUser
    };
    
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Get applications for all of seller's gigs
export const getApplicationsForSeller = async (req, res, next) => {
  try {
    const applications = await Application.find({})
      .populate({
        path: 'gigId',
        match: { userId: req.userId }, 
      })
      .populate({
        path: 'marketerId', 
        select: 'username email country createdAt profilePicture' 
      })
    
    // Filter out applications where gig doesn't belong to this seller
    const sellerApplications = applications.filter(app => app.gigId !== null)
    
    res.status(200).json(sellerApplications)
  } catch (err) {
    next(err)
  }
}

// Get applications for a specific gig (seller only)
export const getApplicationsForGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    // Verify the gig belongs to the current user
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return next(createError(404, "Gig not found"));
    }
    
    if (gig.userId !== req.userId) {
      return next(createError(403, "You can only view applications for your own gigs"));
    }

    const applications = await Application.find({ gigId })
      .sort({ createdAt: -1 });

    // Manually populate marketer data
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        const marketerUser = await User.findById(app.marketerId);
        return {
          ...app.toObject(),
          marketerId: marketerUser
        };
      })
    );

    res.status(200).json(populatedApplications);
  } catch (err) {
    next(err);
  }
};

// UPDATED: Accept an application - NOW CREATES CONVERSATION
export const acceptApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the gig belongs to the current user (compare strings)
    const gigOwnerId = application.gigId && application.gigId.userId
      ? application.gigId.userId.toString()
      : null;

    if (!gigOwnerId || gigOwnerId !== req.userId) {
      return next(createError(403, "You can only accept applications for your own gigs"));
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return next(createError(400, "Application has already been processed"));
    }

    // Update application status
    application.status = 'accepted';
    await application.save();

    // Reject all other pending applications for this gig
    await Application.updateMany(
      { 
        gigId: application.gigId._id, 
        _id: { $ne: id },
        status: 'pending' 
      },
      { status: 'rejected' }
    );

    // Create conversation between seller and marketer (if not exists)
    const conversationId = req.userId + application.marketerId.toString();

    try {
      let conversation = await Conversation.findOne({ id: conversationId });

      if (!conversation) {
        conversation = new Conversation({
          id: conversationId,
          sellerId: req.userId,
          buyerId: application.marketerId,
          readBySeller: true,
          readByBuyer: false,
          lastMessage: `Your application for "${application.gigId.title}" has been accepted! Let's discuss the project details.`
        });
        await conversation.save();
      }

      // Create notifications
      const marketerNotification = new Notification({
        userId: application.marketerId,
        type: 'application_accepted',
        title: 'Application Accepted!',
        message: `Your application for "${application.gigId.title}" has been accepted. You can now chat with the client.`,
        relatedId: application._id,
        conversationId: conversationId,
        isRead: false
      });
      await marketerNotification.save();

      const sellerNotification = new Notification({
        userId: req.userId,
        type: 'application_decision_made',
        title: 'Application Accepted',
        message: `You accepted an application for "${application.gigId.title}". You can now start chatting with the marketer.`,
        relatedId: application._id,
        conversationId: conversationId,
        isRead: true
      });
      await sellerNotification.save();

    } catch (convError) {
      console.log("Failed to create conversation or notifications:", convError);
      // continue — do not fail the whole request
    }

    // Prepare response: populate marketer user so frontend has user data
    const updatedApplication = await Application.findById(id).populate('gigId');
    const marketerUser = await User.findById(updatedApplication.marketerId);

    const responseData = {
      ...updatedApplication.toObject(),
      marketerId: marketerUser,
      conversationId: conversationId
    };

    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};


// UPDATED: Reject an application - NOW CREATES NOTIFICATION
export const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the gig belongs to the current user
    if (application.gigId.userId !== req.userId) {
      return next(createError(403, "You can only reject applications for your own gigs"));
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return next(createError(400, "Application has already been processed"));
    }

    // Update application status
    application.status = 'rejected';
    await application.save();

    // ADDED: Create notification for marketer
    try {
      const notification = new Notification({
        userId: application.marketerId,
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application for "${application.gigId.title}" was not selected this time. Keep applying to other projects!`,
        relatedId: application._id,
        isRead: false
      });
      await notification.save();
    } catch (notifError) {
      console.log("Failed to create notification:", notifError);
      // Don't fail the whole request if notification fails
    }

    // Manually populate response
    const updatedApplication = await Application.findById(id).populate('gigId');
    const marketerUser = await User.findById(updatedApplication.marketerId);
    
    const responseData = {
      ...updatedApplication.toObject(),
      marketerId: marketerUser
    };

    res.status(200).json(responseData);
  } catch (err) {
    next(err);
  }
};
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Update status and add timestamp
    application.status = status;
    if (status === 'in_progress') {
      application.startDate = new Date();
    }
    if (notes) {
      application.projectNotes = notes;
    }

    await application.save();
    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};