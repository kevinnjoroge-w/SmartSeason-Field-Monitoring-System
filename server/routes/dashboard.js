const express = require('express');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');
const { withStatusAll } = require('../utils/statusHelper');

const router = express.Router();
router.use(authenticate);

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    let query;
    let params = [];
    
    if (req.user.role === 'admin') {
      query = `SELECT f.*, u.name as agent_name FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id`;
    } else {
      query = `SELECT f.*, u.name as agent_name FROM fields f LEFT JOIN users u ON f.assigned_agent_id = u.id WHERE f.assigned_agent_id = $1`;
      params = [req.user.id];
    }
    
    const { rows: fieldRows } = await pool.query(query, params);
    const fieldsWithStatus = withStatusAll(fieldRows);

    // Initial breakdown maps
    const statusBreakdown = { Active: 0, 'At Risk': 0, Completed: 0 };
    const stageBreakdown = { Planted: 0, Growing: 0, Ready: 0, Harvested: 0 };

    fieldsWithStatus.forEach(f => {
      if (statusBreakdown[f.status] !== undefined) statusBreakdown[f.status]++;
      if (stageBreakdown[f.stage] !== undefined) stageBreakdown[f.stage]++;
    });

    // Recent updates (last 5)
    let updatesQuery;
    let updatesParams = [];
    if (req.user.role === 'admin') {
      updatesQuery = `
        SELECT fu.*, f.name as field_name, u.name as agent_name 
        FROM field_updates fu
        JOIN fields f ON fu.field_id = f.id
        JOIN users u ON fu.agent_id = u.id
        ORDER BY fu.created_at DESC LIMIT 5
      `;
    } else {
      updatesQuery = `
        SELECT fu.*, f.name as field_name, u.name as agent_name 
        FROM field_updates fu
        JOIN fields f ON fu.field_id = f.id
        JOIN users u ON fu.agent_id = u.id
        WHERE f.assigned_agent_id = $1
        ORDER BY fu.created_at DESC LIMIT 5
      `;
      updatesParams = [req.user.id];
    }
    
    const { rows: recentUpdates } = await pool.query(updatesQuery, updatesParams);

    res.json({
      success: true,
      data: {
        totalFields: fieldsWithStatus.length,
        statusBreakdown,
        stageBreakdown,
        recentUpdates
      },
      message: 'Dashboard data retrieved'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

module.exports = router;
