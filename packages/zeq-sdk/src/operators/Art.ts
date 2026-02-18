/**
 * Zeq OS Mathematical Framework - Art Operators
 * Operators for visual arts and aesthetic analysis
 */

import { ZeqOperator } from '../types';

export const ArtOperators: ZeqOperator[] = [
  { id: 'AR1', name: 'Golden Ratio', symbol: 'φ', domain: 'Art', formula: 'φ = (1 + √5)/2 ≈ 1.618', description: 'Aesthetic proportion' },
  { id: 'AR2', name: 'Color Theory', symbol: 'C_T', domain: 'Art', formula: 'RGB, CMYK, HSV, complementary, analogous', description: 'Color relationships and mixing' },
  { id: 'AR3', name: 'Composition', symbol: 'C_M', domain: 'Art', formula: 'Rule of thirds, balance, focal points', description: 'Visual arrangement principles' },
  { id: 'AR4', name: 'Perspective', symbol: 'P_S', domain: 'Art', formula: '1-point, 2-point, 3-point, atmospheric', description: 'Depth and space representation' },
  { id: 'AR5', name: 'Gestalt Principles', symbol: 'G_P', domain: 'Art', formula: 'Proximity, similarity, closure, continuity', description: 'Visual perception organization' },
  { id: 'AR6', name: 'Visual Hierarchy', symbol: 'V_H', domain: 'Art', formula: 'Size, color, contrast, position ordering', description: 'Attention direction design' },
  { id: 'AR7', name: 'Typography', symbol: 'T_Y', domain: 'Art', formula: 'Font families, kerning, leading, hierarchy', description: 'Text design principles' },
  { id: 'AR8', name: 'Iconography', symbol: 'I_C', domain: 'Art', formula: 'Symbol → meaning mapping, cultural codes', description: 'Symbolic content analysis' },
  { id: 'AR9', name: 'Art History Periods', symbol: 'A_H', domain: 'Art', formula: 'Renaissance, Baroque, Modern, Contemporary', description: 'Historical style classification' },
  { id: 'AR10', name: 'Digital Imaging', symbol: 'D_I', domain: 'Art', formula: 'Pixels, resolution, color depth, formats', description: 'Digital image fundamentals' },
  { id: 'AR11', name: 'Aesthetic Evaluation', symbol: 'A_E', domain: 'Art', formula: 'Beauty = f(form, content, context)', description: 'Artistic quality assessment' },
  { id: 'AR12', name: '3D Modeling', symbol: '3D_M', domain: 'Art', formula: 'Vertices, edges, faces, transforms', description: 'Three-dimensional representation' },
  { id: 'AR13', name: 'Animation Principles', symbol: 'A_P', domain: 'Art', formula: 'Squash, stretch, anticipation, timing', description: '12 principles of animation' },
  { id: 'AR14', name: 'Semiotics of Art', symbol: 'S_A', domain: 'Art', formula: 'Sign = signifier + signified, denotation/connotation', description: 'Meaning in visual signs' },
  { id: 'AR15', name: 'Design Thinking', symbol: 'D_T', domain: 'Art', formula: 'Empathize → Define → Ideate → Prototype → Test', description: 'Creative problem-solving process' },
];

export const getArtOperator = (id: string): ZeqOperator | undefined => {
  return ArtOperators.find(op => op.id === id);
};
