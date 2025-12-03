const express = require('express');
const {
  isAdmin,
  getPlans,
  getPlan,
  createPlanController,
  updatePlanController,
  deletePlanController,
  getUserUsage,
  getUserPlan,
  updateUserPlan,
} = require('~/server/controllers/AdminController');
const { adminSettingsController } = require('~/server/controllers/AdminSettingsController');
const { adminApiKeyController } = require('~/server/controllers/AdminApiKeyController');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// All admin routes require JWT auth and admin role
router.use(requireJwtAuth);
router.use(isAdmin);

// Plans routes
router.get('/plans', getPlans);
router.get('/plans/:planId', getPlan);
router.post('/plans', createPlanController);
router.put('/plans/:planId', updatePlanController);
router.delete('/plans/:planId', deletePlanController);

// User plan and usage routes
router.get('/users/:userId/usage', getUserUsage);
router.get('/users/:userId/plan', getUserPlan);
router.put('/users/:userId/plan', updateUserPlan);

// Admin settings routes
router.get('/settings/api-config', adminSettingsController.getApiConfig);
router.put('/settings/api-config', adminSettingsController.updateApiConfig);
router.get('/settings/user-keys', adminSettingsController.getUserKeys);
router.delete('/settings/user-keys/:userId/:keyName', adminSettingsController.deleteUserKey);

// Admin API key management routes
router.get('/settings/api-keys', adminApiKeyController.getApiKeys);
router.put('/settings/api-keys', adminApiKeyController.updateApiKey);

module.exports = router;

