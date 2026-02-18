import React from 'react';
import type { RegistryOperator } from './catalog';
import { categoryLabel } from './catalog';

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    kinematic: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    quantum: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
    newtonian: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    relativity: 'border-pink-500/30 bg-pink-500/10 text-pink-200',
    computational: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    consciousness: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200',
    atmospheric_earth_system: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  };
  return map[category] || 'border-white/10 bg-white/5 text-slate-200';
}

export function OperatorTile(props: {
  op: RegistryOperator;
  selected: boolean;
  onClick: () => void;
}) {
  const { op, selected, onClick } = props;
  const cls = categoryColor(op.category);

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-2xl border p-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${cls} ${
        selected ? 'ring-2 ring-cyan-500/30' : ''
      }`}
      title={op.description}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-mono font-bold text-sm">{op.id}</div>
        {selected ? (
          <div className="text-[10px] uppercase tracking-widest text-slate-300/80">Selected</div>
        ) : null}
      </div>
      <div className="text-[10px] uppercase tracking-widest opacity-70 mt-2">{categoryLabel(op.category)}</div>
      <div className="text-xs text-slate-200/80 mt-1 line-clamp-2">{op.description}</div>
    </button>
  );
}

