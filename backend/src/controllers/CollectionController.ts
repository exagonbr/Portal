import { CollectionRepository, Collection } from '../repositories/CollectionRepository';
import { BaseController } from './BaseController';

const collectionRepository = new CollectionRepository();

class CollectionController extends BaseController<Collection> {
  constructor() {
    super(collectionRepository);
  }
}

export default new CollectionController();