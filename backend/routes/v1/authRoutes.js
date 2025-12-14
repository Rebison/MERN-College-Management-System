import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "#middlewares/auth.js";
import passport from "passport";
import * as authController from "#controllers/v1/authController.js";
import { sendOTP, verifyOTP } from "#controllers/v1/otpController.js";

const router = express.Router();

const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? process.env.PROD_FRONTEND_URL
  : process.env.DEV_FRONTEND_URL;

router.get('/health', authController.healthCheck);

// Login
router.post("/login", authController.login);

// Logout
router.post('/logout', authController.logout);

router.post("/sendOTP", sendOTP);

router.post("/verifyOTP", verifyOTP);

router.post("/resetPassword", authController.resetPassword);



// Check Authentication Status
// router.get("/check-auth", (req, res) => {
//   const token = req.session.token;

//   if (!token) {
//     return res.json({ isAuthenticated: false });
//   }

//   try {
//     jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ isAuthenticated: true });
//   } catch (error) {
//     res.json({ isAuthenticated: false });
//   }
// });

// Get User Details (Protected Route)
// router.get("/", auth, (req, res) => {
//   res.send(req.user);
// });


// Dashboard Route (Protected)
router.get("/getMe", auth, authController.getMe);

// Google Login Success
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

// Google Login Failed
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

/* ================= Google SSO Routes ================= */
// Google Auth Route (Redirect to Google)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google_oauth_failed`,
    failureMessage: true, // this enables `req.session.messages` if needed
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error("Google OAuth: User not found in request.");
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
      }

      const user = req.user;
      const token = jwt.sign(
        { id: user._id, email: user.email, userType: user.userType, role: user.role, department: user.department },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      req.session.token = token;
      res.redirect(`${FRONTEND_URL}/`);
    } catch (error) {
      console.error("Google Auth Callback Error:", error);
      res.redirect(`${FRONTEND_URL}/login?error=internal_error`);
    }
  }
);

// Google Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.clearCookie("token");
    res.redirect(`${FRONTEND_URL}/login`);
  });
});

export const isPublic = true;
export default router;