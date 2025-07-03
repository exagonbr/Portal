import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/schools
 * @desc Get all schools
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const query = db('schools')
      .select('*')
      .orderBy('name');

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const schools = await query;
    
    return res.json({
      success: true,
      data: {
        items: schools,
        pagination: {
          total: schools.length,
          page: 1,
          limit: schools.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/schools/:id
 * @desc Get school by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const school = await query.first();

    if (!school) {
      return res.status(404).json({ 
        success: false,
        error: 'School not found' 
      });
    }

    return res.json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/schools
 * @desc Create a new school
 * @access Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      description,
      address,
      city,
      state,
      zip_code,
      phone,
      email,
      institution_id
    } = req.body;

    // If user has institution_id, enforce it
    if ((req.user as any)?.institutionId && institution_id !== req.user.institutionId) {
      return res.status(403).json({ error: 'Cannot create school for different institution' });
    }

    const [school] = await db('schools')
      .insert({
        name,
        code,
        type,
        description,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        institution_id: institution_id || (req.user as any)?.institutionId,
        is_active: true
      })
      .returning('*');

    return res.status(201).json({
      success: true,
      data: school,
      message: 'School created successfully'
    });
  } catch (error) {
    console.error('Error creating school:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/schools/:id
 * @desc Update a school
 * @access Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      description,
      address,
      city,
      state,
      zip_code,
      phone,
      email,
      is_active
    } = req.body;

    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const [school] = await query
      .update({
        name,
        code,
        type,
        description,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        is_active,
        updated_at: new Date()
      })
      .returning('*');

    if (!school) {
      return res.status(404).json({ 
        success: false,
        error: 'School not found' 
      });
    }

    return res.json({
      success: true,
      data: school,
      message: 'School updated successfully'
    });
  } catch (error) {
    console.error('Error updating school:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/schools/:id
 * @desc Delete a school
 * @access Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if ((req.user as any)?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const deleted = await query.delete();

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'School not found' 
      });
    }

    return res.json({ 
      success: true,
      message: 'School deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting school:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;
