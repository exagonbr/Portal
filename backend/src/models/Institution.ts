export type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';

export interface Institution {
  id: number;
  version?: number;
  accountableContact: string;
  accountableName: string;
  companyName: string;
  complement?: string;
  contractDisabled: boolean;
  contractInvoiceNum?: string;
  contractNum?: number;
  contractTermEnd: Date;
  contractTermStart: Date;
  dateCreated?: Date;
  deleted: boolean;
  district: string;
  document: string;
  invoiceDate?: Date;
  lastUpdated?: Date;
  name: string;
  postalCode: string;
  state: string;
  street: string;
  score?: number;
  hasLibraryPlatform: boolean;
  hasPrincipalPlatform: boolean;
  hasStudentPlatform: boolean;
}

export interface CreateInstitutionData {
  name: string;
  companyName: string;
  document: string;
  accountableName: string;
  accountableContact: string;
  contractTermStart: Date;
  contractTermEnd: Date;
  street: string;
  district: string;
  state: string;
  postalCode: string;
  complement?: string;
}

export interface UpdateInstitutionData {
  name?: string;
  companyName?: string;
  document?: string;
  accountableName?: string;
  accountableContact?: string;
  contractTermStart?: Date;
  contractTermEnd?: Date;
  street?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  complement?: string;
  contractDisabled?: boolean;
  deleted?: boolean;
}