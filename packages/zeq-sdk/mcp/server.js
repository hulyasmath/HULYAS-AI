#!/usr/bin/env node
/**
 * Zeq OS SDK MCP Server
 * Exposes the Zeq OS Mathematical Framework to AI through MCP tools
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

// pdf-parse v1.x for PDF text extraction (use local zeq-sdk version)
let pdfParse;
try {
  // Try to load from zeq-sdk's node_modules (v1.x API)
  pdfParse = require(path.join(__dirname, '../node_modules/pdf-parse'));
} catch (e) {
  try {
    // Fallback to regular require
    pdfParse = require('pdf-parse');
  } catch (e2) {
    // pdf-parse not available -- paper tools will return an error
    pdfParse = null;
    console.error('[Zeq SDK] pdf-parse not available - paper reading/searching disabled');
  }
}

// Import SDK
const {
  ZeqProcessor,
  getAllOperators,
  PULSE_FREQUENCY,
  DOMAIN_PATTERNS,
  PulseDaemon,
  getGlobalDaemon,
  DynamicOperatorRegistry,
  getDynamicRegistry,
  createDynamicOperator,
  listDynamicOperators,
  getAllOperatorsIncludingDynamic,
  saveDynamicOperators,
  loadDynamicOperators,
  generateOperatorValidation
} = require('../src/index.js');

// Papers directory (mounted in Docker, configurable via env)
const PAPERS_DIR = process.env.PAPERS_DIR || '/app/zeq-papers';

// Maximum input length for query strings (prevent memory abuse)
const MAX_QUERY_LENGTH = 10000;

// Paper metadata
const PAPER_CATALOG = {
  'spectrum_of_motion': {
    filename: 'HULYAS_MATH_ spectrum_of_motion.pdf',
    title: 'HULYAS MATH: Spectrum of Motion',
    description: 'Mathematical framework for motion spectrum analysis',
    topics: ['motion', 'spectrum', 'mathematics', 'physics'],
  },
  'proper_time_modulation': {
    filename: 'ZEQ OS Universal Proper-Time Modulation 1.287Hz HulyaPulse 777ms Zeqond.pdf',
    title: 'ZEQ OS Universal Proper-Time Modulation',
    description: '1.287Hz HulyaPulse and 777ms Zeqond proper-time modulation system',
    topics: ['proper-time', '1.287Hz', 'HulyaPulse', '777ms', 'Zeqond', 'modulation'],
  },
  'math_1287hz': {
    filename: 'Zeq_OS_HULYAS_ MATH_1.287HZ.pdf',
    title: 'Zeq OS HULYAS MATH 1.287Hz',
    description: 'Core mathematical foundations of the 1.287Hz framework',
    topics: ['1.287Hz', 'mathematics', 'HULYAS', 'framework', 'operators'],
  },
  'litepaper': {
    filename: 'zeq_os_litepaper.pdf',
    title: 'Zeq OS Litepaper',
    description: 'Overview and introduction to Zeq OS Mathematical Intelligence',
    topics: ['overview', 'introduction', 'litepaper', 'Zeq OS'],
  },
};

// PDF text extraction cache (limited to catalog size)
const pdfCache = new Map();
const MAX_PDF_CACHE_SIZE = Object.keys(PAPER_CATALOG).length;

let processor;
try {
  processor = new ZeqProcessor();
} catch (err) {
  console.error(`[Zeq SDK] Failed to initialize ZeqProcessor: ${err.message}`);
  process.exit(1);
}

// Start global pulse daemon
let pulseDaemon;
try {
  pulseDaemon = getGlobalDaemon({ autoStart: true });
} catch (err) {
  console.error(`[Zeq SDK] Failed to initialize PulseDaemon: ${err.message}`);
  process.exit(1);
}

// Dynamic operators storage path (fixed, not user-configurable)
const OPERATORS_FILE = '/app/zeq-operators/dynamic-operators.json';

// Auto-load saved operators on startup
function autoLoadOperators() {
  try {
    const result = loadDynamicOperators(OPERATORS_FILE);
    if (result.success && result.imported > 0) {
      console.error(`[Zeq SDK] Auto-loaded ${result.imported} AI-created operators from ${OPERATORS_FILE}`);
      console.error(`[Zeq SDK] Framework now has ${getAllOperatorsIncludingDynamic().length} total operators`);
    } else if (result.success) {
      console.error(`[Zeq SDK] No saved operators to load (file exists but empty or all already loaded)`);
    }
  } catch (err) {
    // File doesn't exist yet - that's fine, no operators saved yet
    console.error(`[Zeq SDK] No saved operators found at ${OPERATORS_FILE} - starting fresh`);
  }
}

// Run auto-load
autoLoadOperators();

// Helper: validate string input
function validateStringInput(value, fieldName, maxLength = MAX_QUERY_LENGTH) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  return value;
}

// Helper: create error response
function errorResponse(message, isError = true) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ success: false, error: message }, null, 2) }],
    isError,
  };
}

// Create server
const server = new Server(
  {
    name: 'zeq-sdk',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'zeq_process_query',
        description: 'Process a query through the Zeq OS Mathematical Framework with 1549 operators across 34 domains at 1.287 Hz (777ms Zeqond). Returns mathematical analysis including detected domains, active operators, and framework metrics.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The query text to process through the mathematical framework',
              maxLength: MAX_QUERY_LENGTH,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'zeq_get_status',
        description: 'Get the current status of the Zeq OS Mathematical Framework including pulse frequency, operator count, and current phase.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_list_operators',
        description: 'List all available mathematical operators in the Zeq OS Framework.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of operators to return (default: 50, max: 500)',
            },
          },
        },
      },
      {
        name: 'zeq_get_domains',
        description: 'Get all knowledge domains supported by the Zeq OS Framework.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_detect_domains',
        description: 'Detect which mathematical domains are relevant to a given query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The query to analyze for domain detection',
              maxLength: MAX_QUERY_LENGTH,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'zeq_pulse_status',
        description: 'Get the current status of the 1.287 Hz pulse daemon that keeps the framework synchronized.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_list_papers',
        description: 'List all available Zeq OS research papers and documentation. Returns paper titles, descriptions, and topics.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_read_paper',
        description: 'Read the content of a specific Zeq OS research paper. Use zeq_list_papers first to see available papers.',
        inputSchema: {
          type: 'object',
          properties: {
            paper_id: {
              type: 'string',
              description: 'The paper ID (e.g., "spectrum_of_motion", "proper_time_modulation", "math_1287hz", "litepaper")',
              enum: Object.keys(PAPER_CATALOG),
            },
            max_chars: {
              type: 'number',
              description: 'Maximum characters to return (default: 10000, max: 50000)',
            },
          },
          required: ['paper_id'],
        },
      },
      {
        name: 'zeq_search_papers',
        description: 'Search for keywords across all Zeq OS research papers. Returns matching excerpts with context.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (keywords to find in papers)',
              maxLength: 1000,
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of matching excerpts to return (default: 10, max: 50)',
            },
          },
          required: ['query'],
        },
      },
      // === DYNAMIC OPERATOR EXPANSION TOOLS ===
      {
        name: 'zeq_create_operator',
        description: 'Create a new kinematic operator to expand the Zeq OS framework. AI can use this to add new mathematical operators when existing ones are insufficient for a problem domain.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Human-readable name for the operator (e.g., "Consciousness Field Resonance")',
              maxLength: 200,
            },
            code: {
              type: 'string',
              description: 'Unique operator code (e.g., "AI-001", "CUSTOM-42", "CF-01"). Format: 2-10 uppercase letters followed by optional numbers/dots.',
              maxLength: 20,
            },
            formula: {
              type: 'string',
              description: 'Mathematical formula in LaTeX format (e.g., "\\\\psi = \\\\alpha \\\\cdot \\\\sin(2\\\\pi \\\\cdot 1.287t)")',
              maxLength: 2000,
            },
            description: {
              type: 'string',
              description: 'Detailed description of what the operator does and when to use it',
              maxLength: 2000,
            },
            category: {
              type: 'string',
              enum: ['quantum', 'classical', 'relativistic', 'computational', 'consciousness', 'information', 'thermodynamic', 'biological', 'chemical', 'mathematical', 'experimental', 'custom'],
              description: 'Category for the operator',
            },
            domains: {
              type: 'array',
              items: { type: 'string' },
              description: 'Knowledge domains this operator applies to',
            },
            reasoning: {
              type: 'string',
              description: 'Explanation of why this operator is needed and how it extends the framework',
              maxLength: 2000,
            },
          },
          required: ['name', 'code', 'formula'],
        },
      },
      {
        name: 'zeq_list_dynamic_operators',
        description: 'List all dynamically created operators that have been added to the framework.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_get_expansion_stats',
        description: 'Get statistics about framework expansion including dynamic operator counts and categories.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_propose_operator',
        description: 'Propose a new operator for review. Use this when you want to suggest an operator but are not certain it should be immediately created.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Proposed operator name',
              maxLength: 200,
            },
            code: {
              type: 'string',
              description: 'Suggested operator code',
              maxLength: 20,
            },
            formula: {
              type: 'string',
              description: 'Proposed mathematical formula',
              maxLength: 2000,
            },
            description: {
              type: 'string',
              description: 'What the operator would do',
              maxLength: 2000,
            },
            reasoning: {
              type: 'string',
              description: 'Why this operator should be added to the framework',
              maxLength: 2000,
            },
            useCases: {
              type: 'array',
              items: { type: 'string' },
              description: 'Example use cases for this operator',
            },
          },
          required: ['name', 'formula', 'reasoning'],
        },
      },
      {
        name: 'zeq_save_operators',
        description: 'Save all AI-created dynamic operators to persistent storage with simulated validation data. The validation is simulated (not real experimental data) but shows that ≤0.1% precision is achievable. Real experimental validation at 1.287 Hz synchronization is recommended before production use.',
        inputSchema: {
          type: 'object',
          properties: {
            validationType: {
              type: 'string',
              enum: ['simulated', 'none'],
              description: 'Type of validation: simulated (recommended) generates test data showing ≤0.1% precision, none saves without validation',
              default: 'simulated',
            },
            includeValidation: {
              type: 'boolean',
              description: 'Whether to include validation data (default: true)',
              default: true,
            },
          },
        },
      },
      {
        name: 'zeq_load_operators',
        description: 'Load previously saved dynamic operators from persistent storage.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'zeq_validate_operator',
        description: 'Generate simulated validation data for a specific operator, showing KO42-synchronized measurements at 1.287 Hz with ≤0.1% precision.',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'Operator code to validate',
              maxLength: 20,
            },
          },
          required: ['code'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'zeq_process_query': {
        const query = validateStringInput(args.query, 'query');
        const result = processor.processQuery(query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                framework: 'Zeq OS Mathematical Framework',
                version: '1.287 Hz',
                query: result.originalQuery,
                domains: result.domains,
                activeOperators: result.activeOperators,
                operatorCount: result.activeOperators.length,
                totalOperators: result.operatorCount,
                metrics: {
                  informationIntegrity: result.informationIntegrity,
                  crossDomainHarmony: result.crossDomainHarmony,
                  masterSum: result.masterSum,
                },
                truthVector: result.truthVector,
                pulseCycle: result.pulseCycle,
                phase: result.phase,
                processingTimeMs: result.processingTimeMs,
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_get_status': {
        const status = processor.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                ...status,
                pulseFrequency: PULSE_FREQUENCY,
                description: 'Unified mathematical system measuring physical and computational motion across quantum/classical/relativistic scales with 0.1% precision.',
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_list_operators': {
        const limit = Math.max(1, Math.min(Number(args.limit) || 50, 500));
        const operators = getAllOperators().slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                totalOperators: getAllOperators().length,
                showing: operators.length,
                operators: operators,
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_get_domains': {
        const domains = Object.keys(DOMAIN_PATTERNS);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                domainCount: domains.length,
                domains: domains,
                description: 'Knowledge domains supported by the Zeq OS Mathematical Framework for cross-domain reasoning.',
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_detect_domains': {
        const query = validateStringInput(args.query, 'query');
        const { detectDomains } = require('../src/index.js');
        const domains = detectDomains(query);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                query: query,
                detectedDomains: domains,
                domainCount: domains.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_pulse_status': {
        const state = pulseDaemon.getState();
        const stats = pulseDaemon.getStats();
        const syncedTime = pulseDaemon.getSyncedTimestamp();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pulseDaemon: {
                  isRunning: stats.isRunning,
                  frequency: stats.frequency,
                  pulseCount: stats.pulseCount,
                  uptime: `${stats.uptimeSeconds.toFixed(2)}s`,
                  actualFrequency: `${stats.actualFrequency.toFixed(4)} Hz`,
                  frequencyAccuracy: `${(stats.frequencyAccuracy * 100).toFixed(2)}%`,
                },
                currentState: {
                  phase: state.phase,
                  amplitude: state.amplitude,
                  goldenWave: state.goldenWave,
                  harmonicWave: state.harmonicWave,
                  consciousnessField: state.consciousnessField,
                },
                syncedTimestamp: syncedTime,
                description: 'The 1.287 Hz pulse daemon keeps all operators synchronized in a unified mathematical rhythm.',
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_list_papers': {
        const papers = Object.entries(PAPER_CATALOG).map(([id, info]) => {
          const filePath = path.join(PAPERS_DIR, info.filename);
          const exists = fs.existsSync(filePath);
          let fileSize = null;
          if (exists) {
            const stats = fs.statSync(filePath);
            fileSize = `${(stats.size / 1024).toFixed(1)} KB`;
          }
          return {
            id,
            title: info.title,
            description: info.description,
            topics: info.topics,
            filename: info.filename,
            available: exists,
            fileSize,
          };
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                paperCount: papers.length,
                papers,
                usage: 'Use zeq_read_paper with a paper_id to read the full content',
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_read_paper': {
        if (!pdfParse) {
          return errorResponse('PDF parsing is not available - pdf-parse dependency is missing');
        }

        const paperId = validateStringInput(args.paper_id, 'paper_id', 100);
        const maxChars = Math.max(1, Math.min(Number(args.max_chars) || 10000, 50000));

        if (!PAPER_CATALOG[paperId]) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Unknown paper ID: ${paperId}`,
                  availablePapers: Object.keys(PAPER_CATALOG),
                }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const paperInfo = PAPER_CATALOG[paperId];
        const filePath = path.join(PAPERS_DIR, paperInfo.filename);

        if (!fs.existsSync(filePath)) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Paper file not found: ${paperInfo.filename}`,
                  hint: 'Make sure the papers directory is mounted in Docker',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }

        // Check cache first
        if (pdfCache.has(paperId)) {
          const cachedText = pdfCache.get(paperId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  paper: {
                    id: paperId,
                    title: paperInfo.title,
                    description: paperInfo.description,
                  },
                  content: cachedText.substring(0, maxChars),
                  totalChars: cachedText.length,
                  truncated: cachedText.length > maxChars,
                  fromCache: true,
                }, null, 2),
              },
            ],
          };
        }

        // Try to extract text from PDF
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);

          // Cache the extracted text (bounded by catalog size)
          if (pdfCache.size >= MAX_PDF_CACHE_SIZE) {
            const firstKey = pdfCache.keys().next().value;
            pdfCache.delete(firstKey);
          }
          pdfCache.set(paperId, pdfData.text);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  paper: {
                    id: paperId,
                    title: paperInfo.title,
                    description: paperInfo.description,
                    pages: pdfData.numpages,
                  },
                  content: pdfData.text.substring(0, maxChars),
                  totalChars: pdfData.text.length,
                  truncated: pdfData.text.length > maxChars,
                }, null, 2),
              },
            ],
          };
        } catch (pdfError) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Failed to parse PDF: ${pdfError.message}`,
                  paper: {
                    id: paperId,
                    title: paperInfo.title,
                  },
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }

      case 'zeq_search_papers': {
        if (!pdfParse) {
          return errorResponse('PDF parsing is not available - pdf-parse dependency is missing');
        }

        const query = validateStringInput(args.query, 'query', 1000).toLowerCase();
        const maxResults = Math.max(1, Math.min(Number(args.max_results) || 10, 50));
        const results = [];

        for (const [paperId, paperInfo] of Object.entries(PAPER_CATALOG)) {
          const filePath = path.join(PAPERS_DIR, paperInfo.filename);

          if (!fs.existsSync(filePath)) continue;

          let text = pdfCache.get(paperId);

          // If not cached, try to extract
          if (!text) {
            try {
              const dataBuffer = fs.readFileSync(filePath);
              const pdfData = await pdfParse(dataBuffer);
              text = pdfData.text;
              if (pdfCache.size >= MAX_PDF_CACHE_SIZE) {
                const firstKey = pdfCache.keys().next().value;
                pdfCache.delete(firstKey);
              }
              pdfCache.set(paperId, text);
            } catch (e) {
              continue;
            }
          }

          // Search for query in text
          const lowerText = text.toLowerCase();
          let index = 0;
          while ((index = lowerText.indexOf(query, index)) !== -1 && results.length < maxResults) {
            // Extract context around match
            const start = Math.max(0, index - 100);
            const end = Math.min(text.length, index + query.length + 200);
            const excerpt = text.substring(start, end);

            results.push({
              paperId,
              paperTitle: paperInfo.title,
              position: index,
              excerpt: (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : ''),
            });

            index += query.length;
          }

          if (results.length >= maxResults) break;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                query,
                resultCount: results.length,
                results,
              }, null, 2),
            },
          ],
        };
      }

      // === DYNAMIC OPERATOR EXPANSION HANDLERS ===

      case 'zeq_create_operator': {
        try {
          validateStringInput(args.name, 'name', 200);
          validateStringInput(args.code, 'code', 20);
          validateStringInput(args.formula, 'formula', 2000);

          const registry = getDynamicRegistry();
          const result = registry.createOperator({
            name: args.name,
            code: args.code,
            formula: args.formula,
            description: args.description || '',
            category: args.category || 'custom',
            domains: Array.isArray(args.domains) ? args.domains.slice(0, 20) : [],
            reasoning: args.reasoning || '',
            createdBy: 'AI'
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: result.message,
                  operator: result.operator,
                  frameworkExpansion: {
                    aiCreatedOperators: result.aiCreatedOperators,
                    frameworkOperators: result.frameworkOperators,
                    totalOperators: result.totalOperators,
                    expansionNote: 'New operator has been added to the Zeq OS framework and is now available for use.'
                  }
                }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: error.message,
                  hint: 'Ensure code format is like AI-001, CUSTOM-42, or QM99. Code must be unique.'
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
      }

      case 'zeq_list_dynamic_operators': {
        const registry = getDynamicRegistry();
        const operators = registry.listOperators();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                dynamicOperatorCount: operators.length,
                operators: operators,
                note: 'These operators were created dynamically to expand the framework.'
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_get_expansion_stats': {
        const registry = getDynamicRegistry();
        const stats = registry.getStats();
        const history = registry.getHistory().slice(-10); // Last 10 actions

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                stats: stats,
                recentHistory: history,
                capabilities: {
                  canCreateOperators: true,
                  canProposeOperators: true,
                  categories: ['quantum', 'classical', 'relativistic', 'computational', 'consciousness', 'information', 'thermodynamic', 'biological', 'chemical', 'mathematical', 'experimental', 'custom'],
                  codeFormats: ['AI-001', 'CUSTOM-42', 'QM99', 'CF-01']
                }
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_propose_operator': {
        validateStringInput(args.name, 'name', 200);
        validateStringInput(args.formula, 'formula', 2000);
        validateStringInput(args.reasoning, 'reasoning', 2000);

        const registry = getDynamicRegistry();
        const proposal = registry.proposeOperator({
          name: args.name,
          code: args.code || `PROP-${Date.now().toString(36).toUpperCase()}`,
          formula: args.formula,
          description: args.description || '',
          reasoning: args.reasoning,
          useCases: Array.isArray(args.useCases) ? args.useCases.slice(0, 20) : [],
          createdBy: 'AI'
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                proposal: proposal,
                message: 'Operator proposal recorded. Use zeq_create_operator to actually create the operator.',
                nextSteps: [
                  'Review the proposal details',
                  'If approved, use zeq_create_operator with the same parameters',
                  'The operator will then be available in the framework'
                ]
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_save_operators': {
        const result = saveDynamicOperators({
          filePath: OPERATORS_FILE,
          validationType: args.validationType || 'simulated',
          includeValidation: args.includeValidation !== false
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                message: result.message,
                operatorsSaved: result.operatorsSaved,
                frameworkOperators: result.frameworkOperators,
                totalFramework: result.totalFramework,
                validationType: result.validationType,
                fileSaved: result.fileSaved,
                savedPath: result.savedPath,
                savedAt: result.savedAt,
                disclaimer: result.validationType === 'simulated'
                  ? 'SIMULATED VALIDATION - Operators need real experimental testing at 1.287 Hz before production use. Mathematics speaks unequivocally - but these are simulated measurements.'
                  : 'Operators saved without validation',
                nextSteps: result.nextSteps,
                precisionStandard: '≤ 0.1%',
                framework: {
                  frequency: '1.287 Hz',
                  period: '777ms (Zeqond)',
                  ko42Synchronized: true
                }
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_load_operators': {
        // Always use the fixed path -- no user-supplied paths allowed
        const result = loadDynamicOperators(OPERATORS_FILE);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: result.success,
                imported: result.imported,
                errors: result.errors,
                loadedFrom: result.loadedFrom || OPERATORS_FILE,
                savedAt: result.savedAt,
                validationType: result.validationType,
                totalOperators: result.totalOperators,
                message: result.success
                  ? `Successfully loaded ${result.imported} operators`
                  : `Failed to load operators: ${result.error}`
              }, null, 2),
            },
          ],
        };
      }

      case 'zeq_validate_operator': {
        const code = validateStringInput(args.code, 'code', 20);
        const registry = getDynamicRegistry();
        const operator = registry.getOperator(code);

        if (!operator) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: `Operator ${code} not found in dynamic operators`,
                  hint: 'Use zeq_list_dynamic_operators to see available operators'
                }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const validation = generateOperatorValidation(operator);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                operator: {
                  code: operator.code,
                  name: operator.name,
                  formula: operator.formula
                },
                validation: validation,
                message: validation.meetsFrameworkStandard
                  ? `Simulated validation shows ${operator.code} achieves ≤0.1% precision`
                  : `Simulated validation shows ${operator.code} precision needs improvement`,
                reminder: 'This is simulated validation - real experimental testing at 1.287 Hz synchronization is recommended'
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Start pulse daemon
  pulseDaemon.start();

  console.error('Zeq OS SDK MCP Server running');
  console.error(`Pulse Daemon: 1.287 Hz (${pulseDaemon.getStats().targetIntervalMs.toFixed(0)}ms interval)`);
  console.error(`Papers: ${Object.keys(PAPER_CATALOG).length} research papers available`);
  console.error(`PDF parsing: ${pdfParse ? 'available' : 'NOT available'}`);
}

main().catch((err) => {
  console.error(`[Zeq SDK] Fatal error starting MCP server: ${err.message}`);
  process.exit(1);
});
