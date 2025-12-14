import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { Student, Faculty } from "#models/index.js";

const callbackURL =
  process.env.NODE_ENV === "production"
    ? process.env.GOOGLE_CALLBACK_URL
    : "/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile?.emails?.[0]?.value;

        if (!email) {
          console.error("Google OAuth: No email found in profile.");
          return done(null, false, {
            message: "No email associated with this Google account.",
          });
        }

        // Find user in Student or faculty collection
        const student = await Student.findOne({ email });
        const faculty = await Faculty.findOne({ email });

        if (!student && !faculty) {
          console.warn(
            `Google OAuth: Unauthorized login attempt for email: ${email}`
          );
          return done(null, false, {
            message:
              "User email doesn't exist. Please contact admin if you believe this is an error.",
          });
        }

        let user = student || faculty; // Use 'let' so we can reassign
        const userType = user?.userType;

        if (["faculty", "office"].includes(userType)) {
          user = await Faculty.findOne({ email });
        } else if (userType === "Student") {
          user = await Student.findOne({ email });
        }

        console.log(`Google OAuth: User authenticated - ${user.email}`);
        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize only user ID
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user based on ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = (await Student.findById(id)) || (await faculty.findById(id));

    if (!user) {
      console.warn(
        `Google OAuth: User not found during deserialization (ID: ${id})`
      );
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    console.error("Google OAuth: Error deserializing user", error);
    done(error, null);
  }
});

export default passport;
