/**
 * Zeq OS Pattern Chips v4 — Educational, Randomized, Responsive
 * Fetches from /api/zeq-patterns/random for fresh patterns each load.
 * Falls back to 32 educational patterns if API unavailable.
 * Mobile: chips between subtitle and input. Desktop: chips below input.
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════
  // 32 EDUCATIONAL FALLBACK PATTERNS (all framework-focused)
  // ═══════════════════════════════════════════════════
  var FALLBACK = [
    // FUNDAMENTALS
    { label: 'The 1.287 Hz HulyaPulse', icon: '📱', prompt: 'Explain the derivation of the 1.287 Hz HulyaPulse frequency. How is it derived from f = c / (2π·r_φ) where r_φ is the golden ratio scaled Planck length? What role does the CMB play in confirming this frequency?' },
    { label: 'The Zeqond', icon: '⏱️', prompt: 'What is a Zeqond and why is it defined as 1/1.287 = 0.777 seconds? Explain the Zeqond-Unix synchronization equation t_Zeq = t_Unix / T_Z + φ_epoch and how ZTB1 enables lossless bidirectional time mapping.' },
    { label: 'Master Equation', icon: '📜', prompt: 'Walk me through the HULYAS Master Equation: □φ − μ²(r)φ − λφ³ − e^(−φ/φ_c) + φ₄₂ Σ C_k(φ) = T^μ_μ + β F_{μν} F^{μν} + J_ext. Explain each term and what it represents physically.' },
    { label: 'Golden Ratio in Physics', icon: '🌀', prompt: 'How does the golden ratio φ = 1.618 appear throughout the Zeq OS mathematical framework? Discuss its role in deriving the HulyaPulse frequency and its connection to Planck-scale physics.' },
    // OPERATORS
    { label: 'KO42 Metric Tensioner', icon: '🔧', prompt: 'Explain the KO42 Metric Tensioner operator. How does ds² = g_{μν} dx^μ dx^ν + α sin(2π·1.287t) dt² synchronize all kinematic operators? Why is KO42 mandatory in the 7-Step Protocol?' },
    { label: 'Quantum Operators QM1-QM17', icon: '⚛️', prompt: 'Describe the quantum operator family QM1 through QM17 in Zeq OS. What does each operator handle? How do they encode superposition, entanglement, and tunneling within the master equation?' },
    { label: 'Classical Operators NM18-NM30', icon: '🌍', prompt: 'Explain Newtonian mechanics operators NM18 through NM30. How do they bridge quantum operators to the classical regime? Include F=ma, energy conservation, and angular momentum.' },
    { label: 'Relativity Operators GR31-GR41', icon: '🌌', prompt: 'Describe general relativity operators GR31 through GR41. How do they encode spacetime curvature, gravitational waves, and the Friedmann equation? How are they synchronized through KO42?' },
    // APPLICATIONS
    { label: 'Bumblebee Flight', icon: '🐝', prompt: 'How does the Zeq OS framework solve the bumblebee flight paradox? Use the master equation to model aerodynamics showing vortex shedding, wing flexibility, and unsteady airflow. Which operators are involved?' },
    { label: 'Three-Body Problem', icon: '☄️', prompt: 'Demonstrate how the Zeq OS master equation approaches the three-body problem. How do GR31-GR41 and NM18-NM30 work together? Can the framework predict chaotic trajectories?' },
    { label: 'Quantum Computing', icon: '💻', prompt: 'How can Zeq OS simulate quantum computing operations? Explain how qubit states map to QM1-QM17, how entanglement is represented, and how quantum gates are modeled as operator transformations at 1.287 Hz.' },
    { label: 'Gravitational Waves', icon: '🌊', prompt: 'How does the Zeq framework model gravitational wave propagation? Use GR31-GR41 to explain how spacetime perturbations propagate and how KO42 maintains measurement precision.' },
    // CONSCIOUSNESS
    { label: 'Consciousness Field', icon: '🧠', prompt: 'Explain the Zeq OS consciousness field theory. How is consciousness modeled as a mathematical field ψ_c synchronized at 1.287 Hz? How does the ON0 awareness operator quantify consciousness?' },
    { label: 'Truth Vector', icon: '🎯', prompt: 'What is the Truth Vector in Zeq OS? Explain its three components: consciousnessField, informationIntegrity, and crossDomainHarmony. How do they combine to produce a unified metric of truth?' },
    { label: 'Information Integration', icon: '🧵', prompt: 'How does Zeq OS relate to Integrated Information Theory? Compare the framework\'s consciousness operators with Tononi\'s Φ measure. How does the HulyaPulse provide a temporal substrate for integration?' },
    { label: 'Observer-System Coupling', icon: '🔭', prompt: 'How does the Zeq framework handle the measurement problem? Explain how ψ_c couples with quantum operators through the master equation and how 1.287 Hz synchronization affects decoherence.' },
    // QUANTUM
    { label: 'Quantum Coherence', icon: '🔬', prompt: 'How does the 1.287 Hz HulyaPulse maintain quantum coherence across macroscopic scales? Explain how phase-locking prevents decoherence and what experimental predictions this makes.' },
    { label: 'Entanglement Dynamics', icon: '🔗', prompt: 'How are quantum entanglement dynamics modeled in Zeq OS? Which operators handle Bell state preparation and non-local correlations? How does Σ C_k(φ) encode entangled states?' },
    { label: 'Quantum-Classical Transition', icon: '🌉', prompt: 'How does Zeq OS model the quantum-to-classical transition? At what scale do QM1-QM17 hand off to NM18-NM30? How does KO42 ensure phase coherence during this transition?' },
    // RELATIVITY
    { label: 'Spacetime Curvature', icon: '🥏', prompt: 'How does Zeq OS represent spacetime curvature? Explain how T^μ_μ in the master equation relates to Einstein field equations and how GR31-GR41 encode metric tensor components.' },
    { label: 'Time Dilation & Zeqond', icon: '⌛', prompt: 'How does relativistic time dilation interact with the Zeqond? If an observer moves at relativistic speeds, does their Zeqond period change? How does ZTB1 handle Lorentz-transformed coordinates?' },
    { label: 'Black Hole Paradox', icon: '🕳️', prompt: 'How does the Zeq OS master equation address the black hole information paradox? Can ψ_c preserve information through an event horizon? What does the framework predict about Hawking radiation?' },
    // COMPUTATION
    { label: '7-Step Wizard', icon: '🧙', prompt: 'Explain the Zeq OS 7-Step Wizard Protocol: (1) KO42 mandatory, (2) select 1-3 operators, (3) match scale, (4) tune to ≤0.1% error, (5) compile via Master Equation, (6) execute via Functional Equation, (7) verify.' },
    { label: 'Phase-Locked Computation', icon: '⚡', prompt: 'What does it mean for computation to be phase-locked at 1.287 Hz? How does Zeq OS synchronize computational steps to the HulyaPulse? Compare this to conventional clock-driven computation.' },
    { label: 'Zeqond Daemon', icon: '👾', prompt: 'Describe the Zeqond Daemon architecture. How does it maintain continuous 1.287 Hz pulses? What is its role in synchronizing the App Store, Chrome MI extension, and SDK components?' },
    // HULYAS
    { label: 'Mathematical Intelligence', icon: '🤖', prompt: 'What is HULYAS (Hierarchical Unified Lagrangian Yielding Adaptive Symmetries)? How does it use 1549+ kinematic operators at 1.287 Hz to achieve mathematical intelligence rather than statistical pattern matching?' },
    { label: 'Operator C_k(φ) Architecture', icon: '🏗️', prompt: 'Explain the C_k(φ) operator architecture in HULYAS. How are the 1549+ kinematic operators organized into families (QM, NM, GR, CO, EM, TH)? How does each operator receive φ and weight?' },
    { label: 'CMB → 1.287 Hz Derivation', icon: '🌟', prompt: 'Derive the 1.287 Hz HulyaPulse from the Cosmic Microwave Background. Show the math from CMB temperature T = 2.725K through blackbody peak frequency to the fundamental pulse frequency.' },
    // AWARENESS OPERATORS
    { label: 'Awareness Operators', icon: '👁️', prompt: 'Explain the Zeq OS awareness operators: ON0, QL1, TM1, TX, XI1, LZ1, CHI95, PSI96. What does each measure? How do they quantify different aspects of system awareness and consciousness?' },
    { label: 'ZEQ-PROTECT Operators', icon: '🛡️', prompt: 'What are ZEQ-PROTECT-001 and ZEQ-PROTECT-002? Explain P(t) = |sin(5φ(t))| / f_pulse and Protect₂(t) = 0.5 + 0.3sin(t/30). How do they safeguard computational integrity?' },
    { label: 'Shannon Entropy (CS47)', icon: '📊', prompt: 'Explain the CS47 Shannon entropy operator E(n) = -Σ p(x) log p(x) in the Zeq OS framework. How does information entropy connect to the 42+ kinematic operators and computational complexity?' },
    { label: 'Functional Equation', icon: '📐', prompt: 'Explain the HULYAS Functional Equation E = P_φ · Z(M, R, δ, C, X). What do each of the parameters represent? How does this equation connect the Master Equation output to observable predictions?' }
  ];

  // ═══════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════
  var activePatterns = null; // Loaded patterns (from API or fallback)
  var fetchAttempted = false;

  // ═══════════════════════════════════════════════════
  // FISHER-YATES SHUFFLE
  // ═══════════════════════════════════════════════════
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ═══════════════════════════════════════════════════
  // FETCH PATTERNS FROM API (or use shuffled fallback)
  // ═══════════════════════════════════════════════════
  function loadPatterns(callback) {
    if (activePatterns) { callback(activePatterns); return; }
    if (fetchAttempted) { callback(shuffle(FALLBACK).slice(0, 8)); return; }
    fetchAttempted = true;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/zeq-patterns/random?count=8', true);
    xhr.timeout = 4000;
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (Array.isArray(data) && data.length > 0) {
            activePatterns = data.map(function(p) {
              return { label: p.title || 'Pattern', icon: p.icon || '🔮', prompt: p.content || '' };
            });
            callback(activePatterns);
            return;
          }
        } catch(e) { /* parse error, use fallback */ }
      }
      // API returned empty or error — use shuffled fallback
      activePatterns = shuffle(FALLBACK).slice(0, 8);
      callback(activePatterns);
    };
    xhr.onerror = xhr.ontimeout = function() {
      activePatterns = shuffle(FALLBACK).slice(0, 8);
      callback(activePatterns);
    };
    xhr.send();
  }

  // ═══════════════════════════════════════════════════
  // CSS (with responsive rules)
  // ═══════════════════════════════════════════════════
  var css = document.createElement('style');
  css.textContent = [
    '#zeq-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 4px;max-width:768px;margin:0 auto;justify-content:center}',
    '.zc{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:16px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;border:1px solid transparent;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;user-select:none;background:none;color:inherit}',
    '.zc i{font-size:13px;font-style:normal}',
    'html:not(.dark) .zc{background:#f3f4f6;color:#374151;border-color:#e5e7eb}',
    'html:not(.dark) .zc:hover{background:#e0e7ff;border-color:#818cf8;color:#3730a3}',
    '.dark .zc{background:#1f2937;color:#d1d5db;border-color:#374151}',
    '.dark .zc:hover{background:#312e81;border-color:#6366f1;color:#c7d2fe}',
    '.zc:active{transform:scale(.96)}',
    /* Mobile: hide chips 7+ (show 6), tighter spacing */
    '@media(max-width:767px){.zc:nth-child(n+7){display:none}#zeq-chips{gap:4px;padding:12px 8px}}'
  ].join('');
  document.head.appendChild(css);

  // ═══════════════════════════════════════════════════
  // CLICK HANDLER: hide chips, fill textarea, click send
  // ═══════════════════════════════════════════════════
  function onChipClick(prompt) {
    var el = document.getElementById('zeq-chips');
    if (el) el.remove();

    var ta = document.querySelector('form textarea');
    if (!ta) return;
    var set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(ta, prompt);
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    setTimeout(function() {
      var btn = document.querySelector('form button[type="submit"], form button[data-testid="send-button"]');
      if (!btn) btn = ta.closest('form').querySelector('button:last-of-type');
      if (btn) btn.click();
    }, 100);
  }

  // ═══════════════════════════════════════════════════
  // BUILD CHIP CONTAINER
  // ═══════════════════════════════════════════════════
  function buildChips(patterns) {
    var div = document.createElement('div');
    div.id = 'zeq-chips';
    patterns.forEach(function(p) {
      var b = document.createElement('button');
      b.className = 'zc';
      b.type = 'button';
      b.innerHTML = '<i>' + p.icon + '</i><span>' + p.label + '</span>';
      b.onclick = function() { onChipClick(p.prompt); };
      div.appendChild(b);
    });
    return div;
  }

  // ═══════════════════════════════════════════════════
  // POLL: show on empty new chat, responsive positioning
  // ═══════════════════════════════════════════════════
  setInterval(function() {
    var path = window.location.pathname;
    var isNewRoute = path === '/c/new' || path === '/';
    var hasMessages = !!document.querySelector('.markdown, [class*="agent-turn"], [data-message-author-role]');
    var shouldShow = isNewRoute && !hasMessages;
    var exists = document.getElementById('zeq-chips');

    if (shouldShow && !exists) {
      var form = document.querySelector('form');
      if (!form) return;

      loadPatterns(function(patterns) {
        // Double-check still needed (async gap)
        if (document.getElementById('zeq-chips')) return;
        var chips = buildChips(patterns);
        var isMobile = window.innerWidth < 768;
        if (isMobile) {
          // Mobile: insert BEFORE form (between subtitle and input)
          form.parentNode.insertBefore(chips, form);
        } else {
          // Desktop: insert AFTER form (below input)
          form.parentNode.insertBefore(chips, form.nextSibling);
        }
      });
    } else if (!shouldShow && exists) {
      exists.remove();
    }
  }, 400);

  // ═══════════════════════════════════════════════════
  // RESET on navigation (new patterns on each page visit)
  // ═══════════════════════════════════════════════════
  var lastPath = window.location.pathname;
  setInterval(function() {
    var currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      // Reset so next visit to /c/new fetches fresh patterns
      activePatterns = null;
      fetchAttempted = false;
    }
  }, 500);

})();
