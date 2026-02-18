import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Sparkles, ArrowLeft, Clock, Tag, Zap } from 'lucide-react';

interface Pattern {
  _id: string;
  title: string;
  promptText: string;
  category: string;
  description?: string;
  icon?: string;
  priority: number;
  isActive: boolean;
  displayCount: number;
  clickCount: number;
  createdAt: string;
  isAIGenerated?: boolean;
}

interface Category {
  _id: string;
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface CoherenceMessage {
  _id: string;
  text: string;
  category: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PatternsArchive() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coherenceMessage, setCoherenceMessage] = useState<CoherenceMessage | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Fetch coherence message
  useEffect(() => {
    const fetchCoherence = async () => {
      try {
        const response = await fetch('/api/zeq-patterns/coherence?type=random');
        if (response.ok) {
          const data = await response.json();
          setCoherenceMessage(data);
        }
      } catch (error) {
        console.error('Failed to fetch coherence message:', error);
      }
    };

    fetchCoherence();

    // Rotate message every 30 seconds
    const interval = setInterval(fetchCoherence, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch patterns
  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/zeq-patterns/archive?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns);
        setCategories(data.categories);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch patterns:', error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  // Handle pattern click - navigate to chat with the prompt
  const handlePatternClick = async (pattern: Pattern) => {
    try {
      // Track click
      await fetch(`/api/zeq-patterns/${pattern._id}/click`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track click:', error);
    }

    // Navigate to chat with the prompt
    // Store the prompt in sessionStorage for the chat to pick up
    sessionStorage.setItem('zeqPatternPrompt', pattern.promptText);
    navigate('/c/new');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatterns();
  };

  const getCategoryColor = (categoryValue: string) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category?.color || '#22d3ee';
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find((c) => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0a0a0b] text-[#f0f0f2]">
      {/* Header with Coherence Message */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a1e] to-[#0a0a0b] border-b border-[#2a2a2e]">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#22d3ee_0%,transparent_50%)] animate-pulse" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#a0a0a8] hover:text-[#f0f0f2] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </button>

          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-[#22d3ee]" />
            <h1 className="text-3xl font-bold">Zeq Patterns Archive</h1>
          </div>

          {/* Coherence Message */}
          <div className="relative p-4 rounded-lg bg-[#111113]/80 border border-[#22d3ee]/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-[#22d3ee] mt-0.5 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-sm text-[#a0a0a8] font-mono leading-relaxed">
                  {coherenceMessage?.text ||
                    'The Operating System for Physics and Computation — 646+ kinematic operators phase-locked to the 1.287 Hz HulyaPulse.'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-[#22d3ee] font-medium">
                    <span className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse" />
                    COHERENCE ACTIVE
                  </span>
                  <span className="text-xs text-[#606068]">|</span>
                  <span className="text-xs text-[#606068]">1.287 Hz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#606068]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patterns..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111113] border border-[#2a2a2e] text-[#f0f0f2] placeholder-[#606068] focus:outline-none focus:border-[#22d3ee]"
              />
            </div>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#606068]" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-[#111113] border border-[#2a2a2e] text-[#f0f0f2] focus:outline-none focus:border-[#22d3ee]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? 'bg-[#22d3ee] text-white'
                : 'bg-[#1a1a1e] text-[#a0a0a8] hover:bg-[#2a2a2e]'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? 'text-white'
                  : 'bg-[#1a1a1e] text-[#a0a0a8] hover:bg-[#2a2a2e]'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === cat.value ? cat.color || '#22d3ee' : undefined,
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {pagination && (
          <p className="text-sm text-[#606068] mb-4">
            Showing {patterns.length} of {pagination.total} patterns
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Patterns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pattern) => (
                <button
                  key={pattern._id}
                  onClick={() => handlePatternClick(pattern)}
                  className="group p-4 rounded-lg bg-[#111113] border border-[#2a2a2e] hover:border-[#22d3ee]/50 text-left transition-all hover:shadow-lg hover:shadow-[#22d3ee]/10"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{pattern.icon || '🔮'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#f0f0f2] group-hover:text-[#22d3ee] transition-colors line-clamp-1">
                        {pattern.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${getCategoryColor(pattern.category)}20`,
                            color: getCategoryColor(pattern.category),
                          }}
                        >
                          {getCategoryLabel(pattern.category)}
                        </span>
                        {pattern.isAIGenerated && (
                          <span className="px-2 py-0.5 rounded text-xs bg-[#22d3ee]/10 text-[#22d3ee]">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-[#a0a0a8] line-clamp-2">
                        {pattern.description || pattern.promptText}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-[#606068]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(pattern.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {pattern.clickCount} clicks
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Empty State */}
            {patterns.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-[#606068] mx-auto mb-4" />
                <p className="text-[#a0a0a8]">No patterns found</p>
                <p className="text-sm text-[#606068] mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-[#a0a0a8] hover:bg-[#2a2a2e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[#606068]">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-[#a0a0a8] hover:bg-[#2a2a2e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2a2e] bg-[#0a0a0b]">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-[#606068]">
            Zeq OS Mathematical Intelligence Framework | 1.287 Hz HulyaPulse
          </p>
        </div>
      </div>
    </div>
  );
}
