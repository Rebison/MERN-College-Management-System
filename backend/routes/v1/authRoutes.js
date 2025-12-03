import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { auth } from "#middlewares/auth.js";
import passport from "passport";
import { getMe, healthCheck, login, logout, resetPassword } from "#controllers/authController.js";
import { sendOTP, verifyOTP } from "#controllers/otpController.js";

dotenv.config({ path: '../.env' });
const authRouter = express.Router();

const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? process.env.PROD_FRONTEND_URL
  : process.env.DEV_FRONTEND_URL;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management endpoints
 */

/**
 * @openapi
 * /api/v1/auth/health:
 *   get:
 *     summary: Health check
 *     description: Checks if the system is healthy
 *     tags: [Auth]
 *     security: [] # public route, no JWT required
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 12345
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       503:
 *         description: System under maintenance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *                       nullable: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
authRouter.get('/health', healthCheck('v1'));

// Login
/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates user and sets JWT in cookie
 *     tags: [Auth]
 *     security: [] # public route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
authRouter.post("/login", login('v1'));

// Logout
/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Clears JWT cookie
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []  # protected route
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
authRouter.post('/logout', logout('v1'));

authRouter.post("/sendOTP", sendOTP);

authRouter.post("/verifyOTP", verifyOTP);

authRouter.post("/resetPassword", resetPassword('v1'));



// Check Authentication Status
// authRouter.get("/check-auth", (req, res) => {
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
// authRouter.get("/", auth, (req, res) => {
//   res.send(req.user);
// });

/**
 * @openapi
 * /api/v1/auth/getMe:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the logged-in user information
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []  # protected route
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       501:
 *         $ref: '#/components/responses/NotImplementedError'
 */
// Dashboard Route (Protected)
authRouter.get("/getMe", auth, getMe('v1'));

// Google Login Success
authRouter.get("/login/success", (req, res) => {
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
authRouter.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

/* ================= Google SSO Routes ================= */
// Google Auth Route (Redirect to Google)
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
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

      req.session.token = token; // Store token in session
      res.redirect(`${FRONTEND_URL}/`);
    } catch (error) {
      console.error("Google Auth Callback Error:", error);
      res.redirect(`${FRONTEND_URL}/login?error=internal_error`);
    }
  }
);

// Google Logout
authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.clearCookie("token");
    res.redirect(`${FRONTEND_URL}/login`);
  });
});

export const isPublic = true;
export default authRouter;