const mongoose = require('mongoose');
const { createMethods } = require('@librechat/data-schemas');
const methods = createMethods(mongoose);
const { comparePassword } = require('./userMethods');
const {
  findFileById,
  createFile,
  updateFile,
  deleteFile,
  deleteFiles,
  getFiles,
  updateFileUsage,
} = require('./File');
const {
  getMessage,
  getMessages,
  saveMessage,
  recordMessage,
  updateMessage,
  deleteMessagesSince,
  deleteMessages,
} = require('./Message');
const { getConvoTitle, getConvo, saveConvo, deleteConvos } = require('./Conversation');
const { getPreset, getPresets, savePreset, deletePresets } = require('./Preset');
const { File } = require('~/db/models');
const {
  getPlanByName,
  getPlanById,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  seedDefaultPlans,
} = require('./Plan');
const { getTokensUsedMonthly, getRequestsUsedDaily, getUserUsageSummary } = require('./Usage');
const LLMConfig = require('./LLMConfig');

const seedDatabase = async () => {
  await methods.initializeRoles();
  await methods.seedDefaultRoles();
  await methods.ensureDefaultCategories();
  await seedDefaultPlans();
};

module.exports = {
  ...methods,
  seedDatabase,
  comparePassword,
  getTokensUsedMonthly,
  getRequestsUsedDaily,
  getUserUsageSummary,
  findFileById,
  createFile,
  updateFile,
  deleteFile,
  deleteFiles,
  getFiles,
  updateFileUsage,

  getMessage,
  getMessages,
  saveMessage,
  recordMessage,
  updateMessage,
  deleteMessagesSince,
  deleteMessages,

  getConvoTitle,
  getConvo,
  saveConvo,
  deleteConvos,

  getPreset,
  getPresets,
  savePreset,
  deletePresets,

  Files: File,
  // Plan methods
  getPlanByName,
  getPlanById,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  seedDefaultPlans,
  // LLM Config
  LLMConfig,
};
