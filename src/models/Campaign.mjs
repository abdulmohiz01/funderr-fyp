import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String },
  dateCreated: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  category: { type: String, required: true },
  imageKey: { type: String },
  rejectionReason: { type: String },
});

export default mongoose.model('Campaign', CampaignSchema);
