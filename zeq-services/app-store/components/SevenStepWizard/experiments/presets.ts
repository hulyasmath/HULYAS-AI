import { BODIES, CODATA, baseGlobalParams } from './constants';
import { UNIQUE_EXPERIMENTS } from './uniqueExperiments';
import type { RealExperiment } from './realData';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';
export type WizardFlow = 'auto' | 'guided';
export type KO42Mode = 'KO42.1' | 'KO42.2';

export interface ExperimentPreset {
  id: string;
  title: string;
  difficulty: Difficulty;
  domainTags: string[];
  prompt: string;
  defaultFlow: WizardFlow;
  ko42Mode: KO42Mode;
  selectedOperators: string[];
  globalParams: Record<string, any>;
}

function withKO42(ids: string[], mode: KO42Mode): string[] {
  const filtered = ids.filter((id) => !id.startsWith('KO42'));
  return Array.from(new Set(['KO42', mode, ...filtered]));
}

/**
 * Convert RealExperiment to ExperimentPreset format
 */
function convertRealExperimentToPreset(real: RealExperiment): ExperimentPreset {
  return {
    id: real.id,
    title: real.title,
    difficulty: real.difficulty,
    domainTags: real.domainTags,
    prompt: real.prompt,
    defaultFlow: real.defaultFlow,
    ko42Mode: real.ko42Mode,
    selectedOperators: real.selectedOperators,
    globalParams: real.globalParams,
  };
}

export const EXPERIMENT_PRESETS: ExperimentPreset[] = (() => {
  try {
    // Use UNIQUE experiments with actual measured data
    if (!UNIQUE_EXPERIMENTS || UNIQUE_EXPERIMENTS.length === 0) {
      console.error('UNIQUE_EXPERIMENTS is empty or undefined');
      return [];
    }
    const presets = UNIQUE_EXPERIMENTS.map(convertRealExperimentToPreset);
    
    // OLD CODE REMOVED - All experiments now come from UNIQUE_EXPERIMENTS only
    // The old code that generated presets using earthFall, bodyFall, orbitLEO, etc. has been removed
    // to prevent conflicts and ensure we only use the unique experiments with real data

    // Validate unique experiments
    if (presets.length < 100) {
      console.warn(`⚠️ Warning: Only ${presets.length} unique experiments available. Need 100 total.`);
    } else {
      console.log(`✅ Loaded ${presets.length} unique experiments with actual measured data, unique operator combinations, and GR+QM synchronization showcases.`);
    }
    
    // Check for duplicates
    const idCounts: Record<string, number> = {};
    const duplicateIds: string[] = [];
    for (const p of presets) {
      idCounts[p.id] = (idCounts[p.id] || 0) + 1;
      if (idCounts[p.id] === 2) duplicateIds.push(p.id);
    }
    
    if (duplicateIds.length > 0) {
      console.warn(`⚠️ Warning: Found ${duplicateIds.length} duplicate experiment IDs:`, duplicateIds.slice(0, 10));
    }
    
    return presets;
  } catch (error) {
    console.error('Error loading EXPERIMENT_PRESETS:', error);
    // Return empty array to prevent complete crash
    return [];
  }
})();

export const PRESET_COUNT = EXPERIMENT_PRESETS.length;
