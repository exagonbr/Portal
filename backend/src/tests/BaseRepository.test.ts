import { Knex } from 'knex';
import { BaseRepository } from '../repositories/refactored/BaseRepository';
import db from '../config/database';

// Test entity interface
interface TestEntity {
  id: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

// Concrete implementation of BaseRepository for testing
class TestRepository extends BaseRepository<TestEntity> {
  constructor() {
    super('test_entities');
  }
}

describe('BaseRepository Transaction Tests', () => {
  let repository: TestRepository;

  beforeAll(async () => {
    // Create test table
    await db.schema.createTable('test_entities', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.timestamps(true, true);
    });
    
    repository = new TestRepository();
  });

  afterAll(async () => {
    // Drop test table
    await db.schema.dropTable('test_entities');
    await db.destroy();
  });

  beforeEach(async () => {
    // Clear data before each test
    await db('test_entities').del();
  });

  describe('Transaction Operations', () => {
    it('should create entity within transaction', async () => {
      await db.transaction(async (trx) => {
        const entity = await repository.create(
          { name: 'Test Entity' },
          { transaction: trx }
        );

        expect(entity).toBeDefined();
        expect(entity.id).toBeDefined();
        expect(entity.name).toBe('Test Entity');
      });

      // Verify entity was created
      const result = await repository.findOne({ name: 'Test Entity' });
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Entity');
    });

    it('should update entity within transaction', async () => {
      // Create entity first
      const entity = await repository.create({ name: 'Original Name' });

      await db.transaction(async (trx) => {
        const updated = await repository.update(
          entity.id,
          { name: 'Updated Name' },
          { transaction: trx }
        );

        expect(updated).toBeDefined();
        expect(updated?.name).toBe('Updated Name');
      });

      // Verify update persisted
      const result = await repository.findById(entity.id);
      expect(result?.name).toBe('Updated Name');
    });

    it('should delete entity within transaction', async () => {
      // Create entity first
      const entity = await repository.create({ name: 'To Delete' });

      await db.transaction(async (trx) => {
        const deleted = await repository.delete(
          entity.id,
          { transaction: trx }
        );

        expect(deleted).toBe(true);
      });

      // Verify deletion
      const result = await repository.findById(entity.id);
      expect(result).toBeNull();
    });

    it('should create multiple entities within transaction', async () => {
      const entities = [
        { name: 'Entity 1' },
        { name: 'Entity 2' },
        { name: 'Entity 3' }
      ];

      await db.transaction(async (trx) => {
        const created = await repository.createMany(
          entities,
          { transaction: trx }
        );

        expect(created).toHaveLength(3);
        expect(created[0]?.name).toBe('Entity 1');
        expect(created[1]?.name).toBe('Entity 2');
        expect(created[2]?.name).toBe('Entity 3');
      });

      // Verify all entities were created
      const results = await repository.findAll();
      expect(results).toHaveLength(3);
    });

    it('should rollback transaction on error', async () => {
      const initialEntity = await repository.create({ name: 'Initial' });

      try {
        await db.transaction(async (trx) => {
          // Update should succeed
          await repository.update(
            initialEntity.id,
            { name: 'Updated' },
            { transaction: trx }
          );

          // This should fail and trigger rollback
          await repository.update(
            'non-existent-id',
            { name: 'Should Fail' },
            { transaction: trx }
          );
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify the initial update was rolled back
      const result = await repository.findById(initialEntity.id);
      expect(result?.name).toBe('Initial');
    });
  });
});
