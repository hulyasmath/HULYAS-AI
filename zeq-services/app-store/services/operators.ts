// ZEQ OS Operator Service
// TypeScript service for interacting with operator API endpoints

export interface Operator {
  id: string;
  internalId?: string;
  name?: string;
  description: string;
  category: string;
  equation?: string | null;
  parameters?: Record<string, any>;
}

export interface OperatorDetail extends Operator {
  internalId: string;
  categoryCount: number;
  example: {
    operator: string;
    params: Record<string, any>;
    endpoint: string;
  };
}

export interface OperatorExecutionResult {
  operator: string;
  result: {
    value: number | any;
    [key: string]: any;
  };
  metadata: {
    execution_time_ms: number;
    timestamp: number;
  };
  error?: string;
}

export interface OperatorListResponse {
  operators: Operator[];
  count: number;
  total: number;
  categories: Record<string, number>;
}

// API configuration - uses environment variable with localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const DEBUG = import.meta.env.DEV;

/**
 * Execute a single operator with given parameters
 */
export async function executeOperator(
  operatorId: string,
  params: Record<string, any> = {}
): Promise<OperatorExecutionResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/zeq/operators/execute?operator=${encodeURIComponent(operatorId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to execute operator ${operatorId}`);
  }

  return response.json();
}

/**
 * List all available operators with optional category filter
 */
export async function listOperators(category?: string): Promise<OperatorListResponse> {
  const url = `${API_BASE_URL}/api/zeq/operators${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch operators: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // Debug logging only in development
    if (DEBUG && data.operators) {
      console.log(`Fetched ${data.count} of ${data.total} operators`);
    }

    return data;
  } catch (error: any) {
    if (DEBUG) {
      console.error('Error fetching operators:', error.message);
    }
    throw error;
  }
}

/**
 * Get detailed information about a specific operator
 */
export async function getOperatorDetails(operatorId: string): Promise<OperatorDetail> {
  const response = await fetch(`${API_BASE_URL}/api/zeq/operators/${encodeURIComponent(operatorId)}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Operator ${operatorId} not found`);
    }
    throw new Error('Failed to fetch operator details');
  }

  return response.json();
}

/**
 * Operator category constants
 */
export const OPERATOR_CATEGORIES = {
  KINEMATIC: 'kinematic',
  QUANTUM: 'quantum',
  NEWTONIAN: 'newtonian',
  RELATIVITY: 'relativity',
  COMPUTATIONAL: 'computational',
  CONSCIOUSNESS: 'consciousness',
  COSMIC: 'cosmic',
  DIFFERENTIAL: 'differential',
  TEMPORAL: 'temporal',
  SPECIAL: 'special',
  // Industry domains (v4.0)
  AEROSPACE: 'aerospace',
  ENGINEERING: 'engineering',
  ENERGY: 'energy',
  FINANCE: 'finance',
  MEDICAL: 'medical',
  ENVIRONMENTAL: 'environmental',
  MATERIAL: 'material',
  BIOTECH: 'biotech',
  QUANTUM_COMPUTING: 'quantum_computing',
  ROBOTICS: 'robotics',
  NEUROSCIENCE: 'neuroscience',
  ASTRONOMY: 'astronomy',
  OTHER: 'other',
} as const;

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    kinematic: 'Kinematic Operators',
    quantum: 'Quantum Mechanics',
    newtonian: 'Newtonian Mechanics',
    relativity: 'General Relativity',
    computational: 'Computer Science',
    consciousness: 'Consciousness Awareness',
    cosmic: 'Cosmic Microwave Background',
    differential: 'Differential Equations',
    temporal: 'Temporal Operators',
    special: 'Special Operators',
    // Industry domains (v4.0)
    aerospace: 'Aerospace Engineering',
    engineering: 'Structural Engineering',
    energy: 'Energy Systems',
    finance: 'Financial Mathematics',
    medical: 'Medical Physics',
    environmental: 'Environmental Science',
    material: 'Material Science',
    biotech: 'Biotechnology',
    quantum_computing: 'Quantum Computing',
    robotics: 'Robotics & Kinematics',
    neuroscience: 'Neuroscience',
    astronomy: 'Astronomy & Astrophysics',
    other: 'Other Operators',
  };
  return names[category] || category;
}

/**
 * Get example parameters for common operators
 */
export function getExampleParams(operatorId: string): Record<string, any> {
  const examples: Record<string, Record<string, any>> = {
    // Core operators
    KO1: { x: 1.0, y: 2.0, z: 3.0 },
    KO2: { vx: 1.0, vy: 2.0, vz: 3.0 },
    QM1: { m: 9.10938356e-31, V: 0.0, psi: 1.0, x: 0.0, t: 0.0 },
    NM19: { m: 1.0, a: 9.81 },
    GR31: { a_grav: 9.81, a_inertial: 9.81 },
    CS43: { n: 1000 },
    CAO1: {
      H_X1_t_given_X1_tminus1: 2.0,
      H_X2_t_given_X2_tminus1: 2.0,
      H_X_t_given_X_tminus1: 3.0,
    },
    // Industry operators (v4.0)
    MED_GFR: { creatinine: 1.2, age: 45, is_female: false, is_african_american: false },
    ORBIT_PERIOD: { semi_major_axis: 1.496e11, central_mass: 1.989e30 },
    BEAM_DEFLECTION: { load: 10000, length: 5, E: 200e9, I: 8.33e-6 },
    SOLAR_POWER: { irradiance: 1000, area: 10, efficiency: 0.2 },
    VAR_MONTE_CARLO: { portfolio_value: 1000000, volatility: 0.2, confidence: 0.95 },
    // Extended operators (v4.0)
    SP1: { signal: [1, 2, 3, 4, 5, 6, 7, 8] },
    CT1: { error: 1.0, integral: 0.5, derivative: 0.1, kp: 2.0, ki: 0.5, kd: 0.1 },
    GP1: { distance: 100, travel_time: 20 },
    PP2: { electron_density: 1e18 },
    HYD1: { roughness: 0.03, hydraulic_radius: 1.5, slope: 0.002, area: 15 },
    APX2: { mass: 1.989e30 },
  };
  return examples[operatorId] || {};
}
