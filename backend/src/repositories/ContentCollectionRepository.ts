import { BaseRepository } from './BaseRepository';
import { Collection } from '../entities/Collection';
import { Module } from '../entities/Module';

export interface CreateCollectionData extends Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'modules'> {}
export interface UpdateCollectionData extends Partial<CreateCollectionData> {}

export class ContentCollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super('collections');
  }

  async createCollection(data: CreateCollectionData): Promise<Collection> {
    return this.create(data);
  }

  async updateCollection(id: string, data: UpdateCollectionData): Promise<Collection | null> {
    return this.update(id, data);
  }

  async deleteCollection(id: string): Promise<boolean> {
    // Deletar módulos associados primeiro
    await this.db('modules').where('collection_id', id).del();
    return this.delete(id);
  }

  async findByCreator(creatorId: string): Promise<Collection[]> {
    return this.findAll({ created_by: parseInt(creatorId) } as Partial<Collection>);
  }

  async findBySubject(subject: string): Promise<Collection[]> {
    return this.findAll({ subject } as Partial<Collection>);
  }

  async findByTag(tag: string): Promise<Collection[]> {
    return this.db(this.tableName).whereRaw('tags @> ?', `"${tag}"`);
  }

  async search(term: string): Promise<Collection[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${term}%`)
      .orWhere('synopsis', 'ilike', `%${term}%`)
      .orWhere('subject', 'ilike', `%${term}%`);
  }

  async getModules(collectionId: string): Promise<Module[]> {
    return this.db('modules').where('collection_id', collectionId).orderBy('order', 'asc');
  }
}