import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.config.js";
import prisma from "./db.config.js";

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
          // Existing user — link their Google account if not already linked
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