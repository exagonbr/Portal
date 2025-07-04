import { BaseController } from './BaseController';
import { Institution } from '../entities/Institution';
import { InstitutionRepository } from '../repositories/InstitutionRepository';

const institutionRepository = new InstitutionRepository();

class InstitutionController extends BaseController<Institution> {
  constructor() {
    super(institutionRepository);
  }
}

export default new InstitutionController();