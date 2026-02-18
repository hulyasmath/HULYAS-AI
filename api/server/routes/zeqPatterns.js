const express = require('express');
const router = express.Router();
const { SystemRoles } = require('librechat-data-provider');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const {
  getActivePatterns,
  getTodayPatterns,
  getPatternArchive,
  getAllPatternsAdmin,
  createPattern,
  updatePattern,
  deletePattern,
  incrementClick,
} = require('~/models/ZeqPattern');
const { getAllCategories } = require('~/models/ZeqPatternCategory');
const { getRandomMessage, getDailyMessage } = require('~/models/ZeqCoherenceMessage');
const { generateDailyPatterns } = require('~/server/services/ZeqPatternGenerator');

/**
 * Admin middleware - checks if user has ADMIN role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== SystemRoles.ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

// ============================
// PUBLIC ENDPOINTS
// ============================

/**
 * GET /today
 * Returns today's 6 patterns (generates if not yet selected)
 */
router.get('/today', async (req, res) => {
  try {
    let patterns = await getTodayPatterns();

    // If no patterns for today, generate them
    if (!patterns || patterns.length === 0) {
      patterns = await generateDailyPatterns(6);
    }

    res.json(patterns);
  } catch (error) {
    console.error('[zeqPatterns] GET /today error:', error.message);
    res.status(500).json({ message: 'Failed to get today\'s patterns', error: error.message });
  }
});

/**
 * GET /archive
 * Paginated archive with optional category and search filters
 * Query params: page, limit, category, search
 */
router.get('/archive', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const result = await getPatternArchive({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      category,
      search,
    });

    // Include categories in the response for filter UI
    const categories = await getAllCategories();

    res.json({
      patterns: result.patterns,
      categories,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[zeqPatterns] GET /archive error:', error.message);
    res.status(500).json({ message: 'Failed to get pattern archive', error: error.message });
  }
});

/**
 * POST /:id/click
 * Increment click count for a pattern
 */
router.post('/:id/click', async (req, res) => {
  try {
    const pattern = await incrementClick(req.params.id);
    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found' });
    }
    res.json({ success: true, clickCount: pattern.clickCount });
  } catch (error) {
    console.error('[zeqPatterns] POST /:id/click error:', error.message);
    res.status(500).json({ message: 'Failed to track click', error: error.message });
  }
});

/**
 * GET /coherence
 * Returns a coherence message (random or daily)
 * Query params: type (random|daily), defaults to random
 */
router.get('/coherence', async (req, res) => {
  try {
    const { type = 'random' } = req.query;
    let message;

    if (type === 'daily') {
      message = await getDailyMessage();
    } else {
      message = await getRandomMessage();
    }

    if (!message) {
      return res.json({
        _id: null,
        text: 'COHERENCE ACTIVE: The HulyaPulse at 1.287 Hz maintains phase-lock across all kinematic operators.',
        category: 'status',
      });
    }

    res.json(message);
  } catch (error) {
    console.error('[zeqPatterns] GET /coherence error:', error.message);
    res.status(500).json({ message: 'Failed to get coherence message', error: error.message });
  }
});

/**
 * GET /categories
 * Returns all active categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('[zeqPatterns] GET /categories error:', error.message);
    res.status(500).json({ message: 'Failed to get categories', error: error.message });
  }
});

// ============================
// ADMIN ENDPOINTS
// ============================

/**
 * GET /admin/all
 * Get all patterns including inactive (admin only)
 */
router.get('/admin/all', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const patterns = await getAllPatternsAdmin();
    res.json(patterns);
  } catch (error) {
    console.error('[zeqPatterns] GET /admin/all error:', error.message);
    res.status(500).json({ message: 'Failed to get all patterns', error: error.message });
  }
});

/**
 * POST /admin
 * Create a new pattern (admin only)
 */
router.post('/admin', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { title, promptText, category, description, icon, priority, isActive, isAIGenerated } =
      req.body;

    if (!title || !promptText || !category) {
      return res.status(400).json({ message: 'title, promptText, and category are required' });
    }

    const pattern = await createPattern({
      title,
      promptText,
      category: category.toLowerCase(),
      description,
      icon,
      priority: priority || 5,
      isActive: isActive !== false,
      isAIGenerated: isAIGenerated || false,
      createdBy: req.user.id || 'admin',
    });

    res.status(201).json(pattern);
  } catch (error) {
    console.error('[zeqPatterns] POST /admin error:', error.message);
    res.status(500).json({ message: 'Failed to create pattern', error: error.message });
  }
});

/**
 * PUT /admin/:id
 * Update a pattern (admin only)
 */
router.put('/admin/:id', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { title, promptText, category, description, icon, priority, isActive, isAIGenerated } =
      req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (promptText !== undefined) updateData.promptText = promptText;
    if (category !== undefined) updateData.category = category.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isAIGenerated !== undefined) updateData.isAIGenerated = isAIGenerated;

    const pattern = await updatePattern(req.params.id, updateData);
    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found' });
    }

    res.json(pattern);
  } catch (error) {
    console.error('[zeqPatterns] PUT /admin/:id error:', error.message);
    res.status(500).json({ message: 'Failed to update pattern', error: error.message });
  }
});

/**
 * DELETE /admin/:id
 * Delete a pattern (admin only)
 */
router.delete('/admin/:id', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const pattern = await deletePattern(req.params.id);
    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found' });
    }

    res.json({ success: true, message: 'Pattern deleted' });
  } catch (error) {
    console.error('[zeqPatterns] DELETE /admin/:id error:', error.message);
    res.status(500).json({ message: 'Failed to delete pattern', error: error.message });
  }
});

/**
 * POST /admin/approve/:id
 * Toggle active/approved status of a pattern (admin only)
 */
router.post('/admin/approve/:id', requireJwtAuth, isAdmin, async (req, res) => {
  try {
    const { ZeqPattern } = require('~/models/ZeqPattern');
    const pattern = await ZeqPattern.findById(req.params.id);
    if (!pattern) {
      return res.status(404).json({ message: 'Pattern not found' });
    }

    pattern.isActive = !pattern.isActive;
    await pattern.save();

    res.json({
      success: true,
      isActive: pattern.isActive,
      message: pattern.isActive ? 'Pattern approved' : 'Pattern deactivated',
    });
  } catch (error) {
    console.error('[zeqPatterns] POST /admin/approve/:id error:', error.message);
    res.status(500).json({ message: 'Failed to toggle pattern status', error: error.message });
  }
});

module.exports = router;
