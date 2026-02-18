const accessPermissions = require('./accessPermissions');
const assistants = require('./assistants');
const categories = require('./categories');
const endpoints = require('./endpoints');
const staticRoute = require('./static');
const messages = require('./messages');
const memories = require('./memories');
const presets = require('./presets');
const prompts = require('./prompts');
const balance = require('./balance');
const actions = require('./actions');
const banner = require('./banner');
const search = require('./search');
const models = require('./models');
const convos = require('./convos');
const config = require('./config');
const agents = require('./agents');
const roles = require('./roles');
const oauth = require('./oauth');
const files = require('./files');
const share = require('./share');
const tags = require('./tags');
const auth = require('./auth');
const keys = require('./keys');
const user = require('./user');
const mcp = require('./mcp');
// Zeq OS custom routes
const transparency = require('./transparency');
const admin = require('./admin');
const stripe = require('./stripe');
const zeqOperators = require('./zeqOperators');
const zeqProcess = require('./zeqProcess');
const zeqLogs = require('./zeqLogs');
const zeqPatterns = require('./zeqPatterns');
const mcpApiKey = require('./mcpApiKey');
// Optional: load adminAuth and apiKeys if they exist in dev image
let adminAuth, apiKeys;
try { adminAuth = require('./adminAuth'); } catch (e) { adminAuth = null; }
try { apiKeys = require('./apiKeys'); } catch (e) { apiKeys = null; }

module.exports = {
  mcp,
  auth,
  adminAuth,
  keys,
  apiKeys,
  user,
  tags,
  roles,
  oauth,
  files,
  share,
  banner,
  agents,
  convos,
  search,
  config,
  models,
  prompts,
  actions,
  presets,
  balance,
  messages,
  memories,
  endpoints,
  assistants,
  categories,
  staticRoute,
  accessPermissions,
  transparency,
  admin,
  stripe,
  zeqOperators,
  zeqProcess,
  zeqLogs,
  zeqPatterns,
  mcpApiKey,
};
