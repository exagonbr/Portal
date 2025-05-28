import { BaseRepository } from './BaseRepository';
import { ContentCollection, CreateContentCollectionData, UpdateContentCollectionData, CollectionModule, CreateCollectionModuleData, UpdateCollectionModuleData } from '../models/ContentCollection';

export class ContentCollectionRepository extends BaseRepository<ContentCollection> {
  constructor() {
    super('content_collections');
  }

  async findByCreator(createdBy: string): Promise<ContentCollection[]> {
    return this.findAll({ created_by: createdBy } as Partial<ContentCollection>);
  }

  async findBySubject(subject: string): Promise<ContentCollection[]> {
    return this.findAll({ subject } as Partial<ContentCollection>);
  }

  async findByTag(tag: string): Promise<ContentCollection[]> {
    return this.db(this.tableName)
      .whereRaw('? = ANY(tags)', [tag])
      .select('*');
  }

  async createCollection(data: CreateContentCollectionData): Promise<ContentCollection> {
    return this.create(data);
  }

  async updateCollection(id: string, data: UpdateContentCollectionData): Promise<ContentCollection | null> {
    return this.update(id, data);
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getCollectionModules(collectionId: string): Promise<CollectionModule[]> {
    return this.db('collection_modules')
      .where('collection_id', collectionId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async getCollectionWithModules(id: string): Promise<any | null> {
    const collection = await this.findById(id);
    if (!collection) return null;

    const modules = await this.getCollectionModules(id);

    return {
      ...collection,
      modules
    };
  }

  async searchCollections(searchTerm: string): Promise<ContentCollection[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('synopsis', 'ilike', `%${searchTerm}%`)
      .orWhere('subject', 'ilike', `%${searchTerm}%`)
      .select('*');
  }

  async getCollectionsWithCreator(): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'content_collections.*',
        'users.name as creator_name',
        'users.usuario as creator_username'
      )
      .leftJoin('users', 'content_collections.created_by', 'users.id')
      .orderBy('content_collections.created_at', 'desc');
  }

  async getPopularCollections(limit: number = 10): Promise<ContentCollection[]> {
    // This would require a view/usage tracking table in a real implementation
    // For now, we'll just return recent collections
    return this.db(this.tableName)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  async getCollectionsByTags(tags: string[]): Promise<ContentCollection[]> {
    return this.db(this.tableName)
      .whereRaw('tags && ?', [tags])
      .select('*');
  }

  async updateTotalDuration(collectionId: string): Promise<void> {
    // Calculate total duration from all videos in collection modules
    const result = await this.db.raw(`
      SELECT SUM(
        CASE 
          WHEN v.duration ~ '^[0-9]+:[0-9]+:[0-9]+$' THEN 
            EXTRACT(EPOCH FROM v.duration::interval)
          ELSE 0
        END
      ) as total_seconds
      FROM content_collections cc
      LEFT JOIN collection_modules cm ON cc.id = cm.collection_id
      LEFT JOIN videos v ON v.id = ANY(cm.video_ids)
      WHERE cc.id = ?
      GROUP BY cc.id
    `, [collectionId]);

    const totalSeconds = result.rows[0]?.total_seconds || 0;
    const totalMinutes = Math.round(totalSeconds / 60);

    await this.update(collectionId, { total_duration: totalMinutes } as Partial<ContentCollection>);
  }
}

export class CollectionModuleRepository extends BaseRepository<CollectionModule> {
  constructor() {
    super('collection_modules');
  }

  async findByCollection(collectionId: string): Promise<CollectionModule[]> {
    return this.db(this.tableName)
      .where('collection_id', collectionId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async createModule(data: CreateCollectionModuleData): Promise<CollectionModule> {
    return this.create(data);
  }

  async updateModule(id: string, data: UpdateCollectionModuleData): Promise<CollectionModule | null> {
    return this.update(id, data);
  }

  async deleteModule(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async addVideoToModule(moduleId: string, videoId: string): Promise<void> {
    await this.db.raw(`
      UPDATE collection_modules 
      SET video_ids = array_append(video_ids, ?), updated_at = NOW()
      WHERE id = ? AND NOT (? = ANY(video_ids))
    `, [videoId, moduleId, videoId]);
  }

  async removeVideoFromModule(moduleId: string, videoId: string): Promise<void> {
    await this.db.raw(`
      UPDATE collection_modules 
      SET video_ids = array_remove(video_ids, ?), updated_at = NOW()
      WHERE id = ?
    `, [videoId, moduleId]);
  }

  async getModuleVideos(moduleId: string): Promise<any[]> {
    const module = await this.findById(moduleId);
    if (!module || !module.video_ids || module.video_ids.length === 0) {
      return [];
    }

    return this.db('videos')
      .whereIn('id', module.video_ids)
      .select('*');
  }

  async reorderModules(collectionId: string, moduleOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const moduleOrder of moduleOrders) {
        await trx('collection_modules')
          .where('id', moduleOrder.id)
          .andWhere('collection_id', collectionId)
          .update({ order: moduleOrder.order, updated_at: new Date() });
      }
    });
  }

  async getNextOrder(collectionId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('collection_id', collectionId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async getModuleWithVideos(id: string): Promise<any | null> {
    const module = await this.findById(id);
    if (!module) return null;

    const videos = await this.getModuleVideos(id);

    return {
      ...module,
      videos
    };
  }
}
