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
        callbackURL: 'https://portal.sabercon.com.br/api/auth/google/callback',
      },

      async (accessToken: string, refreshToken: string, profile: any, done: (error: Error | null, user?: any) => void) => {
        try {
          const userRepository = AppDataSource.getRepository(User);
          
          // Buscar usuário por email (já que removemos googleId)
          let user = await userRepository.findOne({
            where: { email: profile.emails![0].value },
            relations: ['role']
          });

          if (user) {
            const userRole = user.role?.name;
            const authUser: AuthenticatedUser = {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role?.name || 'user',
              institutionId: user.institutionId,
              permissions: getDefaultPermissions(userRole),
            };
            return done(null, authUser);
          }

          // Criar novo usuário se não existir
          const newUser = new User();
          newUser.fullName = profile.displayName;
          newUser.email = profile.emails![0].value;
          newUser.enabled = true;
          newUser.isAdmin = false;
          newUser.isManager = false;
          newUser.isTeacher = false;
          newUser.isStudent = true;
          
          // Buscar a role de estudante
          const roleRepository = AppDataSource.getRepository(Role);
          const studentRole = await roleRepository.findOne({ where: { id: 4 } });
          if (studentRole) {
            newUser.role = studentRole;
          }

          const savedUser = await userRepository.save(newUser);
          
          // Buscar o usuário salvo com suas relações
          const userWithRole = await userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['role']
          });

          if (userWithRole) {
            const userRole = userWithRole.role?.name;
            const authUser: AuthenticatedUser = {
              id: userWithRole.id,
              email: userWithRole.email,
              name: userWithRole.fullName,
              role: userWithRole.role?.name || 'user',
              institutionId: userWithRole.institutionId,
              permissions: getDefaultPermissions(userRole),
            };
            done(null, authUser);
          } else {
            done(new Error("Failed to retrieve user after creation."), false);
          }

        } catch (error: any) {
          done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: any) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role']
      });
      if (user) {
        const userRole = user.role?.name;
        const authUser: AuthenticatedUser = {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role?.name || 'user',
          institutionId: user.institutionId,
          permissions: getDefaultPermissions(userRole),
        };
        done(null, authUser);
      } else {
        done(null, null);
      }

    } catch (error) {
      done(error, null);
    }
  });
}
