
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
 marketerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
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
 // inside your ApplicationSchema
status: {
  type: String,
  enum: [
    'pending',
    'accepted',           // ADDED
    'rejected',           // ADDED
    'in_progress',
    'submitted',
    'under_review',
    'revision_requested',
    'completed',
    'overdue',
    'disputed'
  ],
  default: 'pending'
},

  createdAt: {
    type: Date,
    default: Date.now
  },
    startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  reviewDeadline: {
    type: Date
  },
  deliverables: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  submissionMessage: {
    type: String
  },
  projectNotes: {
    type: String
  },
  reviewNotes: {
    type: String
  },
  revisionInstructions: {
    type: String
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  remainingRevisions: {
    type: Number,
    default: 2
  }

});

export default mongoose.model("Application", ApplicationSchema);