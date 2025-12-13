import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  channel: { type: String, enum: ["email", "socket", "push"], required: true },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  attempts: { type: Number, default: 0 },
  lastError: String,
  lastTriedAt: Date,
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

  message: { type: String, required: true }, // quick UI rendering
  read: { type: Boolean, default: false },

  deliveries: [deliverySchema],

  payload: {
    email: { to: String, template: String, data: Object },
    socket: { event: String, data: Object },
    push: { deviceToken: String, template: String, data: Object },
  },

  createdAt: { type: Date, default: Date.now },

  // ✅ TTL field
  expireAt: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }, // expires after 30 days
}, { timestamps: true });

// ✅ TTL index (MongoDB will automatically delete the document when expireAt is reached)
notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
