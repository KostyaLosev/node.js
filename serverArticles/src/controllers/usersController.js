const express = require('express');
const usersService = require('../services/usersService');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/', async (_req, res) => {
  try {
    const users = await usersService.listUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.patch('/:id/role', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const { role } = req.body || {};
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role must be admin or user' });
    }

    const updated = await usersService.updateUserRole(targetId, role);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ id: updated.id, email: updated.email, role: updated.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
