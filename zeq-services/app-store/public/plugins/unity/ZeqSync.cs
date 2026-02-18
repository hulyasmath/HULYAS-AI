/**
 * ZEQ OS Sync Plugin for Unity
 * Version: 0.4.0-beta
 * 
 * Synchronizes Unity physics and game objects to the 1.287 Hz HulyaPulse.
 * 
 * Usage:
 *   // Get the singleton instance
 *   var sync = ZeqSync.Instance;
 *   
 *   // Subscribe to pulse events
 *   sync.OnPulse += (data) => {
 *       Debug.Log($"Zeqond: {data.Zeqond}, Sync: {data.SyncValue}");
 *   };
 *   
 *   // Or use in Update()
 *   void Update() {
 *       float syncValue = ZeqSync.Instance.GetSyncValue();
 *       transform.localScale = Vector3.one * (1 + syncValue * 0.2f);
 *   }
 */

using System;
using UnityEngine;

namespace ZeqOS
{
    /// <summary>
    /// Pulse event data structure
    /// </summary>
    public struct PulseData
    {
        /// <summary>Time since last pulse in seconds</summary>
        public float Delta;
        
        /// <summary>Current Zeqond count (since Unix epoch)</summary>
        public double Zeqond;
        
        /// <summary>KO42 sync value [-amplitude, amplitude]</summary>
        public float SyncValue;
        
        /// <summary>Total pulses since start</summary>
        public int PulseCount;
        
        /// <summary>Time since sync started in seconds</summary>
        public float ElapsedTime;
    }

    /// <summary>
    /// ZEQ OS Universal Synchronization Manager for Unity
    /// Singleton pattern - use ZeqSync.Instance to access
    /// </summary>
    public class ZeqSync : MonoBehaviour
    {
        #region Constants
        
        /// <summary>Universal HulyaPulse frequency in Hz</summary>
        public const float HULYAPULSE_HZ = 1.287f;
        
        /// <summary>One Zeqond in seconds (~0.777s)</summary>
        public const float ZEQOND = 1.0f / HULYAPULSE_HZ;
        
        /// <summary>One Zeqond in milliseconds (~777ms)</summary>
        public const float ZEQOND_MS = ZEQOND * 1000f;
        
        /// <summary>SDK Version</summary>
        public const string VERSION = "0.4.0-beta";
        
        /// <summary>Seconds since Big Bang (approximate)</summary>
        private const double BIG_BANG_SECONDS = 4.35086e17;
        
        #endregion

        #region Singleton
        
        private static ZeqSync _instance;
        private static readonly object _lock = new object();
        private static bool _applicationIsQuitting = false;

        /// <summary>
        /// Singleton instance accessor
        /// Creates the ZeqSync GameObject if it doesn't exist
        /// </summary>
        public static ZeqSync Instance
        {
            get
            {
                if (_applicationIsQuitting)
                {
                    Debug.LogWarning("[ZeqSync] Instance requested after application quit.");
                    return null;
                }

                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = FindObjectOfType<ZeqSync>();

                        if (_instance == null)
                        {
                            var go = new GameObject("ZeqSync");
                            _instance = go.AddComponent<ZeqSync>();
                            DontDestroyOnLoad(go);
                        }
                    }

                    return _instance;
                }
            }
        }

        #endregion

        #region Events
        
        /// <summary>
        /// Event fired every frame with pulse synchronization data
        /// </summary>
        public event Action<PulseData> OnPulse;
        
        /// <summary>
        /// Event fired when a new Zeqond boundary is crossed
        /// </summary>
        public event Action<int> OnZeqondTick;
        
        #endregion

        #region Configuration
        
        [Header("Synchronization Settings")]
        [Tooltip("Amplitude of the sync wave")]
        [Range(0.01f, 2f)]
        public float amplitude = 0.1f;
        
        [Tooltip("Enable automatic physics synchronization")]
        public bool syncPhysics = true;
        
        [Tooltip("Gravity modulation strength when syncPhysics is enabled")]
        [Range(0f, 1f)]
        public float gravityModulation = 0.1f;
        
        #endregion

        #region State
        
        private float _startTime;
        private int _lastZeqond;
        private int _pulseCount;
        private Vector3 _baseGravity;
        
        /// <summary>Current sync value from KO42 operator</summary>
        public float CurrentSyncValue { get; private set; }
        
        /// <summary>Current Zeqond count</summary>
        public double CurrentZeqond { get; private set; }
        
        /// <summary>Is the sync system running</summary>
        public bool IsRunning { get; private set; }
        
        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = this;
            DontDestroyOnLoad(gameObject);
            
            _startTime = Time.time;
            _baseGravity = Physics.gravity;
            IsRunning = true;
            
            Debug.Log($"[ZeqSync] Initialized v{VERSION} | Frequency: {HULYAPULSE_HZ} Hz | Zeqond: {ZEQOND:F3}s");
        }

        private void Update()
        {
            if (!IsRunning) return;
            
            float elapsed = Time.time - _startTime;
            
            // Calculate KO42 sync value
            CurrentSyncValue = KO42(elapsed, amplitude);
            
            // Calculate current Zeqond
            CurrentZeqond = GetCurrentZeqond();
            
            // Check for Zeqond boundary crossing
            int currentZeqondInt = (int)(elapsed * HULYAPULSE_HZ);
            if (currentZeqondInt > _lastZeqond)
            {
                _lastZeqond = currentZeqondInt;
                _pulseCount++;
                OnZeqondTick?.Invoke(_pulseCount);
            }
            
            // Create pulse data
            var pulseData = new PulseData
            {
                Delta = Time.deltaTime,
                Zeqond = CurrentZeqond,
                SyncValue = CurrentSyncValue,
                PulseCount = _pulseCount,
                ElapsedTime = elapsed
            };
            
            // Fire pulse event
            OnPulse?.Invoke(pulseData);
            
            // Modulate physics if enabled
            if (syncPhysics)
            {
                ModulatePhysics();
            }
        }

        private void OnApplicationQuit()
        {
            _applicationIsQuitting = true;
        }

        private void OnDestroy()
        {
            // Restore original gravity
            if (syncPhysics)
            {
                Physics.gravity = _baseGravity;
            }
        }
        
        #endregion

        #region KO42 Operators
        
        /// <summary>
        /// KO42 Universal Synchronization Operator
        /// </summary>
        /// <param name="t">Time in seconds</param>
        /// <param name="amp">Amplitude (default: 0.1)</param>
        /// <param name="phase">Phase offset in radians (default: 0)</param>
        /// <returns>Sync value between [-amplitude, amplitude]</returns>
        public static float KO42(float t, float amp = 0.1f, float phase = 0f)
        {
            return amp * Mathf.Sin(2f * Mathf.PI * HULYAPULSE_HZ * t + phase);
        }

        /// <summary>
        /// KO42.1 Automatic Metric Tensioner
        /// ds² = g_μν dx^μ dx^ν + α·sin(2π·1.287t)·dt²
        /// </summary>
        /// <param name="t">Time in seconds</param>
        /// <param name="metricTerm">Base metric term (default: 1.0)</param>
        /// <param name="alpha">Modulation amplitude (default: 0.00129)</param>
        /// <returns>Tuple of (total value, pulse term)</returns>
        public static (float value, float pulseTerm) KO42_1(float t, float metricTerm = 1.0f, float alpha = 0.00129f)
        {
            float pulseTerm = alpha * Mathf.Sin(2f * Mathf.PI * HULYAPULSE_HZ * t);
            return (metricTerm + pulseTerm, pulseTerm);
        }

        /// <summary>
        /// KO42.2 Manual Metric Tensioner
        /// </summary>
        /// <param name="t">Time in seconds</param>
        /// <param name="metricTerm">Base metric term (default: 1.0)</param>
        /// <param name="beta">User-defined tuning parameter (default: 3.718)</param>
        /// <returns>Tuple of (total value, pulse term)</returns>
        public static (float value, float pulseTerm) KO42_2(float t, float metricTerm = 1.0f, float beta = 3.718f)
        {
            float pulseTerm = beta * Mathf.Sin(2f * Mathf.PI * HULYAPULSE_HZ * t);
            return (metricTerm + pulseTerm, pulseTerm);
        }
        
        #endregion

        #region Time Utilities
        
        /// <summary>
        /// Get current Zeqond count (since Unix epoch)
        /// </summary>
        public static double GetCurrentZeqond()
        {
            double unixTime = (DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds;
            return unixTime / ZEQOND;
        }

        /// <summary>
        /// Get Zeqond count since Big Bang
        /// </summary>
        public static double GetZeqondFromBigBang()
        {
            double unixTime = (DateTime.UtcNow - new DateTime(1970, 1, 1)).TotalSeconds;
            return (BIG_BANG_SECONDS + unixTime) / ZEQOND;
        }

        /// <summary>
        /// Convert seconds to Zeqonds
        /// </summary>
        public static double SecondsToZeqonds(double seconds)
        {
            return seconds / ZEQOND;
        }

        /// <summary>
        /// Convert Zeqonds to seconds
        /// </summary>
        public static double ZeqondsToSeconds(double zeqonds)
        {
            return zeqonds * ZEQOND;
        }
        
        #endregion

        #region Physics Modulation
        
        private void ModulatePhysics()
        {
            // Modulate gravity with HulyaPulse
            Vector3 modulatedGravity = _baseGravity * (1f + CurrentSyncValue * gravityModulation);
            Physics.gravity = modulatedGravity;
        }
        
        #endregion

        #region Public Methods
        
        /// <summary>
        /// Get the current sync value (shorthand)
        /// </summary>
        public float GetSyncValue()
        {
            return CurrentSyncValue;
        }

        /// <summary>
        /// Get the current Zeqond (shorthand)
        /// </summary>
        public double GetZeqond()
        {
            return CurrentZeqond;
        }

        /// <summary>
        /// Start the synchronization (if stopped)
        /// </summary>
        public void StartSync()
        {
            IsRunning = true;
            _startTime = Time.time;
            Debug.Log("[ZeqSync] Synchronization started");
        }

        /// <summary>
        /// Stop the synchronization
        /// </summary>
        public void StopSync()
        {
            IsRunning = false;
            
            // Restore gravity
            if (syncPhysics)
            {
                Physics.gravity = _baseGravity;
            }
            
            Debug.Log("[ZeqSync] Synchronization stopped");
        }

        /// <summary>
        /// Reset the synchronization timer
        /// </summary>
        public void ResetSync()
        {
            _startTime = Time.time;
            _lastZeqond = 0;
            _pulseCount = 0;
            Debug.Log("[ZeqSync] Synchronization reset");
        }
        
        #endregion
    }
}
