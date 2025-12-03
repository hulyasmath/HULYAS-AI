const express = require('express');
const router = express.Router();
const { SystemRoles } = require('librechat-data-provider');
const { requireJwtAuth } = require('~/server/middleware');
const { ZeqOperator } = require('~/db/models');
const {
  getZeqOperators,
  createZeqOperator,
  updateZeqOperator,
  deleteZeqOperator,
} = require('~/server/models/ZeqOperator');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== SystemRoles.ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// Admin: list operators with optional filters
router.get('/', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { search, category, tags } = req.query;
    const tagList = typeof tags === 'string' ? tags.split(',') : undefined;
    const operators = await getZeqOperators({
      search,
      category,
      tags: tagList,
    });
    res.status(200).json(operators);
  } catch (error) {
    console.error('[ZeqOperators] GET / error', error);
    res.status(500).json({ message: 'Error fetching operators', error: error.message });
  }
});

// Admin: create operator
router.post('/', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    };
    const operator = await createZeqOperator(data);
    res.status(201).json(operator);
  } catch (error) {
    console.error('[ZeqOperators] POST / error', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Operator name must be unique' });
    }
    res.status(500).json({ message: 'Error creating operator', error: error.message });
  }
});

// Admin: update operator
router.put('/:id', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updatedBy: req.user?._id,
    };
    const operator = await updateZeqOperator(id, updates);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }
    res.status(200).json(operator);
  } catch (error) {
    console.error('[ZeqOperators] PUT /:id error', error);
    res.status(500).json({ message: 'Error updating operator', error: error.message });
  }
});

// Admin: delete operator
router.delete('/:id', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const operator = await deleteZeqOperator(id);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }
    res.status(200).json({ message: 'Operator deleted successfully' });
  } catch (error) {
    console.error('[ZeqOperators] DELETE /:id error', error);
    res.status(500).json({ message: 'Error deleting operator', error: error.message });
  }
});

// Public: read-only list for AI & UI
router.get('/public/list', async (req, res) => {
  try {
    const operators = await ZeqOperator.find({})
      .select('name category equation description tags')
      .sort({ name: 1 })
      .lean();

    res.status(200).json(operators);
  } catch (error) {
    console.error('[ZeqOperators] GET /public/list error', error);
    res.status(500).json({ message: 'Error fetching public operators', error: error.message });
  }
});

module.exports = router;




