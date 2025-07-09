import { BaseController } from './BaseController';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoCollectionRepository } from '../repositories/VideoCollectionRepository';

class VideoCollectionController extends BaseController<VideoCollection> {
  private videoCollectionRepository: VideoCollectionRepository;

  constructor() {
    const repository = new VideoCollectionRepository();
    super(repository);
    this.videoCollectionRepository = repository;
  }
}

export default new VideoCollectionController();
