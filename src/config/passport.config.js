import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.config.js";
import prisma from "./db.config.js";
import ApiError from "../utils/apiError.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email found in Google profile"), null);

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Google sign-in is a Patient-only login method. Doctors, Receptionists,
          // Clinics, Admins, and Super Admins are provisioned with a password and
          // must not be able to authenticate (or have their account linked) via Google.
          if (user.role !== "PATIENT") {
            return done(
              new ApiError(403, "Google sign-in is only available for Patient accounts. Please log in with your email and password."),
              null
            );
          }

          // Existing Patient — link their Google account if not already linked
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, provider: "GOOGLE", avatar: profile.photos?.[0]?.value },
            });
          }
        } else {
          // Brand new user — self-registers as a PATIENT via Google (matches your doc: patients can Google-login)
          user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                name: profile.displayName,
                email,
                googleId: profile.id,
                provider: "GOOGLE",
                avatar: profile.photos?.[0]?.value,
                role: "PATIENT",
                isVerified: true,
                selfRegistered: true,
              },
            });

            await tx.patient.create({ data: { userId: newUser.id } });

            return newUser;
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;