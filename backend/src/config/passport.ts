
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppDataSource } from './typeorm.config'; // Ajuste para o novo TypeORM
import { Role, UserRole } from '../entities/Role';
import { Users } from '../entities/Users'; // A entidade correta é Users
import { AuthenticatedUser } from '../types/auth.types';


export function setupPassport() {
  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
  console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.FRONTEND_URL || 'https://portal.sabercon.com.br'}/api/auth/google/callback`,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRepository = AppDataSource.getRepository(Users);
          let user = await userRepository.findOne({ 
            where: { googleId: profile.id },
            relations: ['role']
          });

          if (user) {
            const userRole = user.role?.name || UserRole.STUDENT;
            const authUser: AuthenticatedUser = {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role?.name || 'user',
              institutionId: user.institutionId,
              permissions: Role.getDefaultPermissions(userRole),
            };
            return done(null, authUser);
          }

          user = await userRepository.findOne({ 
            where: { email: profile.emails![0].value },
            relations: ['role']
          });

          if (user) {
            user.googleId = profile.id;
            await userRepository.save(user);
            const userRole = user.role?.name || UserRole.STUDENT;
            const authUser: AuthenticatedUser = {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role?.name || 'user',
              institutionId: user.institutionId,
              permissions: Role.getDefaultPermissions(userRole),
            };
            return done(null, authUser);
          }

          const newUser = userRepository.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails![0].value,
            // Assign a default role or handle role assignment as needed
            roleId: '35f57500-9a89-4318-bc9f-9acad28c2fb6', // Default 'student' role
          });

          const savedUser = await userRepository.save(newUser);
          const userWithRole = await userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['role']
          });

          if (userWithRole) {
            const userRole = userWithRole.role?.name || UserRole.STUDENT;
            const authUser: AuthenticatedUser = {
              id: userWithRole.id,
              email: userWithRole.email,
              name: userWithRole.fullName,
              role: userWithRole.role?.name || 'user',
              institutionId: userWithRole.institutionId,
              permissions: Role.getDefaultPermissions(userRole),
            };
            done(null, authUser);
          } else {
            done(new Error("Failed to retrieve user after creation."), false);
          }

        } catch (error) {
          done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const userRepository = AppDataSource.getRepository(Users);
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role']
      });
      if (user) {
        const userRole = user.role?.name || UserRole.STUDENT;
        const authUser: AuthenticatedUser = {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role?.name || 'user',
          institutionId: user.institutionId,
          permissions: Role.getDefaultPermissions(userRole),
        };
        done(null, authUser);
      } else {
        done(null, null);
      }

    } catch (error) {
      done(error, false);
    }
  });
}
