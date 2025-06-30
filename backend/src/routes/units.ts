import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';

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

    const formattedUnits = units.map(unit => ({
      id: unit.id,
      name: unit.name,
      description: '', // Campo não existe na tabela atual
      type: 'school', // Valor padrão já que não existe na tabela
      active: !unit.deleted, // Usando deleted invertido
      institution_id: unit.institution_id,
      created_at: unit.date_created,
      updated_at: unit.last_updated,
      institution: unit.institution_name ? {
        id: unit.institution_id,
        name: unit.institution_name
      } : undefined
    }));

    return res.json({
      success: true,
      data: {
        items: formattedUnits,
        pagination: {
          total: parseInt(String(total)),
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(parseInt(String(total)) / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Unit not found' 
      });
    }

    const formattedUnit = {
      id: unit.id,
      name: unit.name,
      description: '', // Campo não existe na tabela atual
      type: 'school', // Valor padrão já que não existe na tabela
      active: !unit.deleted,
      institution_id: unit.institution_id,
      created_at: unit.date_created,
      updated_at: unit.last_updated,
      institution: unit.institution_name ? {
        id: unit.institution_id,
        name: unit.institution_name
      } : undefined
    };

    return res.json({
      success: true,
      data: formattedUnit
    });
  } catch (error) {
    console.error('Error fetching unit:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
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
      return res.status(400).json({
        success: false,
        error: 'Name and institution_id are required'
      });
    }

    // If user has institution_id, enforce it
    if ((req.user as any)?.institutionId && institution_id !== (req.user as any)?.institutionId) {
      return res.status(403).json({ 
        success: false,
        error: 'Cannot create unit for different institution' 
      });
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

    const formattedUnit = {
      id: unit.id,
      name: unit.name,
      description: '',
      type: 'school',
      active: !unit.deleted,
      institution_id: unit.institution_id,
      created_at: unit.date_created,
      updated_at: unit.last_updated
    };

    return res.status(201).json({
      success: true,
      data: formattedUnit,
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Unit not found' 
      });
    }

    const formattedUnit = {
      id: unit.id,
      name: unit.name,
      description: '',
      type: 'school',
      active: !unit.deleted,
      institution_id: unit.institution_id,
      created_at: unit.date_created,
      updated_at: unit.last_updated
    };

    return res.json({
      success: true,
      data: formattedUnit,
      message: 'Unit updated successfully'
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
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
      return res.status(404).json({ 
        success: false,
        error: 'Unit not found' 
      });
    }

    return res.json({ 
      success: true,
      message: 'Unit deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
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
        'institution.name as institution_name'
      )
      .leftJoin('institution', 'unit.institution_id', 'institution.id')
      .where('unit.deleted', false)
      .orderBy('unit.name');

    if (search) {
      query = query.where(function() {
        this.where('unit.name', 'ilike', `%${search}%`)
          .orWhere('institution.name', 'ilike', `%${search}%`);
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

    const formattedUnits = units.map(unit => ({
      id: unit.id,
      name: unit.name,
      description: '',
      type: 'school',
      active: !unit.deleted,
      institution_id: unit.institution_id,
      created_at: unit.date_created,
      updated_at: unit.last_updated,
      institution: unit.institution_name ? {
        id: unit.institution_id,
        name: unit.institution_name
      } : undefined
    }));

    return res.json({
      success: true,
      data: formattedUnits
    });
  } catch (error) {
    console.error('Error searching units:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router; 