import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserData, UpdateUserData } from '../models/User';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page = 1, limit = 10, search, role, institution_id } = req.query;
      
      let users;
      
      if (search && typeof search === 'string') {
        users = await this.userRepository.searchUsers(search);
      } else if (role && typeof role === 'string') {
        users = await this.userRepository.findByRole(role);
      } else if (institution_id && typeof institution_id === 'string') {
        users = await this.userRepository.findByInstitution(institution_id);
      } else {
        users = await this.userRepository.getUsersWithRoleAndInstitution();
      }

      // Remove sensitive information
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return res.json({
        success: true,
        data: sanitizedUsers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: sanitizedUsers.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await this.userRepository.getUserWithRoleAndInstitution(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await this.userRepository.getUserWithRoleAndInstitution(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive information
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const userData: CreateUserData = req.body;

      // Check if user with same email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Check if user with same username already exists
      const existingUsername = await this.userRepository.findByUsername(userData.usuario);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'User with this username already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      userData.password = hashedPassword;

      const user = await this.userRepository.createUser(userData);

      // Remove sensitive information from response
      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: 'User created successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const updateData: UpdateUserData = req.body;

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is being updated and if it conflicts with another user
      if (updateData.email && updateData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(updateData.email);
        if (userWithEmail) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
      }

      // Check if username is being updated and if it conflicts with another user
      if (updateData.usuario && updateData.usuario !== existingUser.usuario) {
        const userWithUsername = await this.userRepository.findByUsername(updateData.usuario);
        if (userWithUsername) {
          return res.status(409).json({
            success: false,
            message: 'User with this username already exists'
          });
        }
      }

      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await this.userRepository.updateUser(id, updateData);

      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update user'
        });
      }

      // Remove sensitive information from response
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword,
        message: 'User updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const updateData: UpdateUserData = req.body;

      // Users can't update their own role or institution through this endpoint
      delete updateData.role_id;
      delete updateData.institution_id;

      // Check if email is being updated and if it conflicts with another user
      if (updateData.email) {
        const userWithEmail = await this.userRepository.findByEmail(updateData.email);
        if (userWithEmail && userWithEmail.id !== req.user.userId) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists'
          });
        }
      }

      // Check if username is being updated and if it conflicts with another user
      if (updateData.usuario) {
        const userWithUsername = await this.userRepository.findByUsername(updateData.usuario);
        if (userWithUsername && userWithUsername.id !== req.user.userId) {
          return res.status(409).json({
            success: false,
            message: 'User with this username already exists'
          });
        }
      }

      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await this.userRepository.updateUser(req.user.userId, updateData);

      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update profile'
        });
      }

      // Remove sensitive information from response
      const { password, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const user = await this.userRepository.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const deleted = await this.userRepository.deleteUser(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete user'
        });
      }

      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserCourses(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const courses = await this.userRepository.getUserCourses(id);

      return res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getMyCourses(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const courses = await this.userRepository.getUserCourses(req.user.userId);

      return res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.userRepository.updateUser(req.user.userId, { password: hashedNewPassword });

      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
