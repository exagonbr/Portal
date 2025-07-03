import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createApiResponse,
  createPaginatedResponse,
  formatUnitResponse,
  UnitFilters,
  CreateUnitRequest,
  UpdateUnitRequest
} from '../types/api-responses';

const router = Router();

/**
 * @route GET /api/units
 * @desc Get all units
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      active,
      institution_id
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let query = db('unit')
      .select(
        'unit.*',
        'institutions.name as institution_name'
      )
      .leftJoin('institutions', 'unit.institution_id', 'institutions.id')
      .where('unit.deleted', false)
      .orderBy('unit.name');

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('unit.name', 'ilike', `%${search}%`)
          .orWhere('institutions.name', 'ilike', `%${search}%`);
      });
    }

    if (active !== undefined) {
      // Como não há campo 'active' na tabela, vamos usar 'deleted' invertido
      if (active === 'true') {
        query = query.where('unit.deleted', false);
      } else {
        query = query.where('unit.deleted', true);
      }
    }

    if (institution_id) {
      query = query.where('unit.institution_id', institution_id);
    }

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query = query.where('unit.institution_id', (req.user as any)?.institutionId);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().clearOrder().count('* as total');
    const [{ total }] = await countQuery;

    // Get paginated results
    const units = await query.offset(offset).limit(Number(limit));

    const formattedUnits = units.map(formatUnit);

    return res.json(formatApiResponse(true, {
      items: formattedUnits,
      pagination: {
        total: parseInt(String(total)),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(parseInt(String(total)) / Number(limit))
      }
    }));
  } catch (error) {
    console.error('Error fetching units:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

/**
 * @route GET /api/units/search
 * @desc Search units
 * @access Private
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { search, active, institution_id } = req.query;

    let query = db('unit')
      .select(
        'unit.*',
        'institutions.name as institution_name'
      )
      .leftJoin('institutions', 'unit.institution_id', 'institutions.id')
      .where('unit.deleted', false)
      .orderBy('unit.name');

    if (search) {
      query = query.where(function() {
        this.where('unit.name', 'ilike', `%${search}%`)
          .orWhere('institutions.name', 'ilike', `%${search}%`);
      });
    }

    if (active !== undefined) {
      if (active === 'true') {
        query = query.where('unit.deleted', false);
      } else {
        query = query.where('unit.deleted', true);
      }
    }

    if (institution_id) {
      query = query.where('unit.institution_id', institution_id);
    }

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query = query.where('unit.institution_id', (req.user as any)?.institutionId);
    }

    const units = await query.limit(50); // Limit search results

    const formattedUnits = units.map(formatUnit);

    return res.json(formatApiResponse(true, formattedUnits));
  } catch (error) {
    console.error('Error searching units:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

/**
 * @route GET /api/units/:id
 * @desc Get unit by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const query = db('unit')
      .select(
        'unit.*',
        'institutions.name as institution_name'
      )
      .leftJoin('institutions', 'unit.institution_id', 'institutions.id')
      .where('unit.id', req.params.id)
      .where('unit.deleted', false);

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('unit.institution_id', (req.user as any)?.institutionId);
    }

    const unit = await query.first();

    if (!unit) {
      return res.status(404).json(formatApiResponse(false, undefined, undefined, 'Unit not found'));
    }

    const formattedUnit = formatUnit(unit);

    return res.json(formatApiResponse(true, formattedUnit));
  } catch (error) {
    console.error('Error fetching unit:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

/**
 * @route POST /api/units
 * @desc Create a new unit
 * @access Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      institution_id
    } = req.body;

    // Validation
    if (!name || !institution_id) {
      return res.status(400).json(formatApiResponse(false, undefined, undefined, 'Name and institution_id are required'));
    }

    // If user has institution_id, enforce it
    if ((req.user as any)?.institutionId && institution_id !== (req.user as any)?.institutionId) {
      return res.status(403).json(formatApiResponse(false, undefined, undefined, 'Cannot create unit for different institution'));
    }

    // Get next ID
    const maxIdResult = await db('unit').max('id as maxId').first();
    const nextId = (parseInt(maxIdResult?.maxId || '0') + 1).toString();

    const [unit] = await db('unit')
      .insert({
        id: nextId,
        name,
        institution_id: institution_id || (req.user as any)?.institutionId,
        deleted: false,
        version: '1',
        date_created: new Date(),
        last_updated: new Date()
      })
      .returning('*');

    const formattedUnit = formatUnit(unit);

    return res.status(201).json(formatApiResponse(true, formattedUnit, 'Unit created successfully'));
  } catch (error) {
    console.error('Error creating unit:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

/**
 * @route PUT /api/units/:id
 * @desc Update a unit
 * @access Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      institution_id,
      active
    } = req.body;

    const query = db('unit').where('id', req.params.id).where('deleted', false);

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', (req.user as any)?.institutionId);
    }

    const updateData: any = {
      last_updated: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (institution_id !== undefined) updateData.institution_id = institution_id;
    if (active !== undefined) updateData.deleted = !active; // Inverter o valor

    // Increment version
    const currentUnit = await query.clone().first();
    if (currentUnit) {
      updateData.version = (parseInt(currentUnit.version || '1') + 1).toString();
    }

    const [unit] = await query
      .update(updateData)
      .returning('*');

    if (!unit) {
      return res.status(404).json(formatApiResponse(false, undefined, undefined, 'Unit not found'));
    }

    const formattedUnit = formatUnit(unit);

    return res.json(formatApiResponse(true, formattedUnit, 'Unit updated successfully'));
  } catch (error) {
    console.error('Error updating unit:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

/**
 * @route DELETE /api/units/:id
 * @desc Delete a unit (soft delete)
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const query = db('unit').where('id', req.params.id).where('deleted', false);

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', (req.user as any)?.institutionId);
    }

    // Soft delete - marcar como deleted
    const [unit] = await query
      .update({
        deleted: true,
        last_updated: new Date(),
        version: db.raw('(version::int + 1)::text')
      })
      .returning('*');

    if (!unit) {
      return res.status(404).json(formatApiResponse(false, undefined, undefined, 'Unit not found'));
    }

    return res.json(formatApiResponse(true, undefined, 'Unit deleted successfully'));
  } catch (error) {
    console.error('Error deleting unit:', error);
    return res.status(500).json(formatApiResponse(false, undefined, undefined, 'Internal server error'));
  }
});

export default router;