import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UAParser } from "ua-parser-js";
import { Faculty, Setting, Student, User } from "#models/index.js";
import { getMaintenanceStatus } from "../../utils/maintenanceCache.js";
import { developerRoles } from "../../utils/common.js";
import { sendCustomEmail } from '../../emails/emailService.js';
import { getPasswordChangeDetailsTemplate } from '../../emails/templates/authTemplate.js';

export async function healthCheck() {
  try {
    const flag = await Setting.findById('maintenance_flag');
    const now = new Date();

    const isScheduled = flag?.startTime && flag?.endTime &&
      now >= new Date(flag.startTime) && now <= new Date(flag.endTime);

    const isExpiredSchedule = flag?.startTime && flag?.endTime &&
      now > new Date(flag.endTime);

    if (isExpiredSchedule && !flag?.maintenance) {
      await Setting.findByIdAndUpdate('maintenance_flag', {
        $unset: { startTime: "", endTime: "" },
        message: ''
      });
    }

    if (flag?.maintenance || isScheduled) {
      return {
        status: 'maintenance',
        message: flag?.message || 'System is under maintenance',
        timestamp: new Date().toISOString(),
        startTime: flag?.startTime,
        endTime: flag?.endTime
      };
    }

    return {
      status: 'ok',
      message: '',
      timestamp: new Date().toISOString(),
      isScheduled: !!(flag?.startTime && flag?.endTime && now < new Date(flag.startTime)),
      startTime: flag?.startTime,
      endTime: flag?.endTime,
      scheduleMessage: flag?.message
    };

  } catch (error) {
    throw new AppError('Error while connecting to the server', 500, 'HEALTHCHECK_ERROR', { originalError: error.message });
  }
};

export async function login({ email, password }) {
    const user = await User.findOne({ email }, { password: 1 }).lean();
    if (!user) {
      throw new AppError("Email ID doesn't exist", 400, 'USER_NOT_FOUND');
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'CREDENTIALS_INVALID');
    }

    const now = new Date();
    const { maintenance, startTime, endTime } = getMaintenanceStatus();
    const isScheduled = startTime && endTime && now >= new Date(startTime) && now <= new Date(endTime);
    const isUnderMaintenance = maintenance || isScheduled;

    if (isUnderMaintenance && !developerRoles.includes(user.role)) {
      throw new AppError('System is under maintenance. Please try again later.', 503, 'MAINTENANCE_MODE');
    }

    let enrichedUser = { ...user.toObject() };
    const userType = user?.userType;
    if (["faculty", "office"].includes(userType)) {
      const faculty = await Faculty.findOne({ email });
      if (faculty) enrichedUser = { ...enrichedUser, ...faculty.toObject() };
    } else if (userType === "student") {
      const student = await Student.findOne({ email });
    }

    const token = jwt.sign(
      {
        email: enrichedUser.email,
        userType: enrichedUser.userType,
        role: enrichedUser.role,
        id: enrichedUser._id,
        department: enrichedUser.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user: enrichedUser, token }
};

export async function logout() {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

export async function resetPassword() {
  const { email, resetToken, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    let user;

    // Forgot password flow
    if (email && resetToken) {
      const student = await Student.findOne({ email }, { _id: 1, password: 1, resetPasswordToken: 1, resetPasswordExpiresAt: 1 });
      const faculty = await Faculty.findOne({ email }, { _id: 1, password: 1, resetPasswordToken: 1, resetPasswordExpiresAt: 1 });
      user = student || faculty;

      if (!user) {
        return res.status(400).json({ message: "Invalid email ID" });
      }

      if (
        !user.resetPasswordToken ||
        user.resetPasswordToken !== resetToken ||
        user.resetPasswordExpiresAt < new Date()
      ) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

    } else {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    // Check if new password is same as old one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password must be different from the old password" });
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Email device info
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const device = parser.getResult();
    const timestamp = new Date();

    sendCustomEmail(user.email, getPasswordChangeDetailsTemplate, {
      recipientName: user.name || user.fullName || "User",
      ipAddress,
      device,
      timestamp
    })

    return res.status(200).json({ message: "Password updated and confirmation email sent" });

  } catch (error) {
    console.error("Error in ResetPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export async function getMe() {
  try {
    if (!req.user || !req.user.email || !req.user.userType) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { email, userType } = req.user;
    let user = null;

    if (["faculty", "office"].includes(userType)) {
      user = await Faculty.findOne({ email }, { password: 0 });
    } else if (userType === "student") {
      user = await Student.findOne({ email }, { password: 0 });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
      userType: user.userType,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error in /me:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
