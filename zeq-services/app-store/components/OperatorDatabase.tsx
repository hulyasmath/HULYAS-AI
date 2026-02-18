import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Database, Filter, ChevronDown, Copy, Check, Atom, Zap, Globe, Brain, Rocket, Heart, TrendingUp, Clock, Settings, Flame, Orbit, Sparkles } from 'lucide-react';

interface Operator {
  id: string;
  internalId: string;
  category: string;
  description: string;
  equation: string;
  equationLaTeX: string;
  equationSource: string;
}

interface OperatorRegistry {
  total: number;
  version: string;
  generated: string;
  categories: string[];
  operators: Operator[];
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  aerospace: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400' },
  astronomy: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  biotech: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  computational: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  consciousness: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
  cosmic: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  differential: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  energy: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  engineering: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  environmental: { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400' },
  finance: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  kinematic: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  material: { bg: 'bg-stone-500/10', border: 'border-stone-500/30', text: 'text-stone-400' },
  medical: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  neuroscience: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400' },
  newtonian: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  quantum: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  quantum_computing: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  relativity: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  robotics: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' },
  special: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  temporal: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
};

const ITEMS_PER_PAGE = 50;

export const OperatorDatabase: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadOperators = async () => {
      try {
        const response = await fetch('/operator-registry.json');
        const data: OperatorRegistry = await response.json();
        setOperators(data.operators);
        setCategories(data.categories);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load operators:', error);
        setLoading(false);
      }
    };
    loadOperators();
  }, []);

  const filteredOperators = useMemo(() => {
    return operators.filter(op => {
      const matchesSearch = searchQuery === '' ||
        op.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.equation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || op.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [operators, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredOperators.length / ITEMS_PER_PAGE);
  const paginatedOperators = filteredOperators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCopy = (equation: string, id: string) => {
    navigator.clipboard.writeText(equation);
    setCopiedId(id);
    // Clear any existing timeout to prevent memory leaks
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryStyle = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
  };

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    operators.forEach(op => {
      stats[op.category] = (stats[op.category] || 0) + 1;
    });
    return stats;
  }, [operators]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-futuristic">Loading 1549 operators...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search operators by ID, description, or equation..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:border-cyan-500/30 transition-colors min-w-[200px]"
          >
            <Filter size={18} className="text-slate-400" />
            <span className="flex-1 text-left capitalize">
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory.replace('_', ' ')}
            </span>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto">
              <button
                onClick={() => { setSelectedCategory('all'); setShowCategoryDropdown(false); setCurrentPage(1); }}
                className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors ${selectedCategory === 'all' ? 'text-cyan-400' : 'text-white'}`}
              >
                All Categories ({operators.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); setCurrentPage(1); }}
                  className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors capitalize ${selectedCategory === cat ? 'text-cyan-400' : 'text-white'}`}
                >
                  {cat.replace('_', ' ')} ({categoryStats[cat] || 0})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <div className="flex items-center gap-2 text-cyan-400">
          <Database size={16} />
          <span className="font-bold">{filteredOperators.length}</span>
          <span className="text-slate-400">operators found</span>
        </div>
        <div className="text-slate-400 text-sm">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Operator Table/List - Database Style */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">ID</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-4">Equation</div>
          <div className="col-span-1 text-center">Copy</div>
        </div>

        {/* Operator Rows */}
        <div className="divide-y divide-white/5">
          {paginatedOperators.map((op, index) => {
            const style = getCategoryStyle(op.category);
            return (
              <div
                key={op.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* ID */}
                <div className="col-span-2">
                  <code className="text-cyan-400 font-mono text-sm font-bold">{op.id}</code>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold capitalize ${style.bg} ${style.border} ${style.text} border`}>
                    {op.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <span className="text-slate-300 text-sm line-clamp-2">{op.description}</span>
                </div>

                {/* Equation */}
                <div className="col-span-4">
                  <code className="text-amber-300/80 font-mono text-xs break-all line-clamp-2">{op.equation}</code>
                </div>

                {/* Copy Button */}
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleCopy(op.equation, op.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Copy equation"
                  >
                    {copiedId === op.id ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} className="text-slate-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Prev
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-black'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Last
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-8">
        {Object.entries(categoryStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([cat, count]) => {
            const style = getCategoryStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`p-4 rounded-xl border ${style.bg} ${style.border} hover:scale-105 transition-all`}
              >
                <div className={`text-2xl font-bold ${style.text}`}>{count}</div>
                <div className="text-slate-400 text-xs capitalize">{cat.replace('_', ' ')}</div>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default OperatorDatabase;
