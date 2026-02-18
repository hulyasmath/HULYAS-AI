/**
 * Zeq OS Mathematical Framework - Education Operators
 * Operators for learning theory and pedagogy
 */

import { ZeqOperator } from '../types';

export const EducationOperators: ZeqOperator[] = [
  { id: 'ED1', name: 'Bloom\'s Taxonomy', symbol: 'B_T', domain: 'Education', formula: 'Remember → Understand → Apply → Analyze → Evaluate → Create', description: 'Cognitive learning levels' },
  { id: 'ED2', name: 'Zone of Proximal Development', symbol: 'ZPD', domain: 'Education', formula: 'Current ability → ZPD → Potential with help', description: 'Vygotsky learning zone' },
  { id: 'ED3', name: 'Constructivism', symbol: 'C_T', domain: 'Education', formula: 'Knowledge = active construction by learner', description: 'Learning through building understanding' },
  { id: 'ED4', name: 'Multiple Intelligences', symbol: 'M_I', domain: 'Education', formula: 'Linguistic, logical, spatial, musical, bodily, interpersonal, intrapersonal, naturalistic', description: 'Gardner\'s intelligence types' },
  { id: 'ED5', name: 'Learning Styles', symbol: 'L_S', domain: 'Education', formula: 'Visual, auditory, reading/writing, kinesthetic', description: 'VARK learning preferences' },
  { id: 'ED6', name: 'Formative Assessment', symbol: 'F_A', domain: 'Education', formula: 'Ongoing feedback → adjust instruction', description: 'Assessment for learning' },
  { id: 'ED7', name: 'Summative Assessment', symbol: 'S_A', domain: 'Education', formula: 'End evaluation of learning outcomes', description: 'Assessment of learning' },
  { id: 'ED8', name: 'Differentiated Instruction', symbol: 'D_I', domain: 'Education', formula: 'Adapt content, process, product to learner', description: 'Individualized teaching' },
  { id: 'ED9', name: 'Scaffolding', symbol: 'S_C', domain: 'Education', formula: 'Support → gradual release → independence', description: 'Temporary learning support' },
  { id: 'ED10', name: 'Metacognition', symbol: 'M_C', domain: 'Education', formula: 'Thinking about thinking, self-regulation', description: 'Learning awareness' },
  { id: 'ED11', name: 'Curriculum Design', symbol: 'C_D', domain: 'Education', formula: 'Objectives → content → methods → assessment', description: 'Instructional planning' },
  { id: 'ED12', name: 'Mastery Learning', symbol: 'M_L', domain: 'Education', formula: 'Learn until mastery, not time-based', description: 'Competency-based approach' },
  { id: 'ED13', name: 'Cooperative Learning', symbol: 'C_L', domain: 'Education', formula: 'Positive interdependence, individual accountability', description: 'Group learning methods' },
  { id: 'ED14', name: 'Inquiry-Based Learning', symbol: 'IBL', domain: 'Education', formula: 'Question → investigate → conclude → reflect', description: 'Discovery learning process' },
  { id: 'ED15', name: 'Educational Technology', symbol: 'E_T', domain: 'Education', formula: 'TPACK: technology + pedagogy + content knowledge', description: 'Tech-enhanced learning' },
];

export const getEducationOperator = (id: string): ZeqOperator | undefined => {
  return EducationOperators.find(op => op.id === id);
};
