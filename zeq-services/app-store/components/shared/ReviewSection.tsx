import React, { useState, useEffect } from 'react';
import { Star, Send, User, Loader2 } from 'lucide-react';
import { API_BASE, ReviewData } from './types';

interface ReviewSectionProps {
  appId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ appId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/apps/${appId}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data : data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [appId]);

  const submit = async () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE}/api/apps/${appId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review_text: reviewText, user_id: 'anonymous' }),
      });
      if (resp.ok) {
        const newReview = await resp.json();
        setReviews(prev => [newReview, ...prev]);
        setReviewText('');
        setRating(5);
      }
    } catch { /* ignored */ }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />
            ))}
          </div>
          <span className="text-sm text-slate-400">{avgRating.toFixed(1)} ({reviews.length})</span>
        </div>
      </div>

      {/* Submit form */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
              className="p-0.5"
            >
              <Star size={20} className={s <= (hoverRating || rating) ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Write a review..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            onClick={submit}
            disabled={submitting || !reviewText.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-500" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {reviews.map((review, i) => (
            <div key={review.id || i} className="flex gap-3 py-2 border-t border-slate-700/50 first:border-0">
              <User size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} className={s <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-600'} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date((review.createdAt || 0) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{review.reviewText}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
