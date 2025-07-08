import { BaseController } from './BaseController';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoCollectionRepository } from '../repositories/VideoCollectionRepository';

const videoCollectionRepository = new VideoCollectionRepository();

class VideoCollectionController extends BaseController<VideoCollection> {
  constructor() {
    const repository = new VideoCollectionRepository();
    super(repository);
    this.videoCollectionRepository = repository;
    super(videoCollectionRepository);
  }
}

export default new VideoCollectionController();