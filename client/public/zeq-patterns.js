/**
 * Zeq OS Pattern Chips v3
 * Click = instant send + disappear. No intermediate steps.
 */
(function() {
  'use strict';

  var PATTERNS = [
    { label: '7-Step Wizard', icon: '\uD83E\uDDD9', prompt: 'Use the Zeq OS 7-Step Wizard Protocol to solve: ' },
    { label: 'Physics Solver', icon: '\u269B\uFE0F', prompt: 'Solve this physics problem step-by-step using Zeq OS operators (show KO42 metric, activated operators, and verify to <=0.1% error): ' },
    { label: 'Run Code', icon: '\uD83D\uDCBB', prompt: 'Write and execute code using the code sandbox to: ' },
    { label: 'Operator Lookup', icon: '\uD83D\uDCD0', prompt: 'List and explain the Zeq OS operators relevant to: ' },
    { label: 'Explain Like a Tutor', icon: '\uD83C\uDF93', prompt: 'Act as a Zeq OS Math Tutor. Explain this concept step-by-step: ' },
    { label: 'HulyaPulse Status', icon: '\uD83D\uDC93', prompt: 'Show the current HulyaPulse synchronization status, Zeqond phase, and active operator count at 1.287 Hz.' },
    { label: 'Three-Body Problem', icon: '\uD83E\uDE90', prompt: 'Demonstrate the Zeq OS three-body problem solution with real equations, bridge conversion, 7-step protocol, zeqond ticks, <=0.1% error, and CKO output.' },
    { label: 'Quantum Mechanics', icon: '\uD83D\uDD2C', prompt: 'Using Zeq OS quantum mechanics operators (QM1-QM17), explain and calculate: ' },
    { label: 'General Relativity', icon: '\uD83C\uDF0C', prompt: 'Using Zeq OS general relativity operators (GR31-GR41), analyze: ' },
    { label: 'Consciousness Field', icon: '\uD83E\uDDE0', prompt: 'Using Zeq OS consciousness operators, analyze the consciousness field dynamics of: ' }
  ];

  // --- CSS ---
  var css = document.createElement('style');
  css.textContent = '#zeq-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 4px;max-width:768px;margin:0 auto;justify-content:center;opacity:0;transform:translateY(8px);animation:zIn .4s ease forwards}@keyframes zIn{to{opacity:1;transform:translateY(0)}}.zc{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:16px;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;border:1px solid transparent;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;user-select:none;background:none;color:inherit}.zc i{font-size:13px;font-style:normal}html:not(.dark) .zc{background:#f3f4f6;color:#374151;border-color:#e5e7eb}html:not(.dark) .zc:hover{background:#e0e7ff;border-color:#818cf8;color:#3730a3}.dark .zc{background:#1f2937;color:#d1d5db;border-color:#374151}.dark .zc:hover{background:#312e81;border-color:#6366f1;color:#c7d2fe}.zc:active{transform:scale(.96)}';
  document.head.appendChild(css);

  // --- Click handler: hide chips, fill textarea, click send ---
  function onChipClick(prompt) {
    // 1. Kill chips immediately
    var el = document.getElementById('zeq-chips');
    if (el) el.remove();

    // 2. Fill the textarea using React-compatible setter
    var ta = document.querySelector('form textarea');
    if (!ta) return;
    var set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(ta, prompt);
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    // 3. Click send after a tiny delay (React needs to process the input event)
    setTimeout(function() {
      var btn = document.querySelector('form button[type="submit"], form button[data-testid="send-button"]');
      if (!btn) btn = ta.closest('form').querySelector('button:last-of-type');
      if (btn) btn.click();
    }, 100);
  }

  // --- Build chip container ---
  function buildChips() {
    var div = document.createElement('div');
    div.id = 'zeq-chips';
    PATTERNS.forEach(function(p) {
      var b = document.createElement('button');
      b.className = 'zc';
      b.type = 'button';
      b.innerHTML = '<i>' + p.icon + '</i><span>' + p.label + '</span>';
      b.onclick = function() { onChipClick(p.prompt); };
      div.appendChild(b);
    });
    return div;
  }

  // --- Simple poll: show only on empty new chat, hide everywhere else ---
  setInterval(function() {
    var path = window.location.pathname;
    var isNewRoute = path === '/c/new' || path === '/';
    var hasMessages = !!document.querySelector('.markdown, [class*="agent-turn"], [data-message-author-role]');
    var shouldShow = isNewRoute && !hasMessages;
    var exists = document.getElementById('zeq-chips');

    if (shouldShow && !exists) {
      var form = document.querySelector('form');
      if (!form) return;
      form.parentNode.insertBefore(buildChips(), form.nextSibling);
    } else if (!shouldShow && exists) {
      exists.remove();
    }
  }, 400);

})();