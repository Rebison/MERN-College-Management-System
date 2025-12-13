import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  purpose: { type: String, required: true },  // e.g., 'password_reset'

  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },

  otpAttempts: { type: Number, default: 0 },        // Failed attempts counter
  otpRequestsToday: { type: Number, default: 0 },   // How many times OTP was requested today
  otpLockedAt: { type: Date, default: null },       // Time when locked due to attempts/request
  otpLastAttemptAt: { type: Date, default: null },  // Last time an attempt was made

  // ✅ TTL field for automatic cleanup after 3 days
  expireAt: { type: Date }
}, { timestamps: true });

// Indexing for userId and userType (helps with faster lookup)
otpVerificationSchema.index({ userId: 1, userType: 1, purpose: 1 });

// TTL index
otpVerificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// ✅ Pre-save middleware to dynamically set expireAt
otpVerificationSchema.pre('save', function (next) {
  const threeDaysLater = new Date(+new Date() + 3 * 24 * 60 * 60 * 1000);
  this.expireAt = this.otpExpiresAt && this.otpExpiresAt < threeDaysLater
    ? this.otpExpiresAt
    : threeDaysLater;
  next();
});

// ✅ Pre-update middleware for findOneAndUpdate, updateOne, etc.
otpVerificationSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update.otpExpiresAt) {
    const threeDaysLater = new Date(+new Date() + 3 * 24 * 60 * 60 * 1000);
    update.expireAt = update.otpExpiresAt < threeDaysLater ? update.otpExpiresAt : threeDaysLater;
    this.setUpdate(update);
  }
  next();
});

const OtpVerification =
  mongoose.models.OtpVerification ||
  mongoose.model('OtpVerification', otpVerificationSchema);

export default OtpVerification;