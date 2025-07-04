import { Model } from 'objection';
import { User } from './User';

export class Role extends Model {
  static tableName = 'role';

  id!: number;
  version?: number;
  authority?: string;
  displayName?: string;

  users?: User[];

  static relationMappings = {
    users: {
      relation: Model.HasManyRelation,
      modelClass: User,
      join: {
        from: 'role.id',
        to: 'user.roleId'
      }
    }
  };
}