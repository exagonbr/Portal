import { Request, Response } from 'express';
import { WatchlistEntryRepository } from '../repositories/WatchlistEntryRepository';
import { WatchlistEntry } from '../entities/WatchlistEntry';
import BaseController from './BaseController';

export class WatchlistEntryController extends BaseController<WatchlistEntry> {
  private watchlistEntryRepository: WatchlistEntryRepository;
  private watchlist_entryRepository: WatchlistEntryRepository = new WatchlistEntryRepository();

  constructor() {
    const repository = new WatchlistEntryRepository();
    super(repository);
    this.watchlistEntryRepository = repository;
    super(new WatchlistEntryRepository());
  }
}

export default new WatchlistEntryController();
