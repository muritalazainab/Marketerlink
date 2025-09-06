// Replace your application.model.js with this:

import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  marketerId: {
    type: String, // Changed to String to match your Gig model's userId field
    required: true,
  },
  proposal: {
    type: String,
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Application", ApplicationSchema);