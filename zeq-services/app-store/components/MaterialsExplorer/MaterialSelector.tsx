import React from 'react';

export interface Material {
  id: string;
  name: string;
  shortName: string;
  youngsModulus: number;  // GPa
  yieldStrength: number;  // MPa
  ultimateTensileStrength: number;  // MPa
  density: number;  // kg/m^3
  fatigueSigmaF: number;  // fatigue strength coefficient MPa
  fatigueB: number;  // fatigue exponent
  color: string;
}

export const MATERIALS: Material[] = [
  {
    id: 'steel-1018',
    name: 'Steel 1018',
    shortName: '1018',
    youngsModulus: 200,
    yieldStrength: 370,
    ultimateTensileStrength: 440,
    density: 7850,
    fatigueSigmaF: 700,
    fatigueB: -0.12,
    color: '#64748b',
  },
  {
    id: 'al-6061',
    name: 'Aluminum 6061',
    shortName: '6061',
    youngsModulus: 69,
    yieldStrength: 276,
    ultimateTensileStrength: 310,
    density: 2700,
    fatigueSigmaF: 480,
    fatigueB: -0.12,
    color: '#06b6d4',
  },
  {
    id: 'ti-6al-4v',
    name: 'Titanium Ti-6Al-4V',
    shortName: 'Ti-6-4',
    youngsModulus: 114,
    yieldStrength: 880,
    ultimateTensileStrength: 950,
    density: 4430,
    fatigueSigmaF: 1200,
    fatigueB: -0.12,
    color: '#a855f7',
  },
  {
    id: 'cfrp',
    name: 'Carbon Fiber',
    shortName: 'CFRP',
    youngsModulus: 181,
    yieldStrength: 3500,
    ultimateTensileStrength: 3500,
    density: 1600,
    fatigueSigmaF: 4000,
    fatigueB: -0.10,
    color: '#f97316',
  },
];

interface MaterialSelectorProps {
  selectedMaterial: Material;
  onSelectMaterial: (material: Material) => void;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({ selectedMaterial, onSelectMaterial }) => {
  return (
    <div className="space-y-2">
      {MATERIALS.map((mat) => {
        const isSelected = mat.id === selectedMaterial.id;
        return (
          <button
            key={mat.id}
            onClick={() => onSelectMaterial(mat)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              isSelected
                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/5'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: mat.color }}
              />
              <span className={`text-sm font-semibold ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`}>
                {mat.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-slate-500">E:</span>{' '}
                <span className="text-slate-300 font-mono">{mat.youngsModulus} GPa</span>
              </div>
              <div>
                <span className="text-slate-500">&sigma;_y:</span>{' '}
                <span className="text-slate-300 font-mono">{mat.yieldStrength} MPa</span>
              </div>
              <div>
                <span className="text-slate-500">&sigma;_uts:</span>{' '}
                <span className="text-slate-300 font-mono">{mat.ultimateTensileStrength} MPa</span>
              </div>
              <div>
                <span className="text-slate-500">&rho;:</span>{' '}
                <span className="text-slate-300 font-mono">{mat.density} kg/m&sup3;</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MaterialSelector;
