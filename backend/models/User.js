import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  email: {
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    select: false,
  },
  userType: {
    type: String,
    enum: ["admin", "student", "faculty", "office", "superAdmin"],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  loginLastAttempt: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: "defaultProfile.png"
  },
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: undefined
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
