const express = require('express');
const router = express.Router();
const workspacesService = require('../services/workspacesService');

router.get('/', async (_req, res) => {
  try {
    const workspaces = await workspacesService.listWorkspaces();
    res.json(workspaces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load workspaces' });
  }
});

module.exports = router;
