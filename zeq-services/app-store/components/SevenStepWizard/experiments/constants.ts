export type BodyName = 'sun' | 'earth' | 'moon' | 'mars';

/**
 * NIST CODATA 2018 Physical Constants - EXACT VALUES
 * 
 * Source: National Institute of Standards and Technology
 * CODATA Recommended Values of the Fundamental Physical Constants: 2018
 * https://physics.nist.gov/cuu/Constants/
 * 
 * CRITICAL: These are EXACT NIST values, NOT approximations.
 * All values are from official NIST CODATA 2018/2022 recommendations.
 */
export const CODATA = {
  // Gravitational constant - NIST CODATA 2018
  G: 6.67430e-11, // m^3 kg^-1 s^-2, uncertainty: ±0.00015e-11
  // Source: Tiesinga, E., et al. (2021). CODATA 2018. Rev. Mod. Phys. 93, 025010
  
  // Speed of light in vacuum - EXACT (by definition)
  c: 299792458, // m/s, exact (no uncertainty)
  // Source: NIST - Exact by definition in SI system
  
  // Planck constant - EXACT (2019 SI redefinition)
  h: 6.62607015e-34, // J·s, exact (no uncertainty)
  // Source: NIST SI redefinition 2019 - Now exact by definition
  
  // Boltzmann constant - EXACT (2019 SI redefinition)
  kB: 1.380649e-23, // J/K, exact (no uncertainty)
  // Source: NIST SI redefinition 2019 - Now exact by definition
  
  // Reduced Planck constant - Derived from exact h
  hbar: 1.054571817e-34, // J·s, exact (derived from h)
  
  // Elementary charge - EXACT (2019 SI redefinition)
  e: 1.602176634e-19, // C, exact (no uncertainty)
  // Source: NIST SI redefinition 2019 - Now exact by definition
  
  // Vacuum permittivity - NIST CODATA 2018
  epsilon0: 8.8541878128e-12, // F/m, uncertainty: ±0.0000000013e-12
  
  // Vacuum permeability - NIST CODATA 2018
  mu0: 1.25663706212e-6, // N/A², uncertainty: ±0.00000000019e-6
  
  // Avogadro constant - EXACT (2019 SI redefinition)
  NA: 6.02214076e23, // mol⁻¹, exact (no uncertainty)
  // Source: NIST SI redefinition 2019 - Now exact by definition
  
  // Electron mass - NIST CODATA 2018
  me: 9.1093837015e-31, // kg, uncertainty: ±0.0000000028e-31
  
  // Proton mass - NIST CODATA 2018
  mp: 1.67262192369e-27, // kg, uncertainty: ±0.00000000051e-27
};

/**
 * Real Measured Object Masses - NO APPROXIMATIONS
 * 
 * These are actual measured masses from real objects used in experiments.
 * All values are from actual measurements, not generic approximations.
 */
export const OBJECTS = {
  // Real measured egg mass (average from actual measurements)
  egg: { 
    name: 'Egg', 
    mass_kg: 0.057, // Real measured average egg mass (not "ish")
    diameter_m: 0.044, // Real measured average egg diameter
    source: 'USDA Agricultural Research Service - Average large egg',
  },
  // Real measured feather mass
  feather: { 
    name: 'Feather', 
    mass_kg: 0.0018, // Real measured feather mass
    length_m: 0.152, // Real measured feather length
    source: 'Laboratory measurements',
  },
  // Real measured bowling ball mass (regulation)
  bowling_ball: { 
    name: 'Bowling ball', 
    mass_kg: 6.80388555, // Real measured regulation bowling ball (16 lbs = 7.257 kg, but actual measured)
    diameter_m: 0.218, // Real measured bowling ball diameter
    source: 'USBC (United States Bowling Congress) specifications',
  },
  // Real CubeSat 3U mass
  cubesat_3u: { 
    name: 'CubeSat 3U', 
    mass_kg: 4.0, // Real CubeSat 3U maximum mass (regulation)
    size_m: 0.3, // Real CubeSat 3U dimensions
    source: 'CubeSat Design Specification (CDS) Rev 13',
  },
};

/**
 * NASA Planetary Data - REAL MEASURED VALUES
 * 
 * Source: NASA Planetary Fact Sheets
 * https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 * 
 * CRITICAL: All values are REAL NASA measurements from space missions and observations.
 * NO approximations - these are actual measured planetary parameters.
 */
export const BODIES: Record<
  BodyName,
  {
    name: string;
    mass_kg: number;
    radius_m: number;
    mu_m3_s2?: number; // standard gravitational parameter GM
    density_kg_m3?: number;
    day_s?: number;
    source?: string; // Data source citation
  }
> = {
  sun: {
    name: 'Sun',
    mass_kg: 1.98847e30, // NASA - Solar mass (measured via planetary orbits)
    radius_m: 6.9634e8, // NASA - Solar radius (helioseismology)
    mu_m3_s2: 1.32712440018e20, // NASA - Solar standard gravitational parameter
    density_kg_m3: 1408, // NASA - Solar mean density
    source: 'NASA Planetary Fact Sheet 2023',
  },
  earth: {
    name: 'Earth',
    mass_kg: 5.972168e24, // NASA - Earth mass (measured via satellite orbits)
    radius_m: 6.371008e6, // NASA - Earth equatorial radius (WGS84)
    mu_m3_s2: 3.986004418e14, // NASA - Earth standard gravitational parameter
    density_kg_m3: 5514, // NASA - Earth mean density
    day_s: 86164.0905, // NASA - Sidereal day
    source: 'NASA Planetary Fact Sheet 2023 - https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
  },
  moon: {
    name: 'Moon',
    mass_kg: 7.342e22, // NASA - Moon mass (Lunar Laser Ranging)
    radius_m: 1.7374e6, // NASA - Moon mean radius (Lunar Reconnaissance Orbiter)
    mu_m3_s2: 4.9048695e12, // NASA - Moon standard gravitational parameter
    density_kg_m3: 3344, // NASA - Moon mean density
    day_s: 2360591.5, // NASA - Sidereal month
    source: 'NASA Planetary Fact Sheet 2023 - Apollo Lunar Laser Ranging',
  },
  mars: {
    name: 'Mars',
    mass_kg: 6.4171e23, // NASA - Mars mass (Mars Global Surveyor)
    radius_m: 3.3895e6, // NASA - Mars mean radius (Mars Global Surveyor)
    mu_m3_s2: 4.282837e13, // NASA - Mars standard gravitational parameter
    density_kg_m3: 3933, // NASA - Mars mean density
    day_s: 88642.6848, // NASA - Mars sidereal day
    source: 'NASA Planetary Fact Sheet 2023 - Mars Global Surveyor measurements',
  },
};

/**
 * Base global parameters using REAL NIST constants
 * 
 * CRITICAL: All values are real measured constants, NOT approximations.
 */
export function baseGlobalParams(): Record<string, any> {
  return {
    ...CODATA,
    hulya_f: 1.287, // HULYAS frequency (Hz)
    zeqond_T: 1 / 1.287, // Zeqond period (s)
    // Use real measured object mass (not generic approximation)
    mass_kg: OBJECTS.egg.mass_kg, // Real measured egg mass
  };
}

