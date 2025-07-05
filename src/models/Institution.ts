import { Model } from 'objection';
import { User } from './User';

export class Institution extends Model {
  static tableName = 'institution';

  id!: number;
  version?: number;
  accountableContact!: string;
  accountableName!: string;
  companyName!: string;
  complement?: string;
  contractDisabled!: boolean;
  contractInvoiceNum?: string;
  contractNum?: number;
  contractTermEnd!: Date;
  contractTermStart!: Date;
  dateCreated?: Date;
  deleted!: boolean;
  district!: string;
  document!: string;
  invoiceDate?: Date;
  lastUpdated?: Date;
  name!: string;
  postalCode!: string;
  state!: string;
  street!: string;
  score?: number;
  hasLibraryPlatform!: boolean;
  hasPrincipalPlatform!: boolean;
  hasStudentPlatform!: boolean;

  users?: User[];

  static relationMappings = {
    users: {
      relation: Model.HasManyRelation,
      modelClass: User,
      join: {
        from: 'institution.id',
        to: 'user.institutionId'
      }
    }
  };
}