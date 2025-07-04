import { BaseController } from './BaseController';
import { Class } from '../entities/Class';
import { ClassRepository } from '../repositories/ClassRepository';

const classRepository = new ClassRepository();

class ClassController extends BaseController<Class> {
  constructor() {
    super(classRepository);
  }
}

export default new ClassController();