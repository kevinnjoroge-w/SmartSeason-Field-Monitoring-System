const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const { withStatusAll, withStatus } = require('../utils/statusHelper');

const router = express.Router();
router.use(authenticate);

// GET /api/fields - Admin gets all; Agent gets only assigned fields
router.get('/', async (req, res) => {
  try {
    let query;
    let params = [];
    
    // We join with users to get the agent name conveniently
    if (req.user.role === 'admin') {
      query = `
        SELECT f.*, u.name as agent_name 
        FROM fields f 
        LEFT JOIN users u ON f.assigned_agent_id = u.id 
        ORDER BY f.created_at DESC
      `;
    } else {
      query = `
        SELECT f.*, u.name as agent_name 
        FROM fields f 
        LEFT JOIN users u ON f.assigned_agent_id = u.id 
        WHERE f.assigned_agent_id = $1 
        ORDER BY f.created_at DESC
      `;
      params = [req.user.id];
    }

    const { rows } = await pool.query(query, params);
    res.json({ success: true, data: withStatusAll(rows), message: 'Fields retrieved' });
  } catch (error) {
    console.error('Fetch fields error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// GET /api/fields/:id - Get single field details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT f.*, u.name as agent_name 
      FROM fields f 
      LEFT JOIN users u ON f.assigned_agent_id = u.id 
      WHERE f.id = $1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Field not found' });
    }
    
    const field = rows[0];
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ success: false, data: null, message: 'Access denied to this field' });
    }
    
    res.json({ success: true, data: withStatus(field), message: 'Field retrieved' });
  } catch (error) {
    console.error('Fetch field error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});


// POST /api/fields - create field (Admin)
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { name, crop_type, planting_date, stage, assigned_agent_id } = req.body;
    
    if (!name || !crop_type || !planting_date) {
      return res.status(400).json({ success: false, data: null, message: 'Missing required fields' });
    }

    const { rows } = await pool.query(
      `INSERT INTO fields (name, crop_type, planting_date, stage, assigned_agent_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, crop_type, planting_date, stage || 'Planted', assigned_agent_id || null]
    );

    res.status(201).json({ success: true, data: withStatus(rows[0]), message: 'Field created successfully' });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// PATCH /api/fields/:id/assign - assign agent (Admin)
router.patch('/:id/assign', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE fields SET assigned_agent_id = $1 WHERE id = $2 RETURNING *`,
      [agent_id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Field not found' });
    }

    res.json({ success: true, data: withStatus(rows[0]), message: 'Agent assigned successfully' });
  } catch (error) {
    console.error('Assign field error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// PATCH /api/fields/:id/stage - update stage (Agent only, on assigned fields)
router.patch('/:id/stage', requireRole('agent'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, data: null, message: 'Stage is required' });
    }

    // Check ownership
    const check = await pool.query('SELECT assigned_agent_id FROM fields WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, data: null, message: 'Field not found' });
    if (check.rows[0].assigned_agent_id !== req.user.id) {
       return res.status(403).json({ success: false, data: null, message: 'Not authorized for this field' });
    }

    const { rows } = await pool.query(
      `UPDATE fields SET stage = $1 WHERE id = $2 RETURNING *`,
      [stage, id]
    );

    res.json({ success: true, data: withStatus(rows[0]), message: 'Field stage updated' });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// POST /api/fields/:id/updates - add note/observation (Agent)
router.post('/:id/updates', requireRole('agent'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, new_stage } = req.body;

    if (!notes && !new_stage) {
      return res.status(400).json({ success: false, data: null, message: 'Notes or new stage required' });
    }

    // Check ownership
    const check = await pool.query('SELECT assigned_agent_id FROM fields WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, data: null, message: 'Field not found' });
    if (check.rows[0].assigned_agent_id !== req.user.id) {
       return res.status(403).json({ success: false, data: null, message: 'Not authorized for this field' });
    }

    const client = await pool.connect();
    let insertedUpdate;
    try {
      await client.query('BEGIN');
      
      const { rows } = await client.query(
        `INSERT INTO field_updates (field_id, agent_id, new_stage, notes) VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, req.user.id, new_stage || null, notes || null]
      );
      insertedUpdate = rows[0];

      if (new_stage) {
        await client.query(`UPDATE fields SET stage = $1 WHERE id = $2`, [new_stage, id]);
      }
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.status(201).json({ success: true, data: insertedUpdate, message: 'Update added successfully' });
  } catch (error) {
    console.error('Add update error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// GET /api/fields/:id/updates - view update history
router.get('/:id/updates', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Auth check: if agent, verify assignment
    if (req.user.role === 'agent') {
      const check = await pool.query('SELECT assigned_agent_id FROM fields WHERE id = $1', [id]);
      if (check.rows.length === 0) return res.status(404).json({ success: false, data: null, message: 'Field not found' });
      if (check.rows[0].assigned_agent_id !== req.user.id) {
         return res.status(403).json({ success: false, data: null, message: 'Not authorized for this field' });
      }
    }

    const { rows } = await pool.query(`
      SELECT fu.*, u.name as agent_name 
      FROM field_updates fu 
      JOIN users u ON fu.agent_id = u.id 
      WHERE fu.field_id = $1 
      ORDER BY fu.created_at DESC
    `, [id]);

    res.json({ success: true, data: rows, message: 'Updates retrieved' });
  } catch (error) {
    console.error('Fetch updates error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});


module.exports = router;
