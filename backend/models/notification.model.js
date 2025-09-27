import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // For faster queries
  },
  type: {
    type: String,
    enum: [ 'new_application',
      'application_accepted', 
      'application_rejected',
      'work_submitted',
      'work_approved',
      'revision_requested',
      'work_completion',
      'application_decision_made'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: String, // Could be application ID, message ID, etc.
    required: false
  },
  conversationId: {
    type: String, // For notifications that should lead to a conversation
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Notification", NotificationSchema);
