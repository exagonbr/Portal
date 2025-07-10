import { IsNull } from "typeorm";
import { Role } from "../entities/Role";
import { RoleRepository } from "../repositories/RoleRepository";
import { UserRepository } from "../repositories/UserRepository";

class RoleService {
  private roleRepository: RoleRepository;
  private userRepository: UserRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
    this.userRepository = new UserRepository();
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    return this.roleRepository.create(roleData);
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, roleData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.roleRepository.delete(id);
  }

  async assignTeacherRoleToImportedUsers(): Promise<{ success: boolean; count: number }> {
    try {
      const users = await this.userRepository.find({
        where: { imported: true, roles: { id: IsNull() } }
      });
      
      if (users.length === 0) {
        return { success: true, count: 0 };
      }
      
      const teacherRole = await this.roleRepository.findOne({
        where: { name: "TEACHER" }
      });
      
      if (!teacherRole) {
        throw new Error("Teacher role not found");
      }
      
      let count = 0;
      for (const user of users) {
        user.roles = [teacherRole];
        await this.userRepository.save(user);
        count++;
      }
      
      return { success: true, count };
    } catch (error) {
      console.error("Error assigning teacher role:", error);
      return { success: false, count: 0 };
    }
  }
}

export default RoleService;