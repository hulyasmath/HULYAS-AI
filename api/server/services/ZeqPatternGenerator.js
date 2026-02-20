const { logger } = require('@librechat/data-schemas');

let ZeqPattern;
try {
  ({ ZeqPattern } = require('~/models/ZeqPattern'));
} catch (e) {
  // Fallback for different module resolution
  try {
    ({ ZeqPattern } = require('../../models/ZeqPattern'));
  } catch (e2) {
    console.warn('[ZeqPatternGenerator] Could not load ZeqPattern model:', e2.message);
  }
}

const DAILY_PATTERN_COUNT = 6;
const THREE_HOURS = 3 * 60 * 60 * 1000;

/**
 * Select today's 6 patterns for display.
 *
 * Algorithm:
 * 1. Check if today already has patterns selected. If yes, return them.
 * 2. Otherwise, select 6 from the active pool using weighted-random by priority,
 *    ensuring category diversity (no more than 2 from the same category).
 * 3. Set displayDate to today and increment displayCount.
 * 4. Return the 6 selected patterns.
 */
async function generateDailyPatterns(count) {
  if (!ZeqPattern) {
    logger.warn('[ZeqPatternGenerator] ZeqPattern model not available');
    return [];
  }

  const patternCount = count || DAILY_PATTERN_COUNT;

  try {
    // Check if patterns were already generated in the current 3-hour window
    const now = new Date();
    const windowStart = new Date(now.getTime() - THREE_HOURS);

    const existingToday = await ZeqPattern.find({
      displayDate: { $gte: windowStart, $lte: now },
      isActive: true,
    })
      .sort({ priority: -1 })
      .lean();

    if (existingToday.length >= patternCount) {
      return existingToday.slice(0, patternCount);
    }

    // Get all active patterns
    const allActive = await ZeqPattern.find({ isActive: true }).lean();

    if (allActive.length === 0) {
      logger.warn('[ZeqPatternGenerator] No active patterns found');
      return [];
    }

    // Weighted random selection with category diversity
    const selected = [];
    const categoryCounts = {};
    const usedIds = new Set(existingToday.map((p) => p._id.toString()));

    // Include already-selected today patterns
    for (const p of existingToday) {
      selected.push(p);
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    }

    // Build weighted pool (excluding already selected)
    const remaining = allActive.filter((p) => !usedIds.has(p._id.toString()));

    while (selected.length < patternCount && remaining.length > 0) {
      // Build weighted array respecting category limits
      const eligible = remaining.filter((p) => {
        const catCount = categoryCounts[p.category] || 0;
        return catCount < 2; // Max 2 per category
      });

      // If no eligible patterns (all categories maxed), allow any remaining
      const pool = eligible.length > 0 ? eligible : remaining;

      if (pool.length === 0) break;

      // Weighted random by priority
      const weighted = [];
      for (const p of pool) {
        for (let i = 0; i < p.priority; i++) {
          weighted.push(p);
        }
      }

      const pick = weighted[Math.floor(Math.random() * weighted.length)];
      selected.push(pick);
      categoryCounts[pick.category] = (categoryCounts[pick.category] || 0) + 1;

      // Remove from remaining
      const idx = remaining.findIndex((p) => p._id.toString() === pick._id.toString());
      if (idx >= 0) remaining.splice(idx, 1);
    }

    // Update displayDate and displayCount for newly selected patterns
    const newlySelected = selected.filter((p) => !usedIds.has(p._id.toString()));
    const updatePromises = newlySelected.map((p) =>
      ZeqPattern.findByIdAndUpdate(p._id, {
        displayDate: now,
        $inc: { displayCount: 1 },
      }),
    );

    await Promise.all(updatePromises);

    logger.info(
      `[ZeqPatternGenerator] Selected ${selected.length} patterns for today (${newlySelected.length} new)`,
    );

    return selected.slice(0, patternCount);
  } catch (error) {
    logger.error('[ZeqPatternGenerator] Error generating daily patterns:', error.message);
    return [];
  }
}

/**
 * Initialize the daily pattern scheduler.
 * Runs generateDailyPatterns immediately and then every 24 hours.
 */
function initDailyScheduler() {
  // Run immediately on startup
  generateDailyPatterns(DAILY_PATTERN_COUNT)
    .then((patterns) => {
      logger.info(`[ZeqPatternGenerator] Initial generation: ${patterns.length} patterns selected`);
    })
    .catch((err) => {
      logger.error('[ZeqPatternGenerator] Initial generation error:', err.message);
    });

  // Schedule every 3 hours
  setInterval(async () => {
    try {
      const patterns = await generateDailyPatterns(DAILY_PATTERN_COUNT);
      logger.info(`[ZeqPatternGenerator] 3h rotation: ${patterns.length} patterns selected`);
    } catch (error) {
      logger.error('[ZeqPatternGenerator] 3h rotation error:', error.message);
    }
  }, THREE_HOURS);

  logger.info('[ZeqPatternGenerator] Pattern scheduler initialized (every 3 hours)');
}

module.exports = {
  generateDailyPatterns,
  initDailyScheduler,
  DAILY_PATTERN_COUNT,
  THREE_HOURS,
};
