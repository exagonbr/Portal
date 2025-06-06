import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';
import { validatePermission } from '../middleware/permission.middleware';

const router = Router();

/**
 * @route GET /api/schools
 * @desc Get all schools
 * @access Private
 */
router.get('/', authMiddleware, validatePermission('schools:read'), async (req, res) => {
  try {
    const query = db('schools')
      .select('*')
      .orderBy('name');

    // Filter by institution if user has institution_id
    if (req.user?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const schools = await query;
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/schools/:id
 * @desc Get school by ID
 * @access Private
 */
router.get('/:id', authMiddleware, validatePermission('schools:read'), async (req, res) => {
  try {
    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if (req.user?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const school = await query.first();

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/schools
 * @desc Create a new school
 * @access Private
 */
router.post('/', authMiddleware, validatePermission('schools:create'), async (req, res) => {
  try {
    const {
      name,
      code,
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
    if (req.user?.institutionId && institution_id !== req.user.institutionId) {
      return res.status(403).json({ error: 'Cannot create school for different institution' });
    }

    const [school] = await db('schools')
      .insert({
        name,
        code,
        description,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        institution_id: institution_id || req.user?.institutionId,
        status: 'active'
      })
      .returning('*');

    res.status(201).json(school);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route PUT /api/schools/:id
 * @desc Update a school
 * @access Private
 */
router.put('/:id', authMiddleware, validatePermission('schools:update'), async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      address,
      city,
      state,
      zip_code,
      phone,
      email,
      status
    } = req.body;

    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if (req.user?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const [school] = await query
      .update({
        name,
        code,
        description,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        status,
        updated_at: new Date()
      })
      .returning('*');

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/schools/:id
 * @desc Delete a school
 * @access Private
 */
router.delete('/:id', authMiddleware, validatePermission('schools:delete'), async (req, res) => {
  try {
    const query = db('schools').where({ id: req.params.id });

    // Filter by institution if user has institution_id
    if (req.user?.institutionId) {
      query.where('institution_id', req.user.institutionId);
    }

    const deleted = await query.delete();

    if (!deleted) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
