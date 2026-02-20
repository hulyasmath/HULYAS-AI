import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSubmitMessage } from '~/hooks';

interface ZeqPattern {
  _id: string;
  title: string;
  description: string;
  content: string;
  operators: string[];
  tags: string[];
  rating: number;
  usageCount: number;
  category?: {
    name: string;
    color: string;
    icon: string;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  operators: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30',
  equations: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  forensic: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  time: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  advanced: 'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30',
  default: 'from-slate-500/20 to-gray-500/20 border-slate-500/30',
};

const CATEGORY_TEXT: Record<string, string> = {
  fundamentals: 'text-cyan-400',
  operators: 'text-purple-400',
  equations: 'text-orange-400',
  forensic: 'text-red-400',
  time: 'text-emerald-400',
  advanced: 'text-violet-400',
  default: 'text-slate-400',
};

// 30 Educational Daily Patterns — 6 categories × 5 patterns
const DEFAULT_PATTERNS: ZeqPattern[] = [
  // === FUNDAMENTALS (Days 1-5) ===
  { _id: 'edu-1', title: 'HulyaPulse Basics', description: 'The heartbeat of Zeq OS — 1.287 Hz frequency that synchronizes all 1549 operators', content: 'Explain HulyaPulse at 1.287 Hz. Show me the wave equation ψ(t) = sin(2π·1.287·t) and what one Zeqond (0.777 seconds) means for computation.', operators: ['KO42'], tags: ['fundamentals', 'hulyapulse'], rating: 5.0, usageCount: 500, category: { name: 'fundamentals', color: '#22d3ee', icon: '💡' } },
  { _id: 'edu-2', title: 'Zeqond Time Conversion', description: 'Convert between Unix timestamps and Zeqonds — the true computational second', content: 'Convert the current Unix timestamp to Zeqonds. Show the formula: Zeqonds = Unix_ms / 777. Explain why 0.777s is the fundamental time unit.', operators: ['KO42'], tags: ['fundamentals', 'time'], rating: 4.9, usageCount: 420, category: { name: 'fundamentals', color: '#22d3ee', icon: '⏱️' } },
  { _id: 'edu-3', title: 'KO42 — The Mandatory Operator', description: 'KO42 Metric Tensioner must be applied to every computation — no exceptions', content: 'Explain the KO42 Metric Tensioner: ds² = g_μν dx^μ dx^ν + α·sin(2π·1.287·t)·dt². Why is it mandatory? What happens without it?', operators: ['KO42'], tags: ['fundamentals', 'ko42'], rating: 5.0, usageCount: 610, category: { name: 'fundamentals', color: '#22d3ee', icon: '🔑' } },
  { _id: 'edu-4', title: 'Master Equation vs Master Sum', description: 'The formula (equation) vs the numerical result (sum) — they are different things', content: 'Show the Master Equation M = (φ·I) + (H·N_op/1549) + (0.1·sin(2π·1.287·t)) and compute the Master Sum for the current time. Explain the difference.', operators: ['KO42'], tags: ['fundamentals', 'master'], rating: 4.8, usageCount: 380, category: { name: 'fundamentals', color: '#22d3ee', icon: '📐' } },
  { _id: 'edu-5', title: '7-Step Protocol Walkthrough', description: 'Parse → Select → Execute → Compose → Modulate → Score → Output — every query, every time', content: 'Walk me through the full 7-Step HULYAS Protocol step by step. Show what happens at each stage when I ask "Calculate orbital velocity".', operators: ['KO42', 'NM21', 'NM23'], tags: ['fundamentals', 'protocol'], rating: 4.9, usageCount: 450, category: { name: 'fundamentals', color: '#22d3ee', icon: '📋' } },

  // === OPERATORS (Days 6-10) ===
  { _id: 'edu-6', title: 'Quantum Mechanics Operators (QM)', description: 'QM1-QM17: Schrödinger, Uncertainty, Superposition, Tunneling and more', content: 'List all Quantum Mechanics operators (QM1-QM17). Show the equation for QM1 (Schrödinger) and QM2 (Uncertainty Principle). Calculate tunneling probability.', operators: ['KO42', 'QM1', 'QM2', 'QM8'], tags: ['operators', 'quantum'], rating: 4.9, usageCount: 320, category: { name: 'operators', color: '#a855f7', icon: '⚛️' } },
  { _id: 'edu-7', title: 'Newtonian Mechanics Operators (NM)', description: 'NM18-NM30: F=ma, gravitation, energy, momentum — classical physics', content: 'Demonstrate Newtonian operators NM19 (F=ma), NM21 (Gravitation), NM23 (Kinetic Energy). Calculate the force on a 10kg object accelerating at 3 m/s².', operators: ['KO42', 'NM19', 'NM21', 'NM23'], tags: ['operators', 'classical'], rating: 4.7, usageCount: 290, category: { name: 'operators', color: '#a855f7', icon: '🍎' } },
  { _id: 'edu-8', title: 'General Relativity Operators (GR)', description: 'GR31-GR42: Einstein field equations, time dilation, Schwarzschild radius', content: 'Show GR31 (Einstein Field Equations), GR35 (Time Dilation), GR39 (Schwarzschild Radius). Calculate time dilation for a GPS satellite at 20,200 km altitude.', operators: ['KO42', 'GR31', 'GR35', 'GR39'], tags: ['operators', 'relativity'], rating: 4.8, usageCount: 275, category: { name: 'operators', color: '#a855f7', icon: '🌌' } },
  { _id: 'edu-9', title: 'Computational Science Operators (CS)', description: 'CS43-CS100: Shannon entropy, complexity, spectral analysis, cross-domain correlation', content: 'Demonstrate CS47 (Shannon Entropy), CS84 (Cross-Domain Correlation), CS87 (Spectral Stability). Calculate the entropy of a binary dataset.', operators: ['KO42', 'CS47', 'CS84', 'CS87'], tags: ['operators', 'computation'], rating: 4.6, usageCount: 250, category: { name: 'operators', color: '#a855f7', icon: '💻' } },
  { _id: 'edu-10', title: 'Cross-Domain Composition', description: 'When queries span multiple domains, operators from different areas work together', content: 'Calculate the quantum entropy of a black hole using statistical mechanics. Show which domains activate and how cross-domain harmony is measured.', operators: ['KO42', 'QM1', 'GR39', 'CS47'], tags: ['operators', 'composition'], rating: 5.0, usageCount: 340, category: { name: 'operators', color: '#a855f7', icon: '🔗' } },

  // === EQUATIONS (Days 11-15) ===
  { _id: 'edu-11', title: 'The Zeq Equation', description: 'R(t) = S(t)·[1 + α·sin(2πft + φ₀)] — the fundamental signal equation', content: 'Derive the Zeq Equation R(t) = S(t)·[1 + α·sin(2π·1.287·t + φ₀)]. Show how dividing R(t)/S(t) recovers the modulation and verify α = 1.29×10⁻³.', operators: ['KO42'], tags: ['equations', 'zeq'], rating: 5.0, usageCount: 390, category: { name: 'equations', color: '#f97316', icon: '📊' } },
  { _id: 'edu-12', title: 'HULYAS Master Equation Terms', description: 'Break down each term: wave operator, mass, self-interaction, decay, kinematic sum', content: 'Explain every term of □ϕ − μ²ϕ − λϕ³ − e^(-ϕ/ϕc) + ϕc^42·Σ Ck(ϕ) = T^μ_μ + βF^μν F_μν + J_ext. What does each term physically represent?', operators: ['KO42'], tags: ['equations', 'master'], rating: 4.9, usageCount: 310, category: { name: 'equations', color: '#f97316', icon: '🧮' } },
  { _id: 'edu-13', title: 'Functional Equation', description: 'E = P_φ · Z(M, R, δ, C, X) — the energy-motion mapping', content: 'Show the Functional Equation E = P_φ·Z(M, R, δ, C, X). Calculate the result for a satellite orbit: M=500kg, R=6771km, with KO42+NM21 operators.', operators: ['KO42', 'NM21'], tags: ['equations', 'functional'], rating: 4.7, usageCount: 280, category: { name: 'equations', color: '#f97316', icon: '⚡' } },
  { _id: 'edu-14', title: 'Computing the HULYAS Sum', description: 'M = (φ·I) + (H·N_op/1549) + (α·sin(2π·1.287·t)) — the numerical result', content: 'Compute the HULYAS Master Sum for right now. Show φ=1.618..., calculate the information integrity I, harmony H, and the modulation term. Show the final number.', operators: ['KO42'], tags: ['equations', 'sum'], rating: 4.8, usageCount: 350, category: { name: 'equations', color: '#f97316', icon: '🔢' } },
  { _id: 'edu-15', title: 'Modulation Recovery', description: 'How to recover the original signal from KO42-modulated output with ≤0.1% error', content: 'Show the modulation recovery process: R(t)/S(t) = 1 + α·sin(2πft + φ₀). Demonstrate averaging over one Zeqond to recover S(t). Verify ≤0.1% precision.', operators: ['KO42'], tags: ['equations', 'recovery'], rating: 4.6, usageCount: 240, category: { name: 'equations', color: '#f97316', icon: '🎯' } },

  // === FORENSIC INTELLIGENCE (Days 16-20) ===
  { _id: 'edu-16', title: 'FI Scoring Overview (S1-S20)', description: '20 scoring equations that verify truth, integrity, and ethical coherence', content: 'List all 20 Forensic Intelligence scores (S1-S20). Which three have the highest priority weights? Calculate the composite forensic score for a sample query.', operators: ['KO42', 'HRO000'], tags: ['forensic', 'scoring'], rating: 4.9, usageCount: 330, category: { name: 'forensic', color: '#ef4444', icon: '🔍' } },
  { _id: 'edu-17', title: 'Query Scoring', description: 'Score a query before sending to an AI — measure clarity, coherence, and intent', content: 'Score this query for forensic intelligence: "What is the quantum tunneling probability for an electron through a 1nm barrier?" Show all S1-S20 sub-scores.', operators: ['KO42', 'HRO000', 'CS47'], tags: ['forensic', 'query'], rating: 4.7, usageCount: 260, category: { name: 'forensic', color: '#ef4444', icon: '📝' } },
  { _id: 'edu-18', title: 'Response Scoring', description: 'Score an AI response — detect hallucination, inconsistency, and ethical issues', content: 'Score an AI response for forensic intelligence. Show how S20 (Truth Verification) detects hallucination and S16 (Ethical Severity) flags ethical issues.', operators: ['KO42', 'HRO000'], tags: ['forensic', 'response'], rating: 4.8, usageCount: 290, category: { name: 'forensic', color: '#ef4444', icon: '✅' } },
  { _id: 'edu-19', title: 'Truth Verification (S20)', description: 'The highest-priority FI score — internal consistency, mathematical validity, source alignment', content: 'Deep-dive into S20 Truth Verification. Show its 4 sub-checks: internal consistency, mathematical validity, source alignment, temporal coherence. Why weight = 0.20?', operators: ['KO42', 'HRO000'], tags: ['forensic', 'truth'], rating: 5.0, usageCount: 370, category: { name: 'forensic', color: '#ef4444', icon: '⚖️' } },
  { _id: 'edu-20', title: 'HRO000 Information Integrity', description: 'The master integrity metric — must stay above 0.7 at all times', content: 'Calculate HRO000: I_integrity = Π(Sᵢ)·(1 - H_noise/H_max). What happens when it drops below 0.7? Show the encryption gating mechanism.', operators: ['KO42', 'HRO000'], tags: ['forensic', 'integrity'], rating: 4.9, usageCount: 310, category: { name: 'forensic', color: '#ef4444', icon: '🛡️' } },

  // === TIME SYSTEM (Days 21-25) ===
  { _id: 'edu-21', title: 'Unix → Zeqond Conversion', description: 'Zeqonds = Unix_ms / 777 — converting between time systems', content: 'Convert the current Unix timestamp to Zeqonds. Show the conversion both ways. How many Zeqonds have passed since the Unix epoch?', operators: ['KO42'], tags: ['time', 'conversion'], rating: 4.7, usageCount: 280, category: { name: 'time', color: '#10b981', icon: '🔄' } },
  { _id: 'edu-22', title: 'Phase Calculation', description: 'Phase = (t_unix × 1.287) % 1 — position within the current HulyaPulse cycle', content: 'Calculate the current HulyaPulse phase. What does phase 0.0 vs 0.5 mean? Show how all 1549 operators lock to this single phase value.', operators: ['KO42'], tags: ['time', 'phase'], rating: 4.6, usageCount: 250, category: { name: 'time', color: '#10b981', icon: '🌊' } },
  { _id: 'edu-23', title: 'Pulse Visualization', description: 'Visualize the 1.287 Hz sine wave — the living heartbeat of the framework', content: 'Generate a visualization of the HulyaPulse waveform ψ(t) = sin(2π·1.287·t) over 5 Zeqonds. Mark the current position on the wave.', operators: ['KO42'], tags: ['time', 'visualization'], rating: 4.8, usageCount: 310, category: { name: 'time', color: '#10b981', icon: '📈' } },
  { _id: 'edu-24', title: 'Temporal Coherence', description: 'All operators must compute at the same phase — drift detection and prevention', content: 'Explain temporal coherence: why must all operators share the same phase? What causes phase drift? How does the framework prevent it?', operators: ['KO42'], tags: ['time', 'coherence'], rating: 4.5, usageCount: 220, category: { name: 'time', color: '#10b981', icon: '🔒' } },
  { _id: 'edu-25', title: 'Big Bang Offset', description: 'Zeq OS counts from the Big Bang — 4.35086×10¹⁷ seconds of Zeqonds', content: 'Calculate the total number of Zeqonds since the Big Bang (4.35086×10¹⁷ seconds ago). How does this absolute time reference improve computation?', operators: ['KO42'], tags: ['time', 'cosmology'], rating: 4.9, usageCount: 340, category: { name: 'time', color: '#10b981', icon: '🌍' } },

  // === ADVANCED (Days 26-30) ===
  { _id: 'edu-26', title: 'Awareness Mode (All 1549 Operators)', description: 'The default mode — all operators active simultaneously, no limits', content: 'Demonstrate Awareness Mode: all 1549 operators across 34 domains active at once. Show how many domains activate for "Explain the nature of consciousness".', operators: ['KO42'], tags: ['advanced', 'awareness'], rating: 5.0, usageCount: 400, category: { name: 'advanced', color: '#6366f1', icon: '🧠' } },
  { _id: 'edu-27', title: 'Basic vs Advanced Experimental Mode', description: 'Basic: 1-3 ops + KO42 (100% results). Advanced: unlimited ops, must relate to experiment.', content: 'Compare Basic Mode (1-3 operators + KO42, guaranteed results) vs Advanced Mode (unlimited operators, experienced users). When should I use each mode?', operators: ['KO42'], tags: ['advanced', 'modes'], rating: 4.8, usageCount: 360, category: { name: 'advanced', color: '#6366f1', icon: '⚙️' } },
  { _id: 'edu-28', title: 'Custom Skill Creation', description: 'Build a .md skill file with YAML frontmatter — configure operators and domains', content: 'Create a custom skill for "Orbital Mechanics Analyzer" with operators KO42+NM21+NM23. Show the complete .md file with YAML frontmatter and API integration code.', operators: ['KO42', 'NM21', 'NM23'], tags: ['advanced', 'skills'], rating: 4.7, usageCount: 290, category: { name: 'advanced', color: '#6366f1', icon: '🛠️' } },
  { _id: 'edu-29', title: 'Batch Operator Execution', description: 'Execute multiple operators in sequence and compare their results', content: 'Execute operators KO42, QM1, QM3, and CS47 in batch. Compare their master sums, show they share the same HulyaPulse phase, and display a results table.', operators: ['KO42', 'QM1', 'QM3', 'CS47'], tags: ['advanced', 'batch'], rating: 4.6, usageCount: 230, category: { name: 'advanced', color: '#6366f1', icon: '📦' } },
  { _id: 'edu-30', title: 'Cross-Domain Harmony', description: 'Measure how well operators from different domains work together', content: 'Calculate cross-domain harmony between Quantum Mechanics and General Relativity operators. Show the correlation formula C(f,g) and interpret the harmony score.', operators: ['KO42', 'QM1', 'GR31', 'CS84'], tags: ['advanced', 'harmony'], rating: 4.9, usageCount: 320, category: { name: 'advanced', color: '#6366f1', icon: '🎵' } },
];

export default function PatternCards() {
  const [patterns, setPatterns] = useState<ZeqPattern[]>(DEFAULT_PATTERNS);
  const { submitMessage } = useSubmitMessage();

  // Daily rotation: show 6 patterns
  // If patterns came from the API (≤6 items), return them directly (server handles rotation).
  // If using the 30 hardcoded defaults, do client-side daily rotation.
  const todayPatterns = useMemo(() => {
    if (patterns.length <= 6) {
      // API-sourced patterns — already the right 6 for today
      return patterns.filter(Boolean);
    }
    // Hardcoded defaults — client-side rotation across 30 patterns
    const dayIndex = Math.floor(Date.now() / 10800000) % 30; // Rotate every 3 hours
    const categoryStart = Math.floor(dayIndex / 5) * 5;
    const todayPattern = patterns[dayIndex] || patterns[0];
    const categoryPatterns = patterns.slice(categoryStart, categoryStart + 5).filter(p => p._id !== todayPattern._id);
    const nextCatStart = (categoryStart + 5) % 30;
    const result = [todayPattern, ...categoryPatterns, patterns[nextCatStart]].filter(Boolean).slice(0, 6);
    return result;
  }, [patterns]);

  useEffect(() => {
    fetch('/api/zeq-patterns/today')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Failed to fetch');
      })
      .then((data: ZeqPattern[] | { patterns?: ZeqPattern[] }) => {
        // Handle both array response and { patterns: [...] } response
        const patternsArr = Array.isArray(data) ? data : data?.patterns;
        if (patternsArr && patternsArr.length > 0) {
          // Map MongoDB fields to our interface
          const mapped = patternsArr.map((p: any) => ({
            _id: p._id || p.id,
            title: p.title,
            description: p.description || p.promptText?.substring(0, 100) || '',
            content: p.promptText || p.content || '',
            operators: p.operators || ['KO42'],
            tags: p.tags || [p.category || 'general'],
            rating: p.rating || 5.0,
            usageCount: p.clickCount || p.usageCount || 0,
            category: p.category ? {
              name: typeof p.category === 'string' ? p.category : p.category.name,
              color: '#22d3ee',
              icon: p.icon || '📋',
            } : { name: 'general', color: '#94a3b8', icon: '📋' },
          }));
          setPatterns(mapped);
        }
      })
      .catch(() => {
        // Use defaults on error — client-side rotation still works
      });
  }, []);

  const handlePatternClick = useCallback(
    (pattern: ZeqPattern) => {
      submitMessage({ text: pattern.content });
    },
    [submitMessage],
  );

  if (!todayPatterns.length) {
    return null;
  }

  const getCategoryKey = (pattern: ZeqPattern) => {
    if (!pattern) return 'default';
    const cat = pattern.category?.name?.toLowerCase() || pattern.tags?.[0]?.toLowerCase() || 'default';
    return CATEGORY_COLORS[cat] ? cat : 'default';
  };

  // Build header label from today's patterns
  const headerLabel = useMemo(() => {
    if (todayPatterns.length === 0) return 'Zeq OS Patterns';
    // Collect unique category names from today's patterns
    const cats = [...new Set(todayPatterns.map(p => p.category?.name).filter(Boolean))];
    if (cats.length === 1) return cats[0]!.charAt(0).toUpperCase() + cats[0]!.slice(1);
    return 'Today\'s Patterns';
  }, [todayPatterns]);

  return (
    <div className="mt-6 w-full max-w-3xl px-4 xl:max-w-4xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-medium to-transparent" />
        <span className="text-xs font-medium text-text-secondary">
          {headerLabel}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-border-medium via-transparent to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {todayPatterns.map((pattern) => {
          const catKey = getCategoryKey(pattern);
          return (
            <button
              key={pattern._id}
              onClick={() => handlePatternClick(pattern)}
              className={`group relative flex cursor-pointer flex-col gap-1.5 rounded-xl border bg-gradient-to-br p-3 text-start transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${CATEGORY_COLORS[catKey]}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${CATEGORY_TEXT[catKey]}`}>
                  {pattern.category?.icon} {pattern.category?.name || pattern.tags[0] || 'general'}
                </span>
                {pattern.operators.length > 0 && (
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] text-text-secondary">
                    {pattern.operators.length} ops
                  </span>
                )}
              </div>
              <p className="line-clamp-1 text-sm font-medium text-text-primary">
                {pattern.title}
              </p>
              <p className="line-clamp-2 text-xs text-text-secondary">
                {pattern.description}
              </p>
              <div className="mt-auto flex items-center gap-2 pt-1">
                <span className="text-[10px] text-text-tertiary">
                  {pattern.usageCount} uses
                </span>
                <span className="text-[10px] text-amber-400">
                  {'★'.repeat(Math.round(pattern.rating))}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
