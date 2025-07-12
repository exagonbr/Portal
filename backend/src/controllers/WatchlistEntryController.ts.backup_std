import { Request, Response } from 'express';
import { WatchlistEntryRepository } from '../repositories/WatchlistEntryRepository';
import { WatchlistEntry } from '../entities/WatchlistEntry';
import { BaseController } from './BaseController';

export class WatchlistEntryController extends BaseController<WatchlistEntry> {
  private watchlist_entryRepository: WatchlistEntryRepository = new WatchlistEntryRepository();

  constructor() {
    super(new WatchlistEntryRepository());
  }
}

export default new WatchlistEntryController();
