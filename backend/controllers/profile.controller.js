// controllers/profile.controller.js
import Profile from "../models/profile.model.js";
import createError from "../utils/createError.js";

// Create or Update Profile
export const createOrUpdateProfile = async (req, res, next) => {
   console.log('Received data:', req.body);
    console.log('User ID:', req.userId);
    
  try {
    const {
      fullName, title, bio, location, skills, experience, 
      hourlyRate, availability, portfolio, socialLinks
    } = req.body;

    // Check if profile already exists
    let profile = await Profile.findOne({ userId: req.userId });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.userId },
        {
          fullName, title, bio, location, skills, experience,
          hourlyRate, availability, portfolio, socialLinks,
          isComplete: true // Mark as complete when updated
        },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new Profile({
        userId: req.userId,
        fullName, title, bio, location, skills, experience,
        hourlyRate, availability, portfolio, socialLinks,
        isComplete: true
      });
      await profile.save();
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// Get Profile by User ID
export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return next(createError(404, "Profile not found"));
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// Get Current User's Profile
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
      // Return a default profile structure if none exists
      return res.status(200).json({
        userId: req.userId,
        isComplete: false,
        fullName: "",
        title: "",
        bio: "",
        skills: [],
        portfolio: [],
        socialLinks: {}
      });
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// Upload Profile Avatar
export const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { avatar },
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

// Get All Public Profiles (for browsing)
export const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find({ 
      isPublic: true, 
      isComplete: true 
    }).select('-userId'); // Don't expose internal user IDs

    res.status(200).json(profiles);
  } catch (err) {
    next(err);
  }
};