import { Model } from 'objection';

export class User extends Model {
  static tableName = 'users';

  id!: string;
  name!: string;
  email!: string;
  role_id?: string;
  active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}