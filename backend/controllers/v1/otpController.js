import crypto from "crypto";
import { Student, Faculty, OtpVerification } from "#models/index.js";
import { sendCustomEmail } from "../../emails/emailService.js";
import { getOtpTemplate } from "../../emails/templates/authTemplate.js";

const MAX_OTP_REQUESTS_PER_DAY = 3;
const MAX_ATTEMPTS = 5;
const OTP_REQUEST_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const OTP_ATTEMPT_COOLDOWN = 60 * 60 * 1000; // 1 hour

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash("sha256").update(otp).digest("hex");
  return { otp, hash };
}

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const student = await Student.findOne(
      { email },
      { _id: 1, fullName: 1, email: 1 }
    );
    const faculty = await Faculty.findOne(
      { email },
      { _id: 1, name: 1, email: 1 }
    );
    const user = student || faculty;

    if (!user)
      return res.status(400).json({ message: "Email ID doesn't exist" });

    let otpRecord = await OtpVerification.findOne({
      userId: user._id,
      userType: user.constructor.modelName,
      purpose: "password_reset",
    });

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (otpRecord) {
      const lastRequestDay = otpRecord.updatedAt.toISOString().split("T")[0];
      if (lastRequestDay !== today) {
        otpRecord.otpRequestsToday = 0;
        if (
          otpRecord.otpLockedAt &&
          now - otpRecord.otpLockedAt >= OTP_ATTEMPT_COOLDOWN
        ) {
          otpRecord.otpAttempts = 0;
          otpRecord.otpLockedAt = undefined;
        }
        await otpRecord.save();
      }
    }

    if (otpRecord && otpRecord.otpRequestsToday >= MAX_OTP_REQUESTS_PER_DAY) {
      return res.status(429).json({
        message: "OTP request limit exceeded for today. Try again tomorrow.",
      });
    }

    const { otp, hash } = generateOTP();
    console.log("Generated OTP: ", otp, " for email: ", email);
    const otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins

    if (!otpRecord) {
      otpRecord = new OtpVerification({
        userId: user._id,
        userType: user.constructor.modelName,
        purpose: "password_reset",
        otp: hash,
        otpExpiresAt,
        otpRequestsToday: 1,
        otpAttempts: 0,
      });
    } else {
      otpRecord.otp = hash;
      otpRecord.otpExpiresAt = otpExpiresAt;
      otpRecord.otpRequestsToday += 1;
    }

    await otpRecord.save();

    await sendCustomEmail(email, getOtpTemplate, {
      recipientName: user.name || user.fullName || "User",
      otp: otp,
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  try {
    const student = await Student.findOne(
      { email },
      { _id: 1, resetPasswordToken: 1, resetPasswordExpiresAt: 1 }
    );
    const faculty = await Faculty.findOne(
      { email },
      { _id: 1, resetPasswordToken: 1, resetPasswordExpiresAt: 1 }
    );
    const user = student || faculty;

    if (!user)
      return res.status(400).json({ message: "Email ID doesn't exist" });

    const otpRecord = await OtpVerification.findOne({
      userId: user._id,
      userType: user.constructor.modelName,
      purpose: "password_reset",
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ otpStatus: "OTP_NOT_FOUND", message: "No OTP request found." });
    }

    const now = Date.now();

    if (
      otpRecord.otpRequestsToday >= MAX_OTP_REQUESTS_PER_DAY &&
      otpRecord.otpLockedAt &&
      now - otpRecord.otpLockedAt.getTime() < OTP_REQUEST_COOLDOWN
    ) {
      const minutes = Math.ceil(
        (OTP_REQUEST_COOLDOWN - (now - otpRecord.otpLockedAt.getTime())) / 60000
      );
      return res.status(429).json({
        otpStatus: "OTP_REQUEST_LOCKED",
        message: `Try again in ${minutes} minutes.`,
      });
    }

    if (otpRecord.otpAttempts >= MAX_ATTEMPTS) {
      if (!otpRecord.otpLockedAt) {
        otpRecord.otpLockedAt = new Date();
        await otpRecord.save();
      }

      const lockLeft =
        OTP_ATTEMPT_COOLDOWN - (now - otpRecord.otpLockedAt.getTime());
      if (lockLeft > 0) {
        const minutes = Math.ceil(lockLeft / 60000);
        return res.status(429).json({
          otpStatus: "OTP_ATTEMPT_LOCKED",
          message: `Try again in ${minutes} minutes.`,
        });
      } else {
        otpRecord.otpAttempts = 0;
        otpRecord.otpLockedAt = null;
        await otpRecord.save();
      }
    }

    if (otpRecord.otpExpiresAt < new Date()) {
      return res.status(400).json({
        otpStatus: "OTP_EXPIRED",
        message: "OTP expired. Please request a new one.",
      });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== otpRecord.otp) {
      otpRecord.otpAttempts += 1;
      otpRecord.otpLastAttemptAt = new Date();
      if (otpRecord.otpAttempts >= MAX_ATTEMPTS) {
        otpRecord.otpLockedAt = new Date();
      }
      await otpRecord.save();
      return res.status(400).json({
        otpStatus: "INVALID_OTP",
        message: `Invalid OTP. Attempt ${otpRecord.otpAttempts} / ${MAX_ATTEMPTS}`,
      });
    }

    await otpVerification.deleteOne({ _id: otpRecord._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      success: true,
      otpStatus: "OTP_VALID",
      message: "OTP verified",
      resetToken,
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};
