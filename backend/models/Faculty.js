import mongoose from "mongoose";

const PersonalDetailsSchema = new mongoose.Schema({
  dob: {
    type: Date,
    default: new Date("1980-01-01")
  },
  bloodGroup: {
    type: String,
    default: "N/A"
  },
  maritalStatus: {
    type: String,
    default: "N/A"
  },
  nationality: {
    type: String,
    default: "Indian"
  },
  religion: {
    type: String,
    default: "N/A"
  },
});

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  facultyID: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: [
      "mentor",
      "faculty",
      "assistantHod",
      "hod",
      "dean",
      "deanAcademics",
      "placementCell",
      "office",
      "certificateSection"
    ],
    default: "faculty",
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  joiningDate: {
    type: Date,
    required: true,
    default: new Date("1999-01-01")
  },
  phone: {
    type: String,
    required: true
  },
  personalDetails: PersonalDetailsSchema,

  education: {
    qualification: {
      type: String,
      default: "N/A"
    },
    subjectExpertise: {
      type: String,
      default: "N/A"
    }
  },

  otherDetails: {
    isExternal: {
      type: Boolean,
      default: false
    },
    isPartTime: {
      type: Boolean,
      default: false
    }
  },
});

const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);

export default Faculty;
