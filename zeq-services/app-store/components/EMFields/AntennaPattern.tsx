import React, { useRef, useEffect, useCallback, useMemo } from 'react';

interface AntennaPatternProps {
  frequency: number;
  wavelength: number;
  k: number;
  omega: number;
  elapsedTime: number;
  syncValue: number;
}

// Half-wave dipole radiation pattern
function dipolePattern(thetaDeg: number): number {
  const theta = (thetaDeg * Math.PI) / 180;
  const sinT = Math.sin(theta);
  if (Math.abs(sinT) < 1e-6) return 0;
  const val = Math.cos((Math.PI / 2) * Math.cos(theta)) / sinT;
  return isFinite(val) ? val * val : 0; // normalized power pattern
}

export const AntennaPattern: React.FC<AntennaPatternProps> = ({
  frequency, wavelength, k, omega, elapsedTime, syncValue,
}) => {
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveContainerRef = useRef<HTMLDivElement>(null);

  // SVG polar radiation pattern
  const svgSize = 300;
  const center = svgSize / 2;
  const maxR = center - 30;

  // Find peak for normalization
  const patternData = useMemo(() => {
    const data: { theta: number; value: number }[] = [];
    let peak = 0;
    for (let deg = 0; deg < 360; deg += 2) {
      const val = dipolePattern(deg);
      data.push({ theta: deg, value: val });
      if (val > peak) peak = val;
    }
    return { data, peak: peak || 1 };
  }, []);

  const patternPath = useMemo(() => {
    const { data, peak } = patternData;
    const pts = data.map((d) => {
      const r = (d.value / peak) * maxR;
      const rad = ((d.theta - 90) * Math.PI) / 180;
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad),
      };
    });
    let path = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      path += ` L${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
    }
    path += ' Z';
    return path;
  }, [patternData, maxR, center]);

  // 3dB beamwidth for half-wave dipole ~78 degrees
  const beamwidth3dB = 78;
  const halfBW = beamwidth3dB / 2;

  // Gain
  const gainLinear = 1.64;
  const gainDBi = 10 * Math.log10(gainLinear);

  // EM Wave animation on canvas
  const drawWave = useCallback(() => {
    const canvas = waveCanvasRef.current;
    const container = waveContainerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const midY = h / 2;
    const amplitude = h * 0.3;
    const numWavelengths = 3;
    const zScale = w / (numWavelengths * wavelength);
    const t = elapsedTime;

    // Propagation axis
    ctx.strokeStyle = 'rgba(100,116,139,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // E-field (vertical oscillation, red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const z = px / zScale;
      const E = amplitude * Math.sin(k * z - omega * t * 0.0000001); // slow down for visibility
      const y = midY - E;
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    // B-field (depth illusion, blue) - shown as horizontal oscillation with reduced amplitude
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < w; px++) {
      const z = px / zScale;
      const B = amplitude * 0.5 * Math.sin(k * z - omega * t * 0.0000001);
      // Draw as perspective depth
      const y = midY + B * 0.3;
      const x = px + B * 0.5;
      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Poynting vector arrow
    const arrowX = w / 2;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arrowX - 30, midY + amplitude + 25);
    ctx.lineTo(arrowX + 30, midY + amplitude + 25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arrowX + 30, midY + amplitude + 25);
    ctx.lineTo(arrowX + 22, midY + amplitude + 20);
    ctx.moveTo(arrowX + 30, midY + amplitude + 25);
    ctx.lineTo(arrowX + 22, midY + amplitude + 30);
    ctx.stroke();

    // Labels
    ctx.font = '11px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('E-field', 10, 20);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('B-field', 10, 35);
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'center';
    ctx.fillText('S (Poynting)', arrowX, midY + amplitude + 45);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`f = ${(frequency / 1e9).toFixed(2)} GHz`, w - 140, 20);
    ctx.fillText(`lambda = ${wavelength.toFixed(3)} m`, w - 140, 35);
  }, [frequency, wavelength, k, omega, elapsedTime]);

  useEffect(() => {
    drawWave();
  }, [drawWave]);

  useEffect(() => {
    const onResize = () => drawWave();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawWave]);

  return (
    <div className="space-y-4">
      {/* Polar Radiation Pattern */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Half-Wave Dipole Radiation Pattern</h3>
        <div className="flex justify-center">
          <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full" style={{ maxWidth: 400, maxHeight: 400 }}>
            {/* Grid circles */}
            {[0.25, 0.5, 0.75, 1.0].map((r) => (
              <circle key={r} cx={center} cy={center} r={r * maxR}
                fill="none" stroke="rgba(100,116,139,0.2)" strokeWidth={0.5} />
            ))}
            {/* Grid lines */}
            {[0, 45, 90, 135].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line key={deg}
                  x1={center - maxR * Math.cos(rad)} y1={center - maxR * Math.sin(rad)}
                  x2={center + maxR * Math.cos(rad)} y2={center + maxR * Math.sin(rad)}
                  stroke="rgba(100,116,139,0.15)" strokeWidth={0.5} />
              );
            })}

            {/* Pattern fill */}
            <path d={patternPath} fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.8)" strokeWidth={1.5} />

            {/* 3dB beamwidth markers */}
            <line
              x1={center} y1={center}
              x2={center + maxR * Math.cos((-90 + halfBW) * Math.PI / 180)}
              y2={center + maxR * Math.sin((-90 + halfBW) * Math.PI / 180)}
              stroke="rgba(251,146,60,0.5)" strokeWidth={1} strokeDasharray="4,3" />
            <line
              x1={center} y1={center}
              x2={center + maxR * Math.cos((-90 - halfBW) * Math.PI / 180)}
              y2={center + maxR * Math.sin((-90 - halfBW) * Math.PI / 180)}
              stroke="rgba(251,146,60,0.5)" strokeWidth={1} strokeDasharray="4,3" />

            {/* Angle labels */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const lx = center + (maxR + 15) * Math.cos(rad);
              const ly = center + (maxR + 15) * Math.sin(rad);
              return (
                <text key={deg} x={lx} y={ly}
                  fill="rgba(148,163,184,0.5)" fontSize={8} textAnchor="middle" dominantBaseline="middle"
                  fontFamily="monospace">
                  {deg}
                </text>
              );
            })}

            {/* Center dot */}
            <circle cx={center} cy={center} r={2} fill="#22d3ee" />

            {/* Labels */}
            <text x={center} y={20} fill="rgba(148,163,184,0.7)" fontSize={10}
              textAnchor="middle" fontFamily="monospace">
              Gain = {gainDBi.toFixed(2)} dBi
            </text>
            <text x={center} y={svgSize - 8} fill="rgba(251,146,60,0.7)" fontSize={9}
              textAnchor="middle" fontFamily="monospace">
              3dB BW = {beamwidth3dB}deg
            </text>
          </svg>
        </div>
      </div>

      {/* EM Wave Propagation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">EM Wave Propagation</h3>
        <div ref={waveContainerRef} className="w-full" style={{ aspectRatio: '3 / 1' }}>
          <canvas ref={waveCanvasRef} className="w-full h-full rounded" />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          E (red) and B (blue) fields oscillating perpendicular, Poynting vector S (cyan) shows energy flow
        </p>
      </div>
    </div>
  );
};
