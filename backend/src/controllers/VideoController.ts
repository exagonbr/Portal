import { Request, Response } from 'express';
import { Video } from '../entities/Video';
import { VideoRepository } from '../repositories/VideoRepository';

export class VideoController {
  private videoRepository: VideoRepository;

  constructor() {
    const repository = new VideoRepository();
    super(repository);
    this.videoRepository = new VideoRepository();
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `getAll videos with query ${JSON.stringify(req.query)}` } });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `get video by id ${req.params.id}` } });
  }

  async create(req: Request, res: Response): Promise<Response> {
    return res.status(201).json({ success: true, data: { message: 'create video', data: req.body } });
  }

  async update(req: Request, res: Response): Promise<Response> {
    return res.json({ success: true, data: { message: `update video ${req.params.id}`, data: req.body } });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    return res.status(204).json({ success: true, message: 'Video deleted successfully' });
  }
}

export default new VideoController();
