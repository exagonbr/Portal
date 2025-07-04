import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AppDataSource } from './typeorm.config';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { AuthenticatedUser } from '../types/auth.types';

// Função auxiliar para obter permissões padrão
const getDefaultPermissions = (roleName: string | undefined): string[] => {
  const r = roleName?.toLowerCase() || 'student';
  switch (r) {
    case 'admin':
      return ['read', 'write', 'delete', 'admin'];
    case 'teacher':
      return ['read', 'write'];
    case 'student':
    default:
      return ['read'];
  }
};

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
          const userRepository = AppDataSource.getRepository(User);
          let user = await userRepository.findOne({
            where: { googleId: profile.id },
            relations: ['role']
          });

          if (user) {
            const userRole = user.role?.authority;
            const authUser: AuthenticatedUser = {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role?.authority || 'user',
              institutionId: user.institutionId,
              permissions: getDefaultPermissions(userRole),
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
            const userRole = user.role?.authority;
            const authUser: AuthenticatedUser = {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role?.authority || 'user',
              institutionId: user.institutionId,
              permissions: getDefaultPermissions(userRole),
            };
            return done(null, authUser);
          }

          const newUser = userRepository.create({
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails![0].value,
            role: { id: 3 } as Role // Assumindo que 3 é o ID para 'student' e fazendo um cast
          });

          const savedUser = await userRepository.save(newUser);
          const userWithRole = await userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['role']
          });

          if (userWithRole) {
            const userRole = userWithRole.role?.authority;
            const authUser: AuthenticatedUser = {
              id: userWithRole.id,
              email: userWithRole.email,
              name: userWithRole.fullName,
              role: userWithRole.role?.authority || 'user',
              institutionId: userWithRole.institutionId,
              permissions: getDefaultPermissions(userRole),
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
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role']
      });
      if (user) {
        const userRole = user.role?.authority;
        const authUser: AuthenticatedUser = {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role?.authority || 'user',
          institutionId: user.institutionId,
          permissions: getDefaultPermissions(userRole),
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
