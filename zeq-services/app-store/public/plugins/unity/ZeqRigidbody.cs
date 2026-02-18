/**
 * ZEQ Rigidbody - Synchronized physics component for Unity
 * 
 * Attach to any GameObject with a Rigidbody to sync its physics
 * to the 1.287 Hz HulyaPulse.
 * 
 * Usage:
 *   1. Add a Rigidbody component to your GameObject
 *   2. Add this ZeqRigidbody component
 *   3. Configure modulation settings in the Inspector
 */

using UnityEngine;

namespace ZeqOS
{
    [RequireComponent(typeof(Rigidbody))]
    public class ZeqRigidbody : MonoBehaviour
    {
        [Header("Mass Modulation")]
        [Tooltip("Enable mass modulation with HulyaPulse")]
        public bool modulateMass = false;
        
        [Tooltip("Mass modulation amplitude (0-1)")]
        [Range(0f, 1f)]
        public float massModulation = 0.1f;

        [Header("Velocity Modulation")]
        [Tooltip("Enable velocity modulation with HulyaPulse")]
        public bool modulateVelocity = false;
        
        [Tooltip("Velocity modulation amplitude")]
        [Range(0f, 2f)]
        public float velocityModulation = 0.1f;

        [Header("Scale Pulsing")]
        [Tooltip("Enable scale pulsing with HulyaPulse")]
        public bool pulseScale = true;
        
        [Tooltip("Scale pulse amplitude")]
        [Range(0f, 0.5f)]
        public float scaleAmplitude = 0.1f;

        [Header("Force Application")]
        [Tooltip("Apply synchronized force")]
        public bool applySyncForce = false;
        
        [Tooltip("Force direction")]
        public Vector3 forceDirection = Vector3.up;
        
        [Tooltip("Force magnitude")]
        public float forceMagnitude = 10f;

        [Header("Visual Effects")]
        [Tooltip("Pulse emission intensity (requires emissive material)")]
        public bool pulseEmission = false;
        
        [Tooltip("Emission color")]
        public Color emissionColor = new Color(0.4f, 0.4f, 1f);
        
        [Tooltip("Emission intensity range")]
        [Range(0f, 5f)]
        public float emissionIntensity = 1f;

        private Rigidbody _rb;
        private float _baseMass;
        private Vector3 _baseScale;
        private Material _material;
        private static readonly int EmissionColorProperty = Shader.PropertyToID("_EmissionColor");

        private void Awake()
        {
            _rb = GetComponent<Rigidbody>();
            _baseMass = _rb.mass;
            _baseScale = transform.localScale;

            // Get material for emission pulsing
            var renderer = GetComponent<Renderer>();
            if (renderer != null)
            {
                _material = renderer.material;
            }
        }

        private void Start()
        {
            // Subscribe to ZeqSync pulse events
            if (ZeqSync.Instance != null)
            {
                ZeqSync.Instance.OnPulse += OnZeqPulse;
            }
        }

        private void OnDestroy()
        {
            // Unsubscribe from events
            if (ZeqSync.Instance != null)
            {
                ZeqSync.Instance.OnPulse -= OnZeqPulse;
            }
        }

        private void OnZeqPulse(PulseData data)
        {
            float sync = data.SyncValue;

            // Mass modulation
            if (modulateMass)
            {
                _rb.mass = _baseMass * (1f + sync * massModulation);
            }

            // Velocity modulation
            if (modulateVelocity && _rb.velocity.magnitude > 0.01f)
            {
                _rb.velocity *= (1f + sync * velocityModulation * Time.deltaTime);
            }

            // Scale pulsing
            if (pulseScale)
            {
                float scale = 1f + sync * scaleAmplitude;
                transform.localScale = _baseScale * scale;
            }

            // Synchronized force
            if (applySyncForce)
            {
                // Apply force at peak of sync wave
                if (sync > 0.8f * ZeqSync.Instance.amplitude)
                {
                    _rb.AddForce(forceDirection.normalized * forceMagnitude * sync, ForceMode.Impulse);
                }
            }

            // Emission pulsing
            if (pulseEmission && _material != null)
            {
                float intensity = emissionIntensity * (1f + sync);
                _material.SetColor(EmissionColorProperty, emissionColor * intensity);
            }
        }

        /// <summary>
        /// Get the current synchronized mass
        /// </summary>
        public float GetSyncedMass()
        {
            if (!modulateMass || ZeqSync.Instance == null)
                return _baseMass;
            
            return _baseMass * (1f + ZeqSync.Instance.CurrentSyncValue * massModulation);
        }

        /// <summary>
        /// Apply a force synchronized to the HulyaPulse
        /// </summary>
        public void ApplySynchronizedForce(Vector3 direction, float magnitude)
        {
            if (ZeqSync.Instance == null) return;
            
            float sync = ZeqSync.Instance.CurrentSyncValue;
            _rb.AddForce(direction.normalized * magnitude * (1f + sync), ForceMode.Force);
        }

        /// <summary>
        /// Apply an impulse at the next pulse peak
        /// </summary>
        public void QueuePulseImpulse(Vector3 direction, float magnitude)
        {
            StartCoroutine(WaitForPulsePeak(direction, magnitude));
        }

        private System.Collections.IEnumerator WaitForPulsePeak(Vector3 direction, float magnitude)
        {
            // Wait until sync value is near peak
            while (ZeqSync.Instance != null && ZeqSync.Instance.CurrentSyncValue < 0.9f * ZeqSync.Instance.amplitude)
            {
                yield return null;
            }
            
            _rb.AddForce(direction.normalized * magnitude, ForceMode.Impulse);
        }
    }
}
