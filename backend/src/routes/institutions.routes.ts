import { Router } from 'express';
import { db } from '../database/connection';
import { authMiddleware } from '../middleware/auth.middleware';
import { validatePermission } from '../middleware/permission.middleware';

const router = Router();

/**
 * @route GET /api/institution
 * @desc Get all institution
 * @access Private
 */
router.get('/', authMiddleware, validatePermission('institution:read'), async (req, res) => {
  try {
    const institution = await db('institution')
      .select('*')
      .orderBy('name');
    
    res.json(institution);
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/institution/:id
 * @desc Get institution by ID
 * @access Private
 */
router.get('/:id', authMiddleware, validatePermission('institution:read'), async (req, res) => {
  try {
    const institution = await db('institution')
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
 * @route POST /api/institution
 * @desc Create a new institution
 * @access Private
 */
router.post('/', authMiddleware, validatePermission('institution:create'), async (req, res) => {
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

    const [institution] = await db('institution')
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
 * @route PUT /api/institution/:id
 * @desc Update an institution
 * @access Private
 */
router.put('/:id', authMiddleware, validatePermission('institution:update'), async (req, res) => {
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

    const [institution] = await db('institution')
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
 * @route DELETE /api/institution/:id
 * @desc Delete an institution
 * @access Private
 */
router.delete('/:id', authMiddleware, validatePermission('institution:delete'), async (req, res) => {
  try {
    const deleted = await db('institution')
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
