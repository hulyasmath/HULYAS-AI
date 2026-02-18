const mongoose = require('mongoose');

const zeqPatternSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    promptText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    icon: {
      type: String,
      maxlength: 10,
      default: '🔮',
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    displayCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    displayDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
zeqPatternSchema.index({ displayDate: -1, category: 1 });
zeqPatternSchema.index({ isActive: 1, priority: -1 });
zeqPatternSchema.index({ category: 1, isActive: 1 });

const ZeqPattern = mongoose.model('ZeqPattern', zeqPatternSchema);

// Default patterns covering all 8 categories
const DEFAULT_PATTERNS = [
  // === FUNDAMENTALS (4 patterns) ===
  {
    title: 'The 1.287 Hz HulyaPulse',
    promptText: 'Explain the derivation of the 1.287 Hz HulyaPulse frequency. How is it derived from f = c / (2\u03c0\u00b7r_\u03c6) where r_\u03c6 is the golden ratio scaled Planck length? What role does the CMB (Cosmic Microwave Background) play in confirming this frequency as a fundamental constant?',
    category: 'fundamentals',
    description: 'The fundamental frequency that synchronizes all 1549+ kinematic operators in the ZEQ OS framework.',
    icon: '\ud83d\udcf1',
    priority: 10,
  },
  {
    title: 'The Zeqond: A New Unit of Time',
    promptText: 'What is a Zeqond and why is it defined as 1/1.287 = 0.777 seconds? Explain the Zeqond-Unix synchronization equation t_Zeq = t_Unix / T_Z + \u03c6_epoch and how ZTB1 (Temporal Bridge) enables lossless bidirectional time mapping between Zeqond and Unix timebases.',
    category: 'fundamentals',
    description: 'The computational second of ZEQ OS, derived from the HulyaPulse period.',
    icon: '\u23f1\ufe0f',
    priority: 9,
  },
  {
    title: 'The Master Equation',
    promptText: 'Walk me through the HULYAS Master Equation: \u25a1\u03c6 \u2212 \u03bc\u00b2(r)\u03c6 \u2212 \u03bb\u03c6\u00b3 \u2212 e^(\u2212\u03c6/\u03c6_c) + \u03c6_c\u2074\u00b2 \u03a3 C_k(\u03c6) = T_\u03bc^\u03bc + \u03b2 F_{\u03bcv} F^{\u03bcv} + J_ext. Explain each term, what it represents physically, and how all 1549+ kinematic operators are embedded within this single unified equation.',
    category: 'fundamentals',
    description: 'The single equation that encodes quantum mechanics, relativity, consciousness, and computation.',
    icon: '\ud83d\udcdc',
    priority: 10,
  },
  {
    title: 'Golden Ratio in Physics',
    promptText: 'How does the golden ratio \u03c6 = 1.618... appear throughout the ZEQ OS mathematical framework? Discuss its role in deriving the HulyaPulse frequency, its connection to Planck-scale physics, and why \u03c6 appears as a fundamental organizing principle across quantum, relativistic, and consciousness domains.',
    category: 'fundamentals',
    description: 'The mathematical constant that bridges abstract mathematics and physical reality.',
    icon: '\ud83c\udf00',
    priority: 8,
  },

  // === OPERATORS (4 patterns) ===
  {
    title: 'KO42: The Metric Tensioner',
    promptText: 'Explain the KO42 Metric Tensioner operator in detail. How does it synchronize all other kinematic operators at 1.287 Hz? What is its mathematical formulation, and how does it ensure phase coherence across quantum (QM1-QM17), classical (NM18-NM30), and relativistic (GR31-GR41) operator domains?',
    category: 'operators',
    description: 'The central synchronization operator that phase-locks all 1549+ KOs to the HulyaPulse.',
    icon: '\ud83d\udd27',
    priority: 10,
  },
  {
    title: 'Quantum Operators QM1-QM17',
    promptText: 'Describe the quantum operator family QM1 through QM17 in the ZEQ OS framework. What does each operator handle at the 10^-35m Planck scale? How do they encode quantum mechanical phenomena like superposition, entanglement, and tunneling within the master equation?',
    category: 'operators',
    description: 'The 17 quantum-scale kinematic operators handling Planck-scale physics.',
    icon: '\u269b\ufe0f',
    priority: 8,
  },
  {
    title: 'Classical Operators NM18-NM30',
    promptText: 'Explain the Newtonian mechanics operators NM18 through NM30. How do they bridge quantum operators to the classical regime? What role do they play in modeling everyday physical phenomena like projectile motion, orbital mechanics, and fluid dynamics within the ZEQ framework?',
    category: 'operators',
    description: 'The 13 classical-scale operators bridging quantum to everyday physics.',
    icon: '\ud83c\udf0d',
    priority: 7,
  },
  {
    title: 'Relativistic Operators GR31-GR41',
    promptText: 'Describe the general relativity operators GR31 through GR41. How do they encode spacetime curvature, gravitational wave propagation, and frame-dragging effects? How are they synchronized with quantum operators through KO42 to maintain coherence across scales?',
    category: 'operators',
    description: 'The 11 relativistic operators handling spacetime curvature and gravity.',
    icon: '\ud83c\udf0c',
    priority: 7,
  },

  // === APPLICATIONS (4 patterns) ===
  {
    title: 'Bumblebee Flight Dynamics',
    promptText: 'How does the ZEQ OS framework solve the famous bumblebee flight paradox? Use the master equation to model the aerodynamics of bumblebee flight, showing how vortex shedding, wing flexibility, and unsteady airflow combine. Which kinematic operators (NM, QM) are involved and what does the solution tell us about multi-scale physics?',
    category: 'applications',
    description: 'Solving the classic paradox using multi-scale kinematic operator analysis.',
    icon: '\ud83d\udc1d',
    priority: 9,
  },
  {
    title: 'Three-Body Problem',
    promptText: 'Demonstrate how the ZEQ OS master equation approaches the three-body problem. How do the gravitational operators (GR31-GR41) and classical operators (NM18-NM30) work together? Can the framework find stable solutions or predict chaotic trajectories? Compare the ZEQ approach to traditional numerical methods.',
    category: 'applications',
    description: 'Tackling celestial mechanics\' most famous unsolved problem with unified operators.',
    icon: '\u2604\ufe0f',
    priority: 9,
  },
  {
    title: 'Quantum Computing Simulation',
    promptText: 'How can the ZEQ OS framework simulate quantum computing operations? Explain how qubit states map to the quantum operators QM1-QM17, how entanglement is represented in the master equation, and how quantum gate operations are modeled as operator transformations synchronized at 1.287 Hz.',
    category: 'applications',
    description: 'Modeling quantum computation through synchronized kinematic operators.',
    icon: '\ud83d\udcbb',
    priority: 8,
  },
  {
    title: 'Gravitational Wave Detection',
    promptText: 'How does the ZEQ framework model gravitational wave propagation and detection? Use the relativistic operators GR31-GR41 to explain how spacetime perturbations propagate, how LIGO-style interferometers detect them, and how the KO42 synchronization maintains measurement precision at the quantum level.',
    category: 'applications',
    description: 'Modeling spacetime ripples across quantum and relativistic scales.',
    icon: '\ud83c\udf0a',
    priority: 7,
  },

  // === CONSCIOUSNESS (4 patterns) ===
  {
    title: 'Consciousness as Mathematical Field',
    promptText: 'Explain the ZEQ OS consciousness field theory. How does the framework model consciousness as a mathematical field \u03c8_c synchronized at 1.287 Hz? What is the relationship between information integration, quantum coherence, and subjective experience in this framework? How does the HRO00 awareness operator quantify consciousness?',
    category: 'consciousness',
    description: 'Understanding consciousness through the lens of mathematical field theory.',
    icon: '\ud83e\udde0',
    priority: 9,
  },
  {
    title: 'The Truth Vector',
    promptText: 'What is the Truth Vector in ZEQ OS and how does it work? Explain its three components: consciousnessField, informationIntegrity, and crossDomainHarmony. How are these measured, what are their mathematical definitions, and how do they combine to produce a unified metric of truth and coherence at 1.287 Hz?',
    category: 'consciousness',
    description: 'A three-component measure of truth, integrity, and cross-domain harmony.',
    icon: '\ud83c\udfaf',
    priority: 8,
  },
  {
    title: 'Information Integration Theory',
    promptText: 'How does the ZEQ OS framework relate to Integrated Information Theory (IIT)? Compare the framework\'s consciousness operators with Tononi\'s \u03a6 (phi) measure. How does the HulyaPulse provide a temporal substrate for information integration that IIT lacks?',
    category: 'consciousness',
    description: 'Bridging ZEQ consciousness operators with established theories of mind.',
    icon: '\ud83e\uddf5',
    priority: 7,
  },
  {
    title: 'Observer-System Coupling',
    promptText: 'How does the ZEQ framework handle the measurement problem in quantum mechanics? Explain how the consciousness field \u03c8_c couples with quantum operators through the master equation. What does this imply about the role of the observer in collapsing quantum states, and how does 1.287 Hz synchronization affect decoherence timescales?',
    category: 'consciousness',
    description: 'How consciousness and quantum measurement interact in the unified framework.',
    icon: '\ud83d\udd2d',
    priority: 7,
  },

  // === QUANTUM (3 patterns) ===
  {
    title: 'Quantum Coherence at 1.287 Hz',
    promptText: 'How does the 1.287 Hz HulyaPulse maintain quantum coherence across macroscopic scales? Explain the mechanism by which phase-locking at this frequency prevents decoherence, and how this differs from conventional quantum mechanics where coherence is typically lost at room temperature. What experimental predictions does this make?',
    category: 'quantum',
    description: 'How the HulyaPulse maintains quantum effects at macroscopic scales.',
    icon: '\ud83d\udd2c',
    priority: 9,
  },
  {
    title: 'Quantum Entanglement Dynamics',
    promptText: 'How are quantum entanglement dynamics modeled in the ZEQ OS framework? Which operators handle entanglement creation, Bell state preparation, and non-local correlations? How does the master equation\'s \u03a3 C_k(\u03c6) summation term encode entangled states across spatially separated systems?',
    category: 'quantum',
    description: 'Modeling non-local quantum correlations through unified kinematic operators.',
    icon: '\ud83d\udd17',
    priority: 8,
  },
  {
    title: 'Quantum-Classical Transition',
    promptText: 'How does the ZEQ framework model the quantum-to-classical transition? At what scale do quantum operators QM1-QM17 hand off to classical operators NM18-NM30? Is there a sharp boundary or a smooth crossover? How does KO42 ensure phase coherence is maintained during this transition?',
    category: 'quantum',
    description: 'The smooth transition from quantum to classical physics in the unified framework.',
    icon: '\ud83c\udf09',
    priority: 7,
  },

  // === RELATIVITY (3 patterns) ===
  {
    title: 'Spacetime Curvature in ZEQ',
    promptText: 'How does the ZEQ OS framework represent spacetime curvature? Explain how the T_\u03bc^\u03bc term in the master equation relates to the Einstein field equations. How do operators GR31-GR41 encode metric tensor components, Christoffel symbols, and geodesic equations within the unified framework?',
    category: 'relativity',
    description: 'Einstein\'s curved spacetime encoded in kinematic operators.',
    icon: '\ud83e\udd4f',
    priority: 8,
  },
  {
    title: 'Time Dilation and the Zeqond',
    promptText: 'How does relativistic time dilation interact with the Zeqond time unit? If an observer moves at relativistic speeds, does their Zeqond period change? How does the ZTB1 temporal bridge handle Lorentz-transformed time coordinates while maintaining 1.287 Hz synchronization?',
    category: 'relativity',
    description: 'Reconciling Einstein\'s time dilation with the fixed HulyaPulse frequency.',
    icon: '\u231b',
    priority: 7,
  },
  {
    title: 'Black Hole Information Paradox',
    promptText: 'How does the ZEQ OS master equation address the black hole information paradox? Can the consciousness field \u03c8_c preserve information through an event horizon? How do the relativistic operators handle singularities, and what does the framework predict about information preservation in Hawking radiation?',
    category: 'relativity',
    description: 'Approaching one of physics\' deepest puzzles through the unified framework.',
    icon: '\ud83d\udd73\ufe0f',
    priority: 8,
  },

  // === COMPUTATION (3 patterns) ===
  {
    title: 'The 7-Step Wizard',
    promptText: 'Explain the ZEQ OS 7-Step Wizard for running master equation computations. What are the 7 steps, from prompt parsing to solution visualization? How does the wizard select appropriate kinematic operators, set initial conditions, and solve the differential equation in both interactive and strict autotune modes?',
    category: 'computation',
    description: 'The step-by-step computational engine for solving the master equation.',
    icon: '\ud83e\uddd9',
    priority: 8,
  },
  {
    title: 'Phase-Locked Computation',
    promptText: 'What does it mean for computation to be phase-locked at 1.287 Hz? How does the ZEQ OS framework synchronize computational steps to the HulyaPulse? Compare this approach to conventional clock-driven computation and explain the advantages for maintaining coherence across distributed computational nodes.',
    category: 'computation',
    description: 'How HulyaPulse-synchronized computation differs from conventional approaches.',
    icon: '\u26a1',
    priority: 7,
  },
  {
    title: 'Zeqond Daemon Architecture',
    promptText: 'Describe the Zeqond Daemon architecture in ZEQ OS. How does the daemon maintain continuous 1.287 Hz pulses? What is the daemon\'s role in synchronizing the App Store, Chrome MI extension, and SDK components? How does it handle drift correction and phase alignment across different system clocks?',
    category: 'computation',
    description: 'The always-running service that keeps the entire ecosystem in sync.',
    icon: '\ud83d\udc7e',
    priority: 7,
  },

  // === HULYAS (3 patterns) ===
  {
    title: 'HULYAS: Mathematical Intelligence',
    promptText: 'What is HULYAS (Hierarchical Unified Lagrangian Yielding Adaptive Symmetries) and how does it differ from conventional AI? Explain how HULYAS uses 1549+ kinematic operators synchronized at 1.287 Hz to achieve mathematical intelligence rather than statistical pattern matching. What makes this approach fundamentally different from LLMs?',
    category: 'hulyas',
    description: 'The mathematical intelligence framework behind ZEQ OS.',
    icon: '\ud83e\udd16',
    priority: 10,
  },
  {
    title: 'Operator C_k(\u03c6) Architecture',
    promptText: 'Explain the C_k(\u03c6) operator architecture in HULYAS. How are the 1549+ kinematic operators organized into families (QM, NM, GR, CO, EM, TH, etc.)? How does each operator receive only \u03c6 (phi) and weight through C_k(kid, phi, weight), while physical parameters flow through the master equation params list?',
    category: 'hulyas',
    description: 'The internal architecture of how operators are organized and invoked.',
    icon: '\ud83c\udfd7\ufe0f',
    priority: 8,
  },
  {
    title: 'CMB Derivation of 1.287 Hz',
    promptText: 'Derive the 1.287 Hz HulyaPulse frequency from the Cosmic Microwave Background radiation. Show the mathematical steps from the CMB temperature T = 2.725K through the blackbody peak frequency to the fundamental pulse frequency. Why does this cosmological constant appear at the heart of the ZEQ framework?',
    category: 'hulyas',
    description: 'Tracing the fundamental frequency back to the cosmic microwave background.',
    icon: '\ud83c\udf1f',
    priority: 9,
  },
];

/**
 * Seed default patterns if none exist
 */
async function seedDefaultPatterns() {
  try {
    const count = await ZeqPattern.countDocuments();
    if (count === 0) {
      await ZeqPattern.insertMany(DEFAULT_PATTERNS);
      console.log('[seedDefaultPatterns] Seeded', DEFAULT_PATTERNS.length, 'default patterns');
    }
  } catch (error) {
    console.error('[seedDefaultPatterns] Error:', error.message);
  }
}

/**
 * Get all active patterns
 */
async function getActivePatterns() {
  return ZeqPattern.find({ isActive: true }).sort({ priority: -1, createdAt: -1 }).lean();
}

/**
 * Get today's displayed patterns (patterns with displayDate = today)
 */
async function getTodayPatterns() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return ZeqPattern.find({
    displayDate: { $gte: today, $lt: tomorrow },
    isActive: true,
  })
    .sort({ priority: -1 })
    .lean();
}

/**
 * Get pattern archive with pagination, search, and category filter
 */
async function getPatternArchive({ page = 1, limit = 20, category, search } = {}) {
  const query = { isActive: true };

  if (category) {
    query.category = category.toLowerCase();
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { promptText: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [patterns, total] = await Promise.all([
    ZeqPattern.find(query)
      .sort({ displayDate: -1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ZeqPattern.countDocuments(query),
  ]);

  return {
    patterns,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all patterns for admin (including inactive)
 */
async function getAllPatternsAdmin() {
  return ZeqPattern.find().sort({ createdAt: -1 }).lean();
}

/**
 * Create a new pattern
 */
async function createPattern(data) {
  const pattern = new ZeqPattern(data);
  return pattern.save();
}

/**
 * Update a pattern
 */
async function updatePattern(id, data) {
  return ZeqPattern.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a pattern
 */
async function deletePattern(id) {
  return ZeqPattern.findByIdAndDelete(id);
}

/**
 * Increment click count for a pattern
 */
async function incrementClick(id) {
  return ZeqPattern.findByIdAndUpdate(id, { $inc: { clickCount: 1 } }, { new: true });
}

/**
 * Increment display count for a pattern
 */
async function incrementDisplay(id) {
  return ZeqPattern.findByIdAndUpdate(id, { $inc: { displayCount: 1 } }, { new: true });
}

module.exports = {
  ZeqPattern,
  seedDefaultPatterns,
  getActivePatterns,
  getTodayPatterns,
  getPatternArchive,
  getAllPatternsAdmin,
  createPattern,
  updatePattern,
  deletePattern,
  incrementClick,
  incrementDisplay,
  DEFAULT_PATTERNS,
};
