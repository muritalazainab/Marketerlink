// Since marketerId is String, you need to manually populate user data
// Replace your application.controller.js with this:

import Application from "../models/application.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
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
    // First get all gigs owned by the current user
    const userGigs = await Gig.find({ userId: req.userId });
    const gigIds = userGigs.map(gig => gig._id);

    // Then get all applications for those gigs
    const applications = await Application.find({
      gigId: { $in: gigIds }
    })
    .populate('gigId', 'title shortDesc price')
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

// Accept an application
export const acceptApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id).populate('gigId');
    if (!application) {
      return next(createError(404, "Application not found"));
    }

    // Verify the gig belongs to the current user
    if (application.gigId.userId !== req.userId) {
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

// Reject an application
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