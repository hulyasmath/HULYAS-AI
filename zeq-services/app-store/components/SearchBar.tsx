import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { AppFilters } from '../services/api';

interface SearchBarProps {
  onSearch: (filters: AppFilters) => void;
  onCategoryChange: (category: string | null) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onCategoryChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Productivity', 'Games', 'Creative', 'Utilities', 'Social'];

  const handleSearch = () => {
    onSearch({
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
    });
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    onCategoryChange(category);
    onSearch({
      search: searchQuery || undefined,
      category: category || undefined,
    });
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                handleSearch();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border transition-colors ${
            showFilters
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Filter size={20} />
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-colors"
        >
          Search
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
