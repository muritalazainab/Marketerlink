// models/profile.model.js
import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  // Basic Info
  fullName: {
    type: String,
    required: true
  },
  title: {
    type: String, // e.g., "Digital Marketing Specialist"
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String
  },
  avatar: {
    type: String,
    default: ""
  },
  
  // Professional Info
  skills: [{
    type: String
  }],
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'entry'
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  
  // Portfolio
  portfolio: [{
    title: String,
    description: String,
    image: String,
    link: String
  }],
  
  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String,
    github: String
  },
  
  // Stats (calculated fields)
  completedProjects: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: String, // e.g., "within 2 hours"
    default: "within 24 hours"
  },
  
  // Profile Status
  isComplete: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Profile", ProfileSchema);