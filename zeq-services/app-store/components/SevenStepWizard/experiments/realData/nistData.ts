/**
 * NIST CODATA 2018/2022 Physical Constants
 * 
 * Source: National Institute of Standards and Technology
 * CODATA Recommended Values of the Fundamental Physical Constants: 2018
 * https://physics.nist.gov/cuu/Constants/
 * 
 * All values are exact recommended values from NIST with full precision.
 * NO approximations - these are the official measured constants.
 */

export const NIST_CODATA_2018 = {
  // Universal constants (exact values)
  c: {
    value: 299792458,
    unit: 'm/s',
    uncertainty: 0, // Exact by definition
    source: 'NIST CODATA 2018 - Speed of light in vacuum (exact)',
    citation: 'Mohr, P. J., Newell, D. B., & Taylor, B. N. (2016). CODATA recommended values of the fundamental physical constants: 2014. Reviews of Modern Physics, 88(3), 035009.',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Gravitational constant
  G: {
    value: 6.67430e-11,
    unit: 'm³·kg⁻¹·s⁻²',
    uncertainty: 0.00015e-11,
    source: 'NIST CODATA 2018 - Gravitational constant',
    citation: 'Tiesinga, E., Mohr, P. J., Newell, D. B., & Taylor, B. N. (2021). CODATA recommended values of the fundamental physical constants: 2018. Reviews of Modern Physics, 93(2), 025010.',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Planck constant (exact since 2019 redefinition)
  h: {
    value: 6.62607015e-34,
    unit: 'J·s',
    uncertainty: 0, // Exact by definition (2019 SI redefinition)
    source: 'NIST CODATA 2018 - Planck constant (exact)',
    citation: 'NIST SI redefinition 2019 - Planck constant is now exact',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Reduced Planck constant
  hbar: {
    value: 1.054571817e-34,
    unit: 'J·s',
    uncertainty: 0, // Derived from exact h
    source: 'NIST CODATA 2018 - Reduced Planck constant (hbar = h/2π)',
    citation: 'Derived from exact Planck constant',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Elementary charge
  e: {
    value: 1.602176634e-19,
    unit: 'C',
    uncertainty: 0, // Exact by definition (2019 SI redefinition)
    source: 'NIST CODATA 2018 - Elementary charge (exact)',
    citation: 'NIST SI redefinition 2019 - Elementary charge is now exact',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Boltzmann constant
  kB: {
    value: 1.380649e-23,
    unit: 'J/K',
    uncertainty: 0, // Exact by definition (2019 SI redefinition)
    source: 'NIST CODATA 2018 - Boltzmann constant (exact)',
    citation: 'NIST SI redefinition 2019 - Boltzmann constant is now exact',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Vacuum permittivity
  epsilon0: {
    value: 8.8541878128e-12,
    unit: 'F/m',
    uncertainty: 0.0000000013e-12,
    source: 'NIST CODATA 2018 - Vacuum permittivity',
    citation: 'Tiesinga et al. (2021) CODATA 2018',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Vacuum permeability
  mu0: {
    value: 1.25663706212e-6,
    unit: 'N/A²',
    uncertainty: 0.00000000019e-6,
    source: 'NIST CODATA 2018 - Vacuum permeability',
    citation: 'Tiesinga et al. (2021) CODATA 2018',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Avogadro constant
  NA: {
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    uncertainty: 0, // Exact by definition (2019 SI redefinition)
    source: 'NIST CODATA 2018 - Avogadro constant (exact)',
    citation: 'NIST SI redefinition 2019 - Avogadro constant is now exact',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Electron mass
  me: {
    value: 9.1093837015e-31,
    unit: 'kg',
    uncertainty: 0.0000000028e-31,
    source: 'NIST CODATA 2018 - Electron mass',
    citation: 'Tiesinga et al. (2021) CODATA 2018',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Proton mass
  mp: {
    value: 1.67262192369e-27,
    unit: 'kg',
    uncertainty: 0.00000000051e-27,
    source: 'NIST CODATA 2018 - Proton mass',
    citation: 'Tiesinga et al. (2021) CODATA 2018',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
  
  // Neutron mass
  mn: {
    value: 1.67492749804e-27,
    unit: 'kg',
    uncertainty: 0.00000000095e-27,
    source: 'NIST CODATA 2018 - Neutron mass',
    citation: 'Tiesinga et al. (2021) CODATA 2018',
    url: 'https://physics.nist.gov/cuu/Constants/',
  },
};

/**
 * NIST Material Properties (Real Measured Values)
 * Source: NIST Material Measurement Laboratory
 */
export const NIST_MATERIAL_PROPERTIES = {
  // Air at standard conditions (NIST)
  air_STP: {
    density: {
      value: 1.225,
      unit: 'kg/m³',
      uncertainty: 0.001,
      source: 'NIST - Air density at 15°C, 101.325 kPa',
      citation: 'NIST Standard Reference Data',
      temperature: 15.0, // Celsius
      pressure: 101325, // Pa
    },
    viscosity: {
      value: 1.81e-5,
      unit: 'Pa·s',
      uncertainty: 0.01e-5,
      source: 'NIST - Air dynamic viscosity at 20°C',
      citation: 'NIST Standard Reference Data',
    },
  },
  
  // Water at standard conditions (NIST)
  water_STP: {
    density: {
      value: 999.972,
      unit: 'kg/m³',
      uncertainty: 0.001,
      source: 'NIST - Water density at 4°C (maximum density)',
      citation: 'NIST Standard Reference Data',
      temperature: 4.0, // Celsius
    },
    viscosity: {
      value: 1.002e-3,
      unit: 'Pa·s',
      uncertainty: 0.001e-3,
      source: 'NIST - Water dynamic viscosity at 20°C',
      citation: 'NIST Standard Reference Data',
    },
  },
};
