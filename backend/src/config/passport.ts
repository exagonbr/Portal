import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

export function setupPassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRepository = getRepository(User);
          let user = await userRepository.findOne({ 
            where: { googleId: profile.id },
            relations: ['role']
          });

          if (user) {
            return done(null, {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role?.name,
              institutionId: user.institution_id,
              permissions: user.role?.permissions || [],
            });
          }

          user = await userRepository.findOne({ 
            where: { email: profile.emails![0].value },
            relations: ['role']
          });

          if (user) {
            user.googleId = profile.id;
            await userRepository.save(user);
            return done(null, {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role?.name,
              institutionId: user.institution_id,
              permissions: user.role?.permissions || [],
            });
          }

          const newUser = userRepository.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails![0].value,
            // Assign a default role or handle role assignment as needed
            role_id: '35f57500-9a89-4318-bc9f-9acad28c2fb6', // Default 'student' role
          });

          const savedUser = await userRepository.save(newUser);
          const userWithRole = await userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['role']
          });

          done(null, {
            id: userWithRole!.id,
            email: userWithRole!.email,
            name: userWithRole!.name,
            role: userWithRole!.role?.name,
            institutionId: userWithRole!.institution_id,
            permissions: userWithRole!.role?.permissions || [],
          });
        } catch (error) {
          done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role']
      });
      done(null, user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
        institutionId: user.institution_id,
        permissions: user.role?.permissions || [],
      } : null);
    } catch (error) {
      done(error, false);
    }
  });
}