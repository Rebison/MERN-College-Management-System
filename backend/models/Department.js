import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },

  // 👤 HOD and Dean (optional)
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },
  departmentDean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },

  // 👥 Assistant HODs with controlled sections
  assistantHods: [
    {
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
      },
      sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
      }]
    }
  ],

  // 🧾 Optional: Valid roles for this department
  availableRoles: {
    type: [String],
    default: ["mentor", "assistantHod", "hod", "departmentDean"]
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Department = mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default Department;