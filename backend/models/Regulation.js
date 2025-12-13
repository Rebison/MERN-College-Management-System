import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
  name: {
    type: String, // e.g., "R2020"
    required: true,
  },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

regulationSchema.index({ name: 1 }, { unique: true });

const Regulation = mongoose.models.Regulation || mongoose.model('Regulation', regulationSchema);

export default Regulation;
