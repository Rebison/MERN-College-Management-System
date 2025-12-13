import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  _id: {
    type: String, // e.g., "mentor", "assistantHOD"
    required: true
  },
  name: {
    type: String, // Full display name like "Assistant Head of Department"
    required: true
  },
  level: {
    type: Number, // For hierarchy sorting
    required: true
  }
}, { _id: false });

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;