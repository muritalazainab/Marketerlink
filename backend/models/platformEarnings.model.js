
import mongoose from "mongoose";

const PlatformEarningsSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  marketerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true,
    default: function() {
      return this.totalAmount * 0.05; // 5% fee
    }
  },
  marketerEarning: {
    type: Number,
    required: true,
    default: function() {
      return this.totalAmount * 0.95; // 95% to marketer
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'processed'
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("PlatformEarnings", PlatformEarningsSchema);

