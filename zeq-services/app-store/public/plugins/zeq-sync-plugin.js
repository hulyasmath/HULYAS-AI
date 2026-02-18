/**
 * ZEQ OS Universal Sync Plugin v0.4.0-beta
 * 
 * A universal plugin system for synchronizing any physics/visualization
 * library to the 1.287 Hz HulyaPulse using the ZEQ42 (KO42) operator.
 * 
 * THE ZEQ EQUATION:
 *   R(t) = S(t)[1 + α·sin(2πft + φ₀)]
 * 
 * Where:
 *   - f = 1.287 Hz (HulyaPulse frequency)
 *   - α = modulation amplitude
 *   - T = 1/f ≈ 0.777s (one Zeqond)
 *   - S(t) = standard physical prediction
 *   - R(t) = synchronized result
 * 
 * This universal proper-time modulation synchronizes physics across
 * quantum, classical, and relativistic domains without modifying
 * any established physical laws.
 * 
 * Supported Libraries:
 * - Three.js (3D graphics, WebGL)
 * - Matter.js (2D rigid body physics)
 * - Cannon.js (3D physics engine)
 * - p5.js (Creative coding)
 * - D3.js (Data visualization)
 * - Plotly.js (Scientific plots)
 * - Any custom render loop
 * 
 * @author ZEQ OS Team
 * @license MIT
 * @version 0.4.0-beta
 * 
 * ⚠️ BETA: API may change before stable release
 */

(function(global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS/Node.js
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Browser globals
    global.ZeqSync = factory();
  }
}(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  const HULYAPULSE_HZ = 1.287;           // Universal sync frequency
  const ZEQOND = 1.0 / HULYAPULSE_HZ;    // ~0.777 seconds
  const ZEQOND_MS = ZEQOND * 1000;       // ~777 milliseconds
  const VERSION = '0.4.0-beta';
  
  // Time reference points
  const BIG_BANG_SECONDS = 4.35086e17;   // Seconds since Big Bang
  
  // ============================================================================
  // KO42 OPERATOR IMPLEMENTATION
  // ============================================================================
  
  /**
   * KO42 Universal Synchronization Operator
   * Generates the HulyaPulse sync signal
   * 
   * @param {number} t - Time in seconds
   * @param {number} amplitude - Signal amplitude (default: 0.1)
   * @param {number} phase - Phase offset in radians (default: 0)
   * @returns {number} Synchronization value [-amplitude, amplitude]
   */
  function ko42(t, amplitude = 0.1, phase = 0) {
    return amplitude * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t + phase);
  }

  /**
   * KO42.1 Automatic Metric Tensioner
   * Modulates spacetime metrics with the HulyaPulse
   * 
   * ds² = g_μν dx^μ dx^ν + α sin(2π · 1.287t) dt²
   * 
   * @param {number} t - Time in seconds
   * @param {number} metricTerm - Base metric term
   * @param {number} alpha - Modulation amplitude (default: 0.00129)
   * @returns {Object} {value, metricTerm, pulseTerm, alpha}
   */
  function ko42_1(t, metricTerm = 1.0, alpha = 0.00129) {
    const pulseTerm = alpha * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t);
    return {
      value: metricTerm + pulseTerm,
      metricTerm: metricTerm,
      pulseTerm: pulseTerm,
      alpha: alpha,
      description: 'Automatic metric tensioner with α modulation'
    };
  }

  /**
   * KO42.2 Manual Metric Tensioner
   * User-adjustable spacetime modulation
   * 
   * @param {number} t - Time in seconds
   * @param {number} metricTerm - Base metric term
   * @param {number} beta - User-defined tuning parameter (default: 3.718)
   * @returns {Object} {value, metricTerm, pulseTerm, beta}
   */
  function ko42_2(t, metricTerm = 1.0, beta = 3.718) {
    const pulseTerm = beta * Math.sin(2 * Math.PI * HULYAPULSE_HZ * t);
    return {
      value: metricTerm + pulseTerm,
      metricTerm: metricTerm,
      pulseTerm: pulseTerm,
      beta: beta,
      description: 'Manual metric tensioner with β tuning parameter'
    };
  }

  // ============================================================================
  // ZEQOND TIME UTILITIES
  // ============================================================================
  
  /**
   * Get current time in Zeqond units (since Unix epoch)
   * @returns {number} Current Zeqond count
   */
  function getCurrentZeqond() {
    return Date.now() / 1000 / ZEQOND;
  }

  /**
   * Get current time in Zeqond units (since Big Bang)
   * @returns {number} Zeqond count since Big Bang
   */
  function getZeqondFromBigBang() {
    return (BIG_BANG_SECONDS + Date.now() / 1000) / ZEQOND;
  }

  /**
   * Convert seconds to Zeqonds
   * @param {number} seconds - Time in seconds
   * @returns {number} Time in Zeqonds
   */
  function secondsToZeqonds(seconds) {
    return seconds / ZEQOND;
  }

  /**
   * Convert Zeqonds to seconds
   * @param {number} zeqonds - Time in Zeqonds
   * @returns {number} Time in seconds
   */
  function zeqondsToSeconds(zeqonds) {
    return zeqonds * ZEQOND;
  }

  // ============================================================================
  // MAIN SYNC CLASS
  // ============================================================================
  
  /**
   * ZeqSync - Universal synchronization manager
   * 
   * @example
   * // Basic usage
   * const sync = new ZeqSync({ autoStart: true });
   * 
   * // With Three.js
   * sync.attachThreeJS(renderer, scene, camera);
   * 
   * // With Matter.js
   * sync.attachMatterJS(engine);
   * 
   * // Custom render loop
   * sync.onPulse((delta, zeqond, syncValue) => {
   *   // Your synchronized logic here
   * });
   */
  class ZeqSync {
    constructor(options = {}) {
      this.options = {
        frequency: options.frequency || HULYAPULSE_HZ,
        autoStart: options.autoStart !== false,
        daemonUrl: options.daemonUrl || 'http://localhost:2871',
        useDaemon: options.useDaemon || false,
        amplitude: options.amplitude || 0.1,
        ...options
      };

      this.running = false;
      this.pulseCount = 0;
      this.lastTime = 0;
      this.startTime = Date.now() / 1000;
      this.callbacks = [];
      this.attachedEngines = [];
      this.animationFrameId = null;
      this.intervalId = null;

      // Performance tracking
      this.metrics = {
        totalPulses: 0,
        averageDelta: 0,
        lastDelta: 0,
        driftMs: 0
      };

      if (this.options.autoStart) {
        this.start();
      }
    }

    // ========================================================================
    // CORE SYNC METHODS
    // ========================================================================

    /**
     * Start the synchronization loop
     */
    start() {
      if (this.running) return;
      
      this.running = true;
      this.startTime = Date.now() / 1000;
      this.lastTime = performance.now();
      
      // Use requestAnimationFrame for smooth rendering
      // but maintain 1.287 Hz pulse cadence
      this._tick = this._tick.bind(this);
      this._schedulePulse();
      
      console.log(`[ZeqSync] Started at ${this.options.frequency} Hz (Zeqond: ${ZEQOND.toFixed(3)}s)`);
    }

    /**
     * Stop the synchronization loop
     */
    stop() {
      this.running = false;
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      if (this.intervalId) {
        clearTimeout(this.intervalId);
        this.intervalId = null;
      }
      
      console.log(`[ZeqSync] Stopped after ${this.pulseCount} pulses`);
    }

    /**
     * Internal tick function
     */
    _tick() {
      if (!this.running) return;

      const now = performance.now();
      const deltaMs = now - this.lastTime;
      const deltaS = deltaMs / 1000;
      const currentTime = Date.now() / 1000;
      
      // Calculate current Zeqond
      const zeqond = getCurrentZeqond();
      
      // Calculate KO42 sync value
      const syncValue = ko42(currentTime - this.startTime, this.options.amplitude);
      
      // Update metrics
      this.metrics.lastDelta = deltaMs;
      this.metrics.totalPulses++;
      this.metrics.averageDelta = (this.metrics.averageDelta * (this.metrics.totalPulses - 1) + deltaMs) / this.metrics.totalPulses;
      
      // Calculate drift from ideal pulse timing
      const idealPulses = (currentTime - this.startTime) * this.options.frequency;
      this.metrics.driftMs = (this.pulseCount - idealPulses) * ZEQOND_MS;

      // Emit pulse data to all callbacks
      const pulseData = {
        delta: deltaS,
        deltaMs: deltaMs,
        zeqond: zeqond,
        syncValue: syncValue,
        pulseCount: this.pulseCount,
        time: currentTime,
        elapsedTime: currentTime - this.startTime,
        metrics: { ...this.metrics }
      };

      // Execute all registered callbacks
      for (const callback of this.callbacks) {
        try {
          callback(pulseData);
        } catch (e) {
          console.error('[ZeqSync] Callback error:', e);
        }
      }

      // Update attached physics engines
      for (const engine of this.attachedEngines) {
        try {
          engine.update(pulseData);
        } catch (e) {
          console.error('[ZeqSync] Engine update error:', e);
        }
      }

      this.pulseCount++;
      this.lastTime = now;
      
      // Schedule next pulse
      this._schedulePulse();
    }

    /**
     * Schedule the next pulse at the correct HulyaPulse interval
     */
    _schedulePulse() {
      if (!this.running) return;

      // Calculate time until next pulse
      const now = Date.now() / 1000;
      const elapsed = now - this.startTime;
      const expectedPulses = Math.floor(elapsed * this.options.frequency);
      const nextPulseTime = (expectedPulses + 1) / this.options.frequency;
      const delay = Math.max(0, (nextPulseTime - elapsed) * 1000);

      // Use setTimeout for accurate timing, RAF for rendering
      this.intervalId = setTimeout(() => {
        this.animationFrameId = requestAnimationFrame(this._tick);
      }, delay);
    }

    // ========================================================================
    // CALLBACK REGISTRATION
    // ========================================================================

    /**
     * Register a callback to be called on each pulse
     * 
     * @param {Function} callback - Function(pulseData) to call
     * @returns {Function} Unsubscribe function
     */
    onPulse(callback) {
      this.callbacks.push(callback);
      return () => {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) this.callbacks.splice(index, 1);
      };
    }

    // ========================================================================
    // THREE.JS INTEGRATION
    // ========================================================================

    /**
     * Attach Three.js renderer for synchronized rendering
     * 
     * @param {THREE.WebGLRenderer} renderer - Three.js renderer
     * @param {THREE.Scene} scene - Three.js scene
     * @param {THREE.Camera} camera - Three.js camera
     * @param {Object} options - Additional options
     */
    attachThreeJS(renderer, scene, camera, options = {}) {
      const engine = {
        type: 'threejs',
        renderer,
        scene,
        camera,
        options,
        update: (pulseData) => {
          // Apply KO42 modulation to scene if enabled
          if (options.modulateTime) {
            scene.userData.zeqSync = pulseData.syncValue;
            scene.userData.zeqond = pulseData.zeqond;
          }
          
          // Call custom update function if provided
          if (options.onUpdate) {
            options.onUpdate(pulseData, scene, camera);
          }
          
          // Render the scene
          renderer.render(scene, camera);
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] Three.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // MATTER.JS INTEGRATION
    // ========================================================================

    /**
     * Attach Matter.js engine for synchronized physics
     * 
     * @param {Matter.Engine} engine - Matter.js engine
     * @param {Object} options - Additional options
     */
    attachMatterJS(matterEngine, options = {}) {
      const engine = {
        type: 'matterjs',
        matterEngine,
        options,
        update: (pulseData) => {
          // Apply KO42 modulation to gravity if enabled
          if (options.modulateGravity && matterEngine.gravity) {
            const baseGravityY = options.baseGravity || -9.81;
            matterEngine.gravity.y = baseGravityY * (1 + pulseData.syncValue);
          }
          
          // Update Matter.js engine
          if (typeof Matter !== 'undefined') {
            Matter.Engine.update(matterEngine, pulseData.deltaMs);
          }
          
          // Call custom update function if provided
          if (options.onUpdate) {
            options.onUpdate(pulseData, matterEngine);
          }
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] Matter.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // CANNON.JS INTEGRATION
    // ========================================================================

    /**
     * Attach Cannon.js physics world for synchronized simulation
     * 
     * @param {CANNON.World} world - Cannon.js world
     * @param {Object} options - Additional options
     */
    attachCannonJS(world, options = {}) {
      const fixedTimeStep = options.fixedTimeStep || ZEQOND;
      const maxSubSteps = options.maxSubSteps || 3;
      
      const engine = {
        type: 'cannonjs',
        world,
        options,
        accumulator: 0,
        update: (pulseData) => {
          // Apply KO42 modulation to gravity if enabled
          if (options.modulateGravity && world.gravity) {
            const baseGravityY = options.baseGravity || -9.82;
            world.gravity.y = baseGravityY * (1 + pulseData.syncValue);
          }
          
          // Step the physics world
          world.step(fixedTimeStep, pulseData.delta, maxSubSteps);
          
          // Call custom update function if provided
          if (options.onUpdate) {
            options.onUpdate(pulseData, world);
          }
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] Cannon.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // P5.JS INTEGRATION
    // ========================================================================

    /**
     * Attach p5.js for synchronized creative coding
     * 
     * @param {p5} p5Instance - p5.js instance
     * @param {Object} options - Additional options
     */
    attachP5JS(p5Instance, options = {}) {
      const engine = {
        type: 'p5js',
        p5Instance,
        options,
        update: (pulseData) => {
          // Store sync data on the p5 instance
          p5Instance.zeqSync = {
            value: pulseData.syncValue,
            zeqond: pulseData.zeqond,
            delta: pulseData.delta,
            pulseCount: pulseData.pulseCount
          };
          
          // Call custom update function if provided
          if (options.onUpdate) {
            options.onUpdate(pulseData, p5Instance);
          }
          
          // Trigger redraw if enabled
          if (options.autoRedraw !== false) {
            p5Instance.redraw();
          }
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] p5.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // D3.JS INTEGRATION
    // ========================================================================

    /**
     * Attach D3.js for synchronized data visualization
     * 
     * @param {Function} updateFn - Function to call on each pulse
     * @param {Object} options - Additional options
     */
    attachD3JS(updateFn, options = {}) {
      const engine = {
        type: 'd3js',
        updateFn,
        options,
        update: (pulseData) => {
          // Call the D3 update function with pulse data
          updateFn({
            ...pulseData,
            // D3-specific helpers
            transition: (selection) => {
              return selection.transition()
                .duration(ZEQOND_MS)
                .ease(d3.easeLinear);
            }
          });
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] D3.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // PLOTLY.JS INTEGRATION
    // ========================================================================

    /**
     * Attach Plotly.js for synchronized scientific plotting
     * 
     * @param {HTMLElement} plotDiv - Plotly plot container
     * @param {Function} dataUpdateFn - Function that returns updated data
     * @param {Object} options - Additional options
     */
    attachPlotlyJS(plotDiv, dataUpdateFn, options = {}) {
      const engine = {
        type: 'plotlyjs',
        plotDiv,
        dataUpdateFn,
        options,
        update: (pulseData) => {
          // Get updated data from user function
          const newData = dataUpdateFn(pulseData);
          
          if (newData && typeof Plotly !== 'undefined') {
            // Update the plot with new data
            Plotly.react(plotDiv, newData.data || newData, newData.layout, newData.config);
          }
        }
      };
      
      this.attachedEngines.push(engine);
      console.log('[ZeqSync] Plotly.js attached');
      
      return () => this._detachEngine(engine);
    }

    // ========================================================================
    // GENERIC ENGINE ATTACHMENT
    // ========================================================================

    /**
     * Attach any custom physics/rendering engine
     * 
     * @param {Object} engineConfig - Engine configuration
     * @param {string} engineConfig.name - Engine name for logging
     * @param {Function} engineConfig.update - Update function(pulseData)
     * @param {Function} [engineConfig.cleanup] - Cleanup function
     */
    attachCustom(engineConfig) {
      const engine = {
        type: 'custom',
        name: engineConfig.name || 'Custom Engine',
        customConfig: engineConfig,
        update: engineConfig.update,
        cleanup: engineConfig.cleanup
      };
      
      this.attachedEngines.push(engine);
      console.log(`[ZeqSync] ${engine.name} attached`);
      
      return () => this._detachEngine(engine);
    }

    /**
     * Detach an engine
     */
    _detachEngine(engine) {
      const index = this.attachedEngines.indexOf(engine);
      if (index > -1) {
        if (engine.cleanup) engine.cleanup();
        this.attachedEngines.splice(index, 1);
        console.log(`[ZeqSync] ${engine.type} detached`);
      }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Get current sync status
     */
    getStatus() {
      return {
        running: this.running,
        frequency: this.options.frequency,
        pulseCount: this.pulseCount,
        zeqond: getCurrentZeqond(),
        zeqondFromBigBang: getZeqondFromBigBang(),
        attachedEngines: this.attachedEngines.map(e => e.type),
        callbackCount: this.callbacks.length,
        metrics: { ...this.metrics },
        version: VERSION
      };
    }

    /**
     * Get the current KO42 sync value
     */
    getSyncValue() {
      const currentTime = Date.now() / 1000;
      return ko42(currentTime - this.startTime, this.options.amplitude);
    }

    /**
     * Get the current Zeqond
     */
    getZeqond() {
      return getCurrentZeqond();
    }
  }

  // ============================================================================
  // EXPORT
  // ============================================================================
  
  return {
    // Main class
    ZeqSync,
    
    // KO42 operators
    ko42,
    ko42_1,
    ko42_2,
    
    // Time utilities
    getCurrentZeqond,
    getZeqondFromBigBang,
    secondsToZeqonds,
    zeqondsToSeconds,
    
    // Constants
    HULYAPULSE_HZ,
    ZEQOND,
    ZEQOND_MS,
    VERSION,
    
    // Factory function for convenience
    create: (options) => new ZeqSync(options)
  };
}));
