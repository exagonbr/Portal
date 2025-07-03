import { Router } from 'express';
import { DataSource } from 'typeorm';
import { UsersController } from '../controllers/UsersController';

export function createUsersRoutes(dataSource: DataSource): Router {
  const router = Router();
  const usersController = new UsersController(dataSource);

  // Rotas básicas CRUD
  router.get('/', (req, res) => usersController.getAllUsers(req, res));
  router.get('/:id', (req, res) => usersController.getUserById(req, res));
  router.post('/', (req, res) => usersController.createUser(req, res));
  router.put('/:id', (req, res) => usersController.updateUser(req, res));
  router.delete('/:id', (req, res) => usersController.deleteUser(req, res));

  // Rotas de busca específicas
  router.get('/email/:email', (req, res) => usersController.getUserByEmail(req, res));
  router.get('/role/:roleId', (req, res) => usersController.getUsersByRole(req, res));
  router.get('/institution/:institutionId', (req, res) => usersController.getUsersByInstitution(req, res));

  // Rotas por tipo de usuário
  router.get('/type/admins', (req, res) => usersController.getAdmins(req, res));
  router.get('/type/teachers', (req, res) => usersController.getTeachers(req, res));
  router.get('/type/students', (req, res) => usersController.getStudents(req, res));
  router.get('/type/guardians', (req, res) => usersController.getGuardians(req, res));
  router.get('/type/coordinators', (req, res) => usersController.getCoordinators(req, res));
  router.get('/type/managers', (req, res) => usersController.getInstitutionManagers(req, res));

  // Rotas de gerenciamento de conta
  router.patch('/:id/soft-delete', (req, res) => usersController.softDeleteUser(req, res));
  router.patch('/:id/activate', (req, res) => usersController.activateUser(req, res));
  router.patch('/:id/deactivate', (req, res) => usersController.deactivateUser(req, res));
  router.patch('/:id/lock', (req, res) => usersController.lockUserAccount(req, res));
  router.patch('/:id/unlock', (req, res) => usersController.unlockUserAccount(req, res));

  // Rotas de gerenciamento de senha
  router.patch('/:id/reset-password', (req, res) => usersController.resetUserPassword(req, res));
  router.patch('/:id/change-password', (req, res) => usersController.changeUserPassword(req, res));

  // Rotas de estatísticas e autenticação
  router.get('/stats/overview', (req, res) => usersController.getUserStats(req, res));
  router.post('/authenticate', (req, res) => usersController.authenticateUser(req, res));

  return router;
}