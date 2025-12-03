import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  maintenance: { type: Boolean, default: false }, // for manual toggle
  message: { type: String, default: '' },
  startTime: { type: Date, default: null },  // Scheduled start
  endTime: { type: Date, default: null }     // Scheduled end
}, { timestamps: true });

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default Setting;