import { BaseController } from './BaseController';
import { School } from '../entities/School';
import { SchoolRepository } from '../repositories/SchoolRepository';

const schoolRepository = new SchoolRepository();

class SchoolController extends BaseController<School> {
  constructor() {
    super(schoolRepository);
  }
}

export default new SchoolController();