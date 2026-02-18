/**
 * Zeq OS Features Panel v1.0
 * Injects a floating Zeq OS toolbar into LibreChat with access to:
 * - App Store (28 physics/math/science apps)
 * - Code Sandbox (Python/JS execution)
 * - Forensic Intelligence (detailed FI scores)
 * - Equation Builder (operator equations with LaTeX)
 * - SDK Query (direct framework access)
 */
(function() {
  'use strict';

  // ─── Configuration ─────────────────────────────────────────
  var APPS = [
    { id: 'AeroWindTunnel', name: 'Aero Wind Tunnel', icon: '\u2708\uFE0F', domain: 'Aerodynamics', prompt: 'Using the Zeq OS AeroWindTunnel app, simulate aerodynamic flow analysis for: ' },
    { id: 'BiomechanicsAnalyzer', name: 'Biomechanics', icon: '\uD83E\uDDBF', domain: 'Gait Analysis', prompt: 'Using the Zeq OS BiomechanicsAnalyzer, perform gait and biomechanical analysis for: ' },
    { id: 'ClimateModeler', name: 'Climate Modeler', icon: '\uD83C\uDF0D', domain: 'Climate Science', prompt: 'Using the Zeq OS ClimateModeler, analyze climate patterns for: ' },
    { id: 'CosmicAnalyzer', name: 'Cosmic Analyzer', icon: '\uD83C\uDF0C', domain: 'Cosmology', prompt: 'Using the Zeq OS CosmicAnalyzer, analyze cosmological data for: ' },
    { id: 'EMFields', name: 'EM Fields', icon: '\u26A1', domain: 'Electromagnetism', prompt: 'Using the Zeq OS EMFields simulator, analyze electromagnetic fields for: ' },
    { id: 'FinancialAnalyzer', name: 'Financial Analyzer', icon: '\uD83D\uDCC8', domain: 'Finance', prompt: 'Using the Zeq OS FinancialAnalyzer, perform financial analysis for: ' },
    { id: 'FluidDynamics', name: 'Fluid Dynamics', icon: '\uD83C\uDF0A', domain: 'CFD (D2Q9 LBM)', prompt: 'Using the Zeq OS FluidDynamics CFD simulator (D2Q9 Lattice Boltzmann), simulate fluid flow for: ' },
    { id: 'GenomicsAnalyzer', name: 'Genomics', icon: '\uD83E\uDDEC', domain: 'Bioinformatics', prompt: 'Using the Zeq OS GenomicsAnalyzer, analyze genomic data for: ' },
    { id: 'MaterialsExplorer', name: 'Materials Explorer', icon: '\uD83D\uDD2C', domain: 'Materials Science', prompt: 'Using the Zeq OS MaterialsExplorer, analyze material properties for: ' },
    { id: 'MedicalCalculator', name: 'Medical Calculator', icon: '\u2695\uFE0F', domain: 'Healthcare', prompt: 'Using the Zeq OS MedicalCalculator, compute medical calculations for: ' },
    { id: 'NeuralArchitect', name: 'Neural Architect', icon: '\uD83E\uDDE0', domain: 'Neural Networks', prompt: 'Using the Zeq OS NeuralArchitect, design and analyze neural network architecture for: ' },
    { id: 'NeuralProcessor', name: 'Neural Processor', icon: '\uD83D\uDDA5\uFE0F', domain: 'Neural Computing', prompt: 'Using the Zeq OS NeuralProcessor, process neural computation for: ' },
    { id: 'OceanDynamics', name: 'Ocean Dynamics', icon: '\uD83C\uDF0A', domain: 'Oceanography', prompt: 'Using the Zeq OS OceanDynamics simulator, model ocean currents and dynamics for: ' },
    { id: 'OrbitalPlanner', name: 'Orbital Planner', icon: '\uD83D\uDE80', domain: 'Orbital Mechanics', prompt: 'Using the Zeq OS OrbitalPlanner, calculate orbital trajectories for: ' },
    { id: 'PharmaKinetics', name: 'PharmaKinetics', icon: '\uD83D\uDC8A', domain: 'Pharmacology', prompt: 'Using the Zeq OS PharmaKinetics analyzer, model pharmacokinetic profiles for: ' },
    { id: 'PowerGridAnalyzer', name: 'Power Grid', icon: '\uD83D\uDD0B', domain: 'Energy Systems', prompt: 'Using the Zeq OS PowerGridAnalyzer, analyze power grid dynamics for: ' },
    { id: 'QuantumCircuits', name: 'Quantum Circuits', icon: '\u269B\uFE0F', domain: 'Quantum Computing', prompt: 'Using the Zeq OS QuantumCircuits simulator, design and simulate quantum circuits for: ' },
    { id: 'RLPlayground', name: 'RL Playground', icon: '\uD83C\uDFAE', domain: 'Reinforcement Learning', prompt: 'Using the Zeq OS RLPlayground, train and test reinforcement learning agents for: ' },
    { id: 'RoboticsLab', name: 'Robotics Lab', icon: '\uD83E\uDD16', domain: 'Robotics', prompt: 'Using the Zeq OS RoboticsLab, simulate robotic systems for: ' },
    { id: 'SeismologyStation', name: 'Seismology', icon: '\uD83C\uDF0B', domain: 'Geophysics', prompt: 'Using the Zeq OS SeismologyStation, analyze seismic data for: ' },
    { id: 'SevenStepWizard', name: '7-Step Wizard', icon: '\uD83E\uDDD9', domain: 'Protocol Engine', prompt: 'Run the full Zeq OS 7-Step Wizard Protocol with KO42 mandatory coupling to solve: ' },
    { id: 'SignalClassifier', name: 'Signal Classifier', icon: '\uD83D\uDCE1', domain: 'Signal Processing', prompt: 'Using the Zeq OS SignalClassifier, classify and analyze signals for: ' },
    { id: 'SimulationVisualizer', name: 'Simulation Viz', icon: '\uD83D\uDCCA', domain: 'Physics Viz', prompt: 'Using the Zeq OS SimulationVisualizer, create a visual physics simulation for: ' },
    { id: 'StructuralToolkit', name: 'Structural Toolkit', icon: '\uD83C\uDFD7\uFE0F', domain: 'Structural Engineering', prompt: 'Using the Zeq OS StructuralToolkit, analyze structural integrity for: ' },
    { id: 'ThermoCycles', name: 'ThermoCycles', icon: '\uD83C\uDF21\uFE0F', domain: 'Thermodynamics', prompt: 'Using the Zeq OS ThermoCycles analyzer, model thermodynamic cycles for: ' },
    { id: 'TrafficOptimizer', name: 'Traffic Optimizer', icon: '\uD83D\uDE97', domain: 'Traffic Flow', prompt: 'Using the Zeq OS TrafficOptimizer, optimize traffic flow for: ' },
    { id: 'VehicleDynamics', name: 'Vehicle Dynamics', icon: '\uD83C\uDFCE\uFE0F', domain: 'Automotive', prompt: 'Using the Zeq OS VehicleDynamics simulator, analyze vehicle dynamics for: ' }
  ];

  var TOOLS = [
    { id: 'code-sandbox', name: 'Code Sandbox', icon: '\uD83D\uDCBB', desc: 'Execute Python & JS code', prompt: 'Use the Zeq OS Code Sandbox to write and execute code. ' },
    { id: 'forensic-intel', name: 'Forensic Intelligence', icon: '\uD83D\uDD0D', desc: 'Deep FI analysis', prompt: 'Run a deep Zeq OS Forensic Intelligence analysis on: ' },
    { id: 'equation-builder', name: 'Equation Builder', icon: '\u222B', desc: 'Build custom equations', prompt: 'Using the Zeq OS Equation Builder, construct and solve the mathematical equation for: ' },
    { id: 'sdk-query', name: 'SDK Query', icon: '\u2699\uFE0F', desc: 'Query Zeq OS SDK directly', prompt: 'Query the Zeq OS SDK directly: zeq.process_query for: ' },
    { id: 'operator-explorer', name: 'Operator Explorer', icon: '\uD83D\uDCD0', desc: 'Browse 1549 operators', prompt: 'List and explore Zeq OS operators. Show the full operator registry with equations for domain: ' }
  ];

  // ─── Styles ─────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#zeq-fab { position: fixed; bottom: 80px; right: 20px; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6C3AED, #8B5CF6); border: 2px solid rgba(139,92,246,0.4); color: white; font-size: 22px; cursor: pointer; z-index: 99999; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(108,58,237,0.5); transition: transform 0.2s, box-shadow 0.2s; }',
    '#zeq-fab:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(108,58,237,0.7); }',
    '#zeq-fab.active { background: linear-gradient(135deg, #DC2626, #EF4444); }',
    '#zeq-panel { position: fixed; bottom: 140px; right: 20px; width: 380px; max-height: 520px; background: #1a1a2e; border: 1px solid rgba(139,92,246,0.3); border-radius: 16px; z-index: 99998; display: none; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.6); overflow: hidden; }',
    '#zeq-panel.open { display: flex; }',
    '#zeq-panel-header { padding: 14px 16px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-bottom: 1px solid rgba(139,92,246,0.2); display: flex; align-items: center; gap: 8px; }',
    '#zeq-panel-header h3 { margin: 0; font-size: 14px; color: #e0e0ff; font-family: system-ui, sans-serif; flex: 1; }',
    '#zeq-panel-header .zeq-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: zeqpulse 1.287s infinite; }',
    '@keyframes zeqpulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }',
    '.zeq-tabs { display: flex; border-bottom: 1px solid rgba(139,92,246,0.15); }',
    '.zeq-tab { flex: 1; padding: 8px 4px; text-align: center; font-size: 11px; color: #888; cursor: pointer; border: none; background: transparent; font-family: system-ui, sans-serif; transition: all 0.15s; }',
    '.zeq-tab:hover { color: #c4b5fd; background: rgba(139,92,246,0.1); }',
    '.zeq-tab.active { color: #a78bfa; border-bottom: 2px solid #a78bfa; background: rgba(139,92,246,0.08); }',
    '#zeq-panel-body { overflow-y: auto; padding: 8px; flex: 1; max-height: 380px; }',
    '#zeq-panel-body::-webkit-scrollbar { width: 4px; }',
    '#zeq-panel-body::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }',
    '.zeq-app-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin: 3px 0; border-radius: 10px; cursor: pointer; transition: all 0.15s; background: rgba(255,255,255,0.02); border: 1px solid transparent; }',
    '.zeq-app-card:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.25); }',
    '.zeq-app-icon { font-size: 24px; width: 36px; text-align: center; flex-shrink: 0; }',
    '.zeq-app-info { flex: 1; min-width: 0; }',
    '.zeq-app-name { font-size: 13px; font-weight: 600; color: #e0e0ff; font-family: system-ui, sans-serif; }',
    '.zeq-app-domain { font-size: 11px; color: #6b7280; font-family: system-ui, sans-serif; margin-top: 1px; }',
    '.zeq-app-arrow { color: #6b7280; font-size: 14px; }',
    '.zeq-tool-card { display: flex; align-items: center; gap: 12px; padding: 14px 12px; margin: 4px 0; border-radius: 12px; cursor: pointer; transition: all 0.15s; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.12); }',
    '.zeq-tool-card:hover { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.3); transform: translateX(2px); }',
    '.zeq-tool-icon { font-size: 28px; width: 40px; text-align: center; flex-shrink: 0; }',
    '.zeq-tool-info { flex: 1; }',
    '.zeq-tool-name { font-size: 14px; font-weight: 600; color: #c4b5fd; font-family: system-ui, sans-serif; }',
    '.zeq-tool-desc { font-size: 11px; color: #6b7280; font-family: system-ui, sans-serif; margin-top: 2px; }',
    '.zeq-search { width: 100%; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.15); border-radius: 8px; color: #e0e0ff; font-size: 12px; font-family: system-ui, sans-serif; outline: none; box-sizing: border-box; margin-bottom: 6px; }',
    '.zeq-search::placeholder { color: #555; }',
    '.zeq-search:focus { border-color: rgba(139,92,246,0.4); }',
    '.zeq-status-bar { padding: 6px 12px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(139,92,246,0.1); display: flex; justify-content: space-between; font-size: 10px; color: #555; font-family: monospace; }',
  ].join('\n');
  document.head.appendChild(style);

  // ─── Build DOM ─────────────────────────────────────────
  // FAB button
  var fab = document.createElement('button');
  fab.id = 'zeq-fab';
  fab.innerHTML = '\u269B\uFE0F';
  fab.title = 'Zeq OS Features';

  // Panel
  var panel = document.createElement('div');
  panel.id = 'zeq-panel';
  panel.innerHTML = [
    '<div id="zeq-panel-header">',
    '  <div class="zeq-pulse"></div>',
    '  <h3>Zeq OS Features</h3>',
    '  <span style="font-size:10px;color:#6b7280;font-family:monospace;">v1.287</span>',
    '</div>',
    '<div class="zeq-tabs">',
    '  <button class="zeq-tab active" data-tab="tools">Tools</button>',
    '  <button class="zeq-tab" data-tab="apps">App Store (27)</button>',
    '</div>',
    '<div id="zeq-panel-body"></div>',
    '<div class="zeq-status-bar">',
    '  <span id="zeq-status-pulse">1.287 Hz synced</span>',
    '  <span id="zeq-status-ops">Operators: loading...</span>',
    '</div>'
  ].join('\n');

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var body = document.getElementById('zeq-panel-body');
  var currentTab = 'tools';

  // ─── Tab switching ─────────────────────────────────────────
  panel.querySelectorAll('.zeq-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      panel.querySelectorAll('.zeq-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      renderTab();
    });
  });

  // ─── Render functions ─────────────────────────────────────────
  function renderTab() {
    if (currentTab === 'tools') renderTools();
    else renderApps();
  }

  function renderTools() {
    var html = '';
    TOOLS.forEach(function(tool) {
      html += '<div class="zeq-tool-card" data-prompt="' + escHtml(tool.prompt) + '">';
      html += '  <div class="zeq-tool-icon">' + tool.icon + '</div>';
      html += '  <div class="zeq-tool-info">';
      html += '    <div class="zeq-tool-name">' + tool.name + '</div>';
      html += '    <div class="zeq-tool-desc">' + tool.desc + '</div>';
      html += '  </div>';
      html += '</div>';
    });
    body.innerHTML = html;
    body.querySelectorAll('.zeq-tool-card').forEach(function(card) {
      card.addEventListener('click', function() {
        sendPrompt(card.getAttribute('data-prompt'));
      });
    });
  }

  function renderApps(filter) {
    var html = '<input class="zeq-search" placeholder="Search 27 apps..." id="zeq-app-search" />';
    var filtered = APPS;
    if (filter) {
      var f = filter.toLowerCase();
      filtered = APPS.filter(function(a) {
        return a.name.toLowerCase().indexOf(f) >= 0 || a.domain.toLowerCase().indexOf(f) >= 0;
      });
    }
    filtered.forEach(function(app) {
      html += '<div class="zeq-app-card" data-prompt="' + escHtml(app.prompt) + '">';
      html += '  <div class="zeq-app-icon">' + app.icon + '</div>';
      html += '  <div class="zeq-app-info">';
      html += '    <div class="zeq-app-name">' + app.name + '</div>';
      html += '    <div class="zeq-app-domain">' + app.domain + '</div>';
      html += '  </div>';
      html += '  <div class="zeq-app-arrow">\u203A</div>';
      html += '</div>';
    });
    if (filtered.length === 0) {
      html += '<div style="text-align:center;color:#555;padding:20px;font-size:12px;">No apps match &quot;' + escHtml(filter || '') + '&quot;</div>';
    }
    body.innerHTML = html;

    // Bind search
    var searchEl = document.getElementById('zeq-app-search');
    if (searchEl) {
      if (filter) searchEl.value = filter;
      searchEl.addEventListener('input', function() { renderApps(searchEl.value); });
      if (filter) searchEl.focus();
    }

    // Bind clicks
    body.querySelectorAll('.zeq-app-card').forEach(function(card) {
      card.addEventListener('click', function() {
        sendPrompt(card.getAttribute('data-prompt'));
      });
    });
  }

  // ─── Send prompt to chat ─────────────────────────────────────────
  function sendPrompt(prompt) {
    var ta = document.querySelector('form textarea');
    if (!ta) return;
    var set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(ta, prompt);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    // Close panel but don't auto-send — user adds their specific query
    panel.classList.remove('open');
    fab.classList.remove('active');
  }

  // ─── FAB toggle ─────────────────────────────────────────
  fab.addEventListener('click', function() {
    var isOpen = panel.classList.toggle('open');
    fab.classList.toggle('active', isOpen);
    if (isOpen) renderTab();
  });

  // Close panel on outside click
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== fab) {
      panel.classList.remove('open');
      fab.classList.remove('active');
    }
  });

  // ─── Status bar updates ─────────────────────────────────────────
  function updateStatus() {
    var opsEl = document.getElementById('zeq-status-ops');
    var pulseEl = document.getElementById('zeq-status-pulse');
    if (opsEl) {
      var count = 0;
      if (window.utpFramework && window.utpFramework.operators) {
        count = window.utpFramework.operators.length || 0;
      } else if (window.utpFramework && window.utpFramework.operatorCount) {
        count = window.utpFramework.operatorCount;
      }
      opsEl.textContent = 'Operators: ' + (count || '...') + ' | Apps: 27';
    }
    if (pulseEl) {
      var now = Date.now() / 1000;
      var phase = ((now % 0.777) / 0.777).toFixed(3);
      pulseEl.textContent = '1.287 Hz | \u03C6=' + phase;
    }
  }
  setInterval(updateStatus, 1287);
  setTimeout(updateStatus, 2000);

  // ─── Utility ─────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  console.log('\u2705 Zeq OS: Features Panel loaded (27 apps, 5 tools)');
})();
