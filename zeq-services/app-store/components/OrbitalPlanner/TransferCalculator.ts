/**
 * Orbital mechanics computation functions
 * Hohmann transfer, orbital velocities, periods, and escape velocities
 */

export const MU_EARTH = 3.986e14; // Earth gravitational parameter (m^3/s^2)
export const RE = 6.371e6; // Earth radius (m)

export interface HohmannResult {
  deltaV1: number;
  deltaV2: number;
  totalDeltaV: number;
  transferTime: number;
  v1Circular: number;
  v2Circular: number;
  vTransfer1: number;
  vTransfer2: number;
  semiMajorTransfer: number;
}

/** Compute circular orbit velocity at a given altitude (km) */
export function orbitVelocity(altitudeKm: number): number {
  const r = altitudeKm * 1000 + RE;
  return Math.sqrt(MU_EARTH / r);
}

/** Compute orbital period at a given altitude (km), returns seconds */
export function orbitPeriod(altitudeKm: number): number {
  const r = altitudeKm * 1000 + RE;
  return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU_EARTH);
}

/** Compute escape velocity at a given altitude (km) */
export function escapeVelocity(altitudeKm: number): number {
  const r = altitudeKm * 1000 + RE;
  return Math.sqrt(2 * MU_EARTH / r);
}

/**
 * Compute Hohmann transfer between two circular orbits.
 * @param r1Km - departure orbit altitude in km
 * @param r2Km - arrival orbit altitude in km
 */
export function hohmannTransfer(r1Km: number, r2Km: number): HohmannResult {
  const r1 = r1Km * 1000 + RE;
  const r2 = r2Km * 1000 + RE;

  // Circular velocities
  const v1Circular = Math.sqrt(MU_EARTH / r1);
  const v2Circular = Math.sqrt(MU_EARTH / r2);

  // Semi-major axis of transfer ellipse
  const aTransfer = (r1 + r2) / 2;

  // Transfer orbit velocities at departure and arrival
  const vTransfer1 = Math.sqrt(MU_EARTH * (2 / r1 - 1 / aTransfer));
  const vTransfer2 = Math.sqrt(MU_EARTH * (2 / r2 - 1 / aTransfer));

  // Delta-V for each burn
  const deltaV1 = Math.abs(vTransfer1 - v1Circular);
  const deltaV2 = Math.abs(v2Circular - vTransfer2);
  const totalDeltaV = deltaV1 + deltaV2;

  // Transfer time = half the period of the transfer ellipse
  const transferTime = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / MU_EARTH);

  return {
    deltaV1,
    deltaV2,
    totalDeltaV,
    transferTime,
    v1Circular,
    v2Circular,
    vTransfer1,
    vTransfer2,
    semiMajorTransfer: aTransfer,
  };
}

/** Compute inclination change delta-V (simplified single-impulse) */
export function inclinationChangeDeltaV(altitudeKm: number, inclinationDeg: number): number {
  if (inclinationDeg === 0) return 0;
  const v = orbitVelocity(altitudeKm);
  const incRad = (inclinationDeg * Math.PI) / 180;
  return 2 * v * Math.sin(incRad / 2);
}

/** Format seconds to human-readable time */
export function formatTransferTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return `${days}d ${remainHours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}
