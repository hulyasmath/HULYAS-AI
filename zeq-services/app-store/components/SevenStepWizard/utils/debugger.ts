/**
 * Shared utility functions for the 7-Step Debugger Interface
 */

/**
 * Generate a unique session ID for the debug session
 */
export function generateSessionId(prompt?: string): string {
  const timestamp = Date.now();
  const promptHash = prompt ? prompt.slice(0, 20).replace(/\s+/g, '_') : 'Session';
  return `${promptHash}_Debug_${timestamp.toString(36).slice(-6)}`;
}

/**
 * Format text as debugger console output with > prompt style
 */
export function formatDebuggerLine(text: string, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  return `${indentStr}> ${text}`;
}

/**
 * Extract watch variables from components analysis
 */
export function extractWatchVariables(components: Record<string, any> | null): string[] {
  if (!components) return [];
  
  const variables: string[] = [];
  for (const [key, value] of Object.entries(components)) {
    if (typeof value === 'string' || typeof value === 'number') {
      variables.push(key);
    }
  }
  return variables;
}

/**
 * Map operator IDs to Master Equation C_k indices
 * Based on operator category and ID
 */
export function mapOperatorsToMasterEquation(operatorId: string): { index: number; description: string } | null {
  // Validate input
  if (!operatorId || typeof operatorId !== 'string') {
    return null;
  }
  
  // Special case: KO42, KO42.1, KO42.2 all map to C_42
  if (operatorId === 'KO42' || operatorId === 'KO42.1' || operatorId === 'KO42.2') {
    return {
      index: 42,
      description: 'synchronization'
    };
  }
  
  // Extract category and number from operator ID (e.g., "NM21" -> category "NM", number 21)
  const match = operatorId.match(/^([A-Z]+)(\d+)(?:\.(\d+))?$/);
  if (!match) return null;
  
  const [, category, numStr] = match;
  const num = parseInt(numStr, 10);
  
  // Validate parsed number
  if (isNaN(num) || num < 1) {
    return null;
  }
  
  // Map categories to base indices
  const categoryBases: Record<string, number> = {
    'QM': 1,   // Quantum Mechanics: C_1 to C_17
    'NM': 18,  // Newtonian Mechanics: C_18 to C_30
    'GR': 31,  // General Relativity: C_31 to C_41
    'KO': 42,  // KO42 is special, uses C_42
    'CS': 43,  // Computer Science: C_43+
  };
  
  const base = categoryBases[category] || 0;
  const index = base + (num - (category === 'QM' ? 1 : category === 'NM' ? 18 : category === 'GR' ? 31 : category === 'CS' ? 43 : 0));
  
  // Get description from category
  const descriptions: Record<string, string> = {
    'QM': 'quantum',
    'NM': 'gravity',
    'GR': 'relativity',
    'KO': 'synchronization',
    'CS': 'computation',
  };
  
  return {
    index,
    description: descriptions[category] || 'physics',
  };
}

/**
 * Generate detailed error diagnosis from error_pct and operators
 */
export function generateErrorDiagnosis(
  errorPct: number,
  selectedOperators: Array<{ id: string }>,
  koSettings: Record<string, number>
): {
  problem: string;
  missing: string;
  solution: string;
  suggestedOperators: string[];
  nextSteps: string[];
} {
  const hasRelativity = selectedOperators.some(op => op.id.startsWith('GR'));
  const hasQuantum = selectedOperators.some(op => op.id.startsWith('QM'));
  const hasGravity = selectedOperators.some(op => op.id.startsWith('NM'));
  
  let problem = 'Error exceeds 0.1% threshold';
  let missing = '';
  let solution = '';
  const suggestedOperators: string[] = [];
  const nextSteps: string[] = [];
  
  if (errorPct > 0.5) {
    // High error - likely missing fundamental operators
    if (!hasGravity && !hasRelativity && !hasQuantum) {
      problem = 'Missing fundamental physics operators';
      missing = 'No domain-specific operators selected';
      solution = 'Add at least one kinematic operator (NM, GR, or QM)';
      suggestedOperators.push('NM21', 'GR35');
    } else if (hasRelativity && errorPct > 0.3) {
      problem = 'Relativistic calculation uses simplified formula';
      missing = 'Higher-order relativistic terms';
      solution = 'Add GR34 (geodesic equation) or use full numerical relativity';
      suggestedOperators.push('GR34');
      nextSteps.push('Add GR34: d²xᵐ/dτ² + Γᵐ_αβ dxᵐ/dτ dxᵐ/dτ = 0');
    } else {
      problem = 'Insufficient operator precision or parameter tuning';
      missing = 'Operator weight optimization or additional operators';
      solution = 'Adjust KO weights or switch to KO42.2 (manual mode)';
      nextSteps.push('Switch to KO42.2 (manual mode) for parameter tuning');
      nextSteps.push('Increase simulation resolution');
    }
  } else if (errorPct > 0.1) {
    // Moderate error - tuning needed
    problem = 'Error slightly above threshold';
    missing = 'Fine-tuning of operator weights';
    solution = 'Adjust KO weights or switch to KO42.2 (manual mode)';
    nextSteps.push('Gradually increase β (KO42.2) up to ~2.0');
    nextSteps.push('Reduce overly dominant weights that cause stiffness');
  }
  
  // Add recompile/re-execute steps
  if (suggestedOperators.length > 0) {
    const operatorList = ['KO42', ...selectedOperators.map(op => op.id), ...suggestedOperators].join(' + ');
    nextSteps.push(`Recompile with ${operatorList}`);
    nextSteps.push('Re-execute with higher precision');
  }
  
  return {
    problem,
    missing,
    solution,
    suggestedOperators,
    nextSteps,
  };
}

/**
 * Parse function name from prompt for breakpoint
 */
export function parseBreakpointLocation(prompt: string): string {
  // Extract key terms that might indicate a function/system
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('three body') || lowerPrompt.includes('three-body')) {
    return 'three_body_system(Sun, Earth, Moon)';
  } else if (lowerPrompt.includes('orbit')) {
    return 'orbital_system()';
  } else if (lowerPrompt.includes('fall') || lowerPrompt.includes('dropping')) {
    return 'falling_object_system()';
  } else if (lowerPrompt.includes('quantum')) {
    return 'quantum_system()';
  } else if (lowerPrompt.includes('relativistic')) {
    return 'relativistic_system()';
  }
  
  // Default: create a function name from the prompt
  const sanitized = prompt.slice(0, 40).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  return `${sanitized || 'physics_system'}()`;
}

/**
 * Extract domain tags from components or prompt
 */
export function extractFrameworkTranslation(components: Record<string, any> | null, prompt: string): string {
  if (!components) {
    // Fallback: analyze prompt for domains
    const lowerPrompt = prompt.toLowerCase();
    const domains: string[] = [];
    
    if (lowerPrompt.includes('quantum') || lowerPrompt.includes('wave') || lowerPrompt.includes('electron')) {
      domains.push('Quantum Mechanics');
    }
    if (lowerPrompt.includes('gravity') || lowerPrompt.includes('orbit') || lowerPrompt.includes('newton')) {
      domains.push('Newtonian Mechanics');
    }
    if (lowerPrompt.includes('relativistic') || lowerPrompt.includes('einstein') || lowerPrompt.includes('spacetime')) {
      domains.push('General Relativity');
    }
    
    return domains.length > 0 ? domains.join(' + ') : 'Classical Physics';
  }
  
  // Extract from components
  const domainKeys = Object.keys(components);
  if (domainKeys.length === 0) return 'Physics';
  
  return domainKeys.join(' + ') + ' domains';
}

/**
 * Get operator equation for display
 */
export function getOperatorEquation(operatorId: string, catalog: any): string {
  const op = catalog?.byId?.[operatorId];
  if (!op) return '';
  
  if (op.equation) {
    return op.equation;
  }
  
  // Fallback equations based on operator ID
  if (operatorId === 'KO42' || operatorId === 'KO42.1' || operatorId === 'KO42.2') {
    return 'ds² = g_μν dx^μ dx^ν + α sin(2π · 1.287 t) dt²';
  } else if (operatorId === 'NM21') {
    return 'F = G (m₁ m₂ / r²)';
  } else if (operatorId === 'GR35') {
    return 'Δt = Δt₀ / √(1 − 2GM/(rc²))';
  } else if (operatorId === 'GR34') {
    return 'd²xᵐ/dτ² + Γᵐ_αβ dxᵐ/dτ dxᵐ/dτ = 0';
  }
  
  return op.description || '';
}

// Operator symbol mapping (from Python framework KINEMATIC_OPERATORS)
// For operators not in Python framework (like KO1, KO2), use default symbols based on their descriptions
const OPERATOR_SYMBOLS: Record<string, string> = {
  // Kinematic Operators (KO1-KO41) - not in Python framework, use defaults
  'KO1': 'r', 'KO2': 'v', 'KO3': 'a', 'KO4': 'j', 'KO5': 's', 'KO6': 'θ', 'KO7': 'ω', 'KO8': 'α', 'KO9': 'p', 'KO10': 'L',
  'KO11': 'K', 'KO12': 'K_r', 'KO13': 'v_rel', 'KO14': 'γ', 'KO15': 'p_rel', 'KO16': 'E_rel', 'KO17': 'E', 'KO18': 'F', 'KO19': 'τ', 'KO20': 'I',
  'KO21': 'r', 'KO22': 'v', 'KO23': 'a', 'KO24': 'F', 'KO25': 'E', 'KO26': 'p', 'KO27': 'L', 'KO28': 'T', 'KO29': 'U', 'KO30': 'H',
  'KO31': 'r', 'KO32': 'v', 'KO33': 'a', 'KO34': 'F', 'KO35': 'E', 'KO36': 'p', 'KO37': 'L', 'KO38': 'T', 'KO39': 'U', 'KO40': 'H', 'KO41': 'S',
  // Quantum Mechanics (QM1-QM17)
  'QM1': 'ψ', 'QM2': 'Δp', 'QM3': 'Σcᵢ', 'QM4': '|↑↓⟩', 'QM5': 'Eₙ', 'QM6': '-ψ', 'QM7': 'Ŝ²', 'QM8': 'T', 'QM9': 'λ_dB', 'QM10': 'E_γ',
  'QM11': '[x̂,p̂]', 'QM12': 'γ^μ', 'QM13': 'ℒ', 'QM14': 'n_B', 'QM15': 'n_F', 'QM16': 'Â_H', 'QM17': '|ψ|²',
  // Newtonian Mechanics (NM18-NM30)
  'NM18': 'ΣF⃗', 'NM19': 'F⃗', 'NM20': '-F⃗', 'NM21': 'F_g', 'NM22': 'W', 'NM23': 'K', 'NM24': 'U_g', 'NM25': 'E_t',
  'NM26': 'p⃗', 'NM27': 'Δp⃗', 'NM28': 'L⃗', 'NM29': 'τ⃗', 'NM30': 'F_s',
  // General Relativity (GR31-GR41)
  'GR31': 'a_g≡a_i', 'GR32': 'G_μν', 'GR33': 'EFE', 'GR34': 'Γ^μ_αβ', 'GR35': 'Δt', 'GR36': 'L', 'GR37': 'r_s',
  'GR38': 'h_μν', 'GR39': 'Λ', 'GR40': 'ȧ', 'GR41': 'z',
  // Metric Tensioners (KO42 variants)
  'KO42.1': 'α', 'KO42.2': 'β', 'KO42': 'KO42',
  // Computer Science (CS43-CS45)
  'CS43': 'O(n log n)', 'CS44': 'H', 'CS45': 'O(√n)',
};

/**
 * Generate compiled unique Master Equation for an experiment
 * Uses COMPUTED CKO terms from execution result (koSettings with final weights)
 * This is the actual compiled physics program that was executed
 * Format: Uses operator symbols and COMPUTED weights from koSettings (like CKO equation format)
 * 
 * IMPORTANT: This function uses ONLY the operators in koSettings (computed result),
 * not selectedOperators, to ensure the equation reflects the actual computation.
 */
export function generateCompiledMasterEquation(
  selectedOperators: Array<{ id: string }> | null | undefined,
  koSettings: Record<string, number> | null | undefined
): string {
  // Base template for the Master Equation
  const baseTemplate = '□ϕ − μ²(r)ϕ − λϕ³ − e^(−ϕ/ϕ_c) + ϕ_c⁴²';
  const rhs = '= T_μ^μ + β F_{μν} F^{μν} + J_ext';
  
  // Use ONLY the computed operators from koSettings (the actual execution result)
  // This ensures we show the computed CKO, not just selected operators
  const effectiveKoSettings = koSettings || {};
  
  // If no computed operators, check if we have selected operators as fallback
  if (Object.keys(effectiveKoSettings).length === 0) {
    // Fallback: use selected operators if no computed result yet
    if (!selectedOperators || !Array.isArray(selectedOperators) || selectedOperators.length === 0) {
      return `${baseTemplate} Σ_{k=1}^{42} C_k(ϕ) ${rhs}`;
    }
    // Build from selected operators (pre-execution state)
    const ckoTerms: string[] = [];
    for (const op of selectedOperators) {
      if (!op || !op.id || typeof op.id !== 'string') continue;
      const weight = 1.0; // Default weight before computation
      const symbol = OPERATOR_SYMBOLS[op.id] || op.id;
      ckoTerms.push(`${weight.toFixed(3)}·${symbol}(ϕ)`);
    }
    if (ckoTerms.length === 0) {
      return `${baseTemplate} Σ_{k=1}^{42} C_k(ϕ) ${rhs}`;
    }
    const termsStr = ckoTerms.length === 1 ? ckoTerms[0] : `(${ckoTerms.join(' + ')})`;
    return `${baseTemplate} ${termsStr} ${rhs}`;
  }
  
  // Build CKO-style terms with COMPUTED weights and symbols (like generate_CKO_equation in Python)
  // Use ONLY operators that were actually computed (in koSettings)
  // Group KO42 variants before building terms
  const groupedSettings: Record<string, number> = {};
  const ko42Weight = effectiveKoSettings['KO42'] || 
                     effectiveKoSettings['KO42.1'] || 
                     effectiveKoSettings['KO42.2'] || 0;

  if (ko42Weight > 0) {
    groupedSettings['KO42'] = ko42Weight; // Use canonical 'KO42'
  }

  // Add other operators (excluding KO42 variants)
  for (const [id, weight] of Object.entries(effectiveKoSettings)) {
    if (id === 'KO42' || id === 'KO42.1' || id === 'KO42.2') continue;
    if (weight > 0) {
      groupedSettings[id] = weight;
    }
  }

  // Use groupedSettings instead of effectiveKoSettings
  const sortedOps = Object.entries(groupedSettings)
    .filter(([id, weight]) => weight > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  
  const ckoTerms: string[] = [];
  for (const [operatorId, weight] of sortedOps) {
    if (!operatorId || typeof operatorId !== 'string') continue;
    
    // Get operator symbol
    const symbol = OPERATOR_SYMBOLS[operatorId] || operatorId;
    
    // Format: weight·symbol(ϕ) - matching CKO equation format from Python
    // This is the COMPUTED CKO master equation with actual execution weights
    ckoTerms.push(`${Number(weight).toFixed(3)}·${symbol}(ϕ)`);
  }
  
  // If no computed terms, return default template
  if (ckoTerms.length === 0) {
    return `${baseTemplate} Σ_{k=1}^{42} C_k(ϕ) ${rhs}`;
  }
  
  // Build the unique equation with computed CKO terms
  if (ckoTerms.length === 1) {
    // Single term: 1.500·F⃗(ϕ)
    return `${baseTemplate} ${ckoTerms[0]} ${rhs}`;
  } else {
    // Multiple terms: (1.500·F⃗(ϕ) + 1.000·α(ϕ) + 0.800·ψ(ϕ))
    const termsStr = ckoTerms.join(' + ');
    return `${baseTemplate} (${termsStr}) ${rhs}`;
  }
}
