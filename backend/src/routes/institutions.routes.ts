import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';
import { validatePermission } from '../middleware/permission.middleware';

const router = Router();

/**
 * @route GET /api/institutions
 * @desc Get all institutions
 * @access Private
 */
router.get('/', authMiddleware, validatePermission('institutions:read'), async (req, res) => {
  try {
    const institutions = await db('institutions')
      .select('*')
      .orderBy('name');
    
    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/institutions/:id
 * @desc Get institution by ID
 * @access Private
 */
router.get('/:id', authMiddleware, validatePermission('institutions:read'), async (req, res) => {
  try {
    const institution = await db('institutions')
      .where({ id: req.params.id })
      .first();
    
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    
    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/institutions
 * @desc Create a new institution
 * @access Private
 */
router.post('/', authMiddleware, validatePermission('institutions:create'), async (req, res) => {
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
      website
    } = req.body;

    const [institution] = await db('institutions')
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
        website,
        status: 'active'
      })
      .returning('*');

    res.status(201).json(institution);
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route PUT /api/institutions/:id
 * @desc Update an institution
 * @access Private
 */
router.put('/:id', authMiddleware, validatePermission('institutions:update'), async (req, res) => {
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
      website,
      status
    } = req.body;

    const [institution] = await db('institutions')
      .where({ id: req.params.id })
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
        website,
        status,
        updated_at: new Date()
      })
      .returning('*');

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json(institution);
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route DELETE /api/institutions/:id
 * @desc Delete an institution
 * @access Private
 */
router.delete('/:id', authMiddleware, validatePermission('institutions:delete'), async (req, res) => {
  try {
    const deleted = await db('institutions')
      .where({ id: req.params.id })
      .delete();

    if (!deleted) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
