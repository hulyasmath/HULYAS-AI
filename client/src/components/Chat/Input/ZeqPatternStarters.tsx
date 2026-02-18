import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmitMessage } from '~/hooks';

interface ZeqPattern {
  _id: string;
  title: string;
  promptText: string;
  category: string;
  description?: string;
  icon?: string;
  priority: number;
}

const ZeqPatternStarters = () => {
  const [patterns, setPatterns] = useState<ZeqPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { submitMessage } = useSubmitMessage();

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('/api/zeq-patterns/today');
        if (response.ok) {
          const data = await response.json();
          setPatterns(data.slice(0, 6));
          // Stagger fade-in after data loads
          setTimeout(() => setVisible(true), 100);
        }
      } catch (error) {
        console.error('[ZeqPatternStarters] Failed to fetch patterns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  const handlePatternClick = useCallback(
    async (pattern: ZeqPattern) => {
      // Track click
      try {
        await fetch(`/api/zeq-patterns/${pattern._id}/click`, { method: 'POST' });
      } catch {
        // Non-critical, don't block on tracking failure
      }

      // Submit the pattern prompt directly to the chat
      submitMessage({ text: pattern.promptText });
    },
    [submitMessage],
  );

  if (loading || patterns.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-2 pb-4 pt-2">
      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        {patterns.map((pattern, index) => (
          <button
            key={pattern._id}
            onClick={() => handlePatternClick(pattern)}
            className="group relative flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-border-medium bg-surface-primary px-3 pb-3 pt-2.5 text-start text-[13px] shadow-[0_0_2px_0_rgba(0,0,0,0.05),0_4px_6px_0_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out hover:border-border-heavy hover:bg-surface-tertiary hover:shadow-md"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 0.4s ease ${index * 0.08}s, transform 0.4s ease ${index * 0.08}s`,
            }}
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">{pattern.icon || '\ud83d\udd2e'}</span>
              <span className="line-clamp-1 font-medium text-text-primary transition-colors group-hover:text-text-primary">
                {pattern.title}
              </span>
            </div>
            {/* Description */}
            {pattern.description && (
              <p className="line-clamp-2 break-words text-text-secondary">
                {pattern.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* View Archive Link */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => navigate('/patterns')}
          className="text-xs text-text-tertiary transition-colors hover:text-text-secondary"
        >
          View all patterns &rarr;
        </button>
      </div>
    </div>
  );
};

export default ZeqPatternStarters;
