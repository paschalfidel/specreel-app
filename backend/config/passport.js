import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

// Only initialize OAuth strategies if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = await User.create({
              username: profile.displayName,
              email: profile.emails[0].value,
              password: Math.random().toString(36).slice(-8),
              avatar: profile.photos[0]?.value,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
} else {
  console.log('ℹ️  Google OAuth disabled - missing credentials');
}

if (process.env.FB_APP_ID && process.env.FB_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_APP_ID,
        clientSecret: process.env.FB_APP_SECRET,
        callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              username: `${profile.name.givenName} ${profile.name.familyName}`,
              email,
              password: Math.random().toString(36).slice(-8),
              avatar: profile.photos[0]?.value,
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
} else {
  console.log('ℹ️  Facebook OAuth disabled - missing credentials');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, done));

export default passport;
