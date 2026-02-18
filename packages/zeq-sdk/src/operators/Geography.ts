/**
 * Zeq OS Mathematical Framework - Geography Operators
 * Operators for spatial analysis and earth systems
 */

import { ZeqOperator } from '../types';

export const GeographyOperators: ZeqOperator[] = [
  { id: 'GE1', name: 'Spatial Analysis', symbol: 'S_A', domain: 'Geography', formula: 'Pattern, process, scale, location', description: 'Spatial relationship study' },
  { id: 'GE2', name: 'GIS Operations', symbol: 'G_IS', domain: 'Geography', formula: 'Overlay, buffer, proximity, network analysis', description: 'Geographic information systems' },
  { id: 'GE3', name: 'Remote Sensing', symbol: 'R_S', domain: 'Geography', formula: 'Spectral bands, classification, change detection', description: 'Satellite image analysis' },
  { id: 'GE4', name: 'Tobler\'s Law', symbol: 'T_L', domain: 'Geography', formula: 'Near things more related than distant things', description: 'First law of geography' },
  { id: 'GE5', name: 'Central Place Theory', symbol: 'C_PT', domain: 'Geography', formula: 'Hexagonal market areas, urban hierarchy', description: 'Christaller settlement theory' },
  { id: 'GE6', name: 'Diffusion Models', symbol: 'D_M', domain: 'Geography', formula: 'Innovation spread through space and time', description: 'Hägerstrand diffusion' },
  { id: 'GE7', name: 'Climate Systems', symbol: 'C_S', domain: 'Geography', formula: 'Energy balance, circulation, zones', description: 'Global climate patterns' },
  { id: 'GE8', name: 'Geomorphology', symbol: 'G_M', domain: 'Geography', formula: 'Landform processes, erosion, deposition', description: 'Earth surface processes' },
  { id: 'GE9', name: 'Population Geography', symbol: 'P_G', domain: 'Geography', formula: 'Distribution, density, migration flows', description: 'Human population patterns' },
  { id: 'GE10', name: 'Economic Geography', symbol: 'E_G', domain: 'Geography', formula: 'Location theory, agglomeration, trade', description: 'Spatial economic patterns' },
  { id: 'GE11', name: 'Urban Geography', symbol: 'U_G', domain: 'Geography', formula: 'City structure, land use, urban systems', description: 'Urban spatial organization' },
  { id: 'GE12', name: 'Political Geography', symbol: 'P_G2', domain: 'Geography', formula: 'Boundaries, territories, geopolitics', description: 'Space and political power' },
  { id: 'GE13', name: 'Cartography', symbol: 'C_R', domain: 'Geography', formula: 'Projection, scale, symbolization', description: 'Map making and design' },
  { id: 'GE14', name: 'Biogeography', symbol: 'B_G', domain: 'Geography', formula: 'Species distribution, island biogeography', description: 'Spatial ecology' },
  { id: 'GE15', name: 'Hazard Geography', symbol: 'H_G', domain: 'Geography', formula: 'Risk = hazard × vulnerability × exposure', description: 'Natural hazard assessment' },
];

export const getGeographyOperator = (id: string): ZeqOperator | undefined => {
  return GeographyOperators.find(op => op.id === id);
};
