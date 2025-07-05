import { BaseRepository } from './BaseRepository';
import { VideoCollection } from '../entities/VideoCollection';

export class VideoCollectionRepository extends BaseRepository<VideoCollection> {
  constructor() {
    super('video_collections');
  }
}