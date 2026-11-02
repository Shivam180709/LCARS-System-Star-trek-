import { SCIENCE_DATABASE } from '../data/scienceData';
import { STAR_TREK_CANON_DATABASE } from '../data/starTrekData';

/**
 * Intelligent local archive lookup for Starfleet LCARS queries.
 * Provides instant offline answers when running statically (e.g. itch.io)
 * or when Gemini API is unavailable.
 */
export function getStarfleetBriefAnswer(query: string, contextTopic?: string): string {
  const combined = `${query} ${contextTopic || ''}`.toLowerCase().trim();
  const words = combined
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        ![
          'the',
          'and',
          'for',
          'what',
          'how',
          'why',
          'explain',
          'does',
          'can',
          'you',
          'tell',
          'about',
          'with',
          'from',
          'are',
        ].includes(w)
    );

  // 1. Score Science Database entries
  let bestScienceScore = 0;
  let bestScience = SCIENCE_DATABASE[0];
  for (const item of SCIENCE_DATABASE) {
    const hay = `${item.title} ${item.subtitle} ${item.tags.join(' ')} ${item.realScience} ${item.starTrekCanon || ''}`.toLowerCase();
    let score = 0;
    if (combined.includes(item.title.toLowerCase())) score += 10;
    for (const w of words) {
      if (item.title.toLowerCase().includes(w)) score += 4;
      else if (item.tags.some((t) => t.toLowerCase().includes(w))) score += 3;
      else if (hay.includes(w)) score += 1;
    }
    if (score > bestScienceScore) {
      bestScienceScore = score;
      bestScience = item;
    }
  }

  // 2. Score Star Trek Canon entries
  let bestCanonScore = 0;
  let bestCanon = STAR_TREK_CANON_DATABASE[0];
  for (const item of STAR_TREK_CANON_DATABASE) {
    const hay = `${item.title} ${item.designation || ''} ${item.starTrekLore} ${item.realScienceFact}`.toLowerCase();
    let score = 0;
    if (combined.includes(item.title.toLowerCase())) score += 10;
    for (const w of words) {
      if (item.title.toLowerCase().includes(w)) score += 4;
      else if (hay.includes(w)) score += 1;
    }
    if (score > bestCanonScore) {
      bestCanonScore = score;
      bestCanon = item;
    }
  }

  if (bestScienceScore >= bestCanonScore && bestScienceScore >= 2) {
    return `${bestScience.realScience} ${bestScience.starTrekCanon || ''}`.trim();
  }
  if (bestCanonScore >= 2) {
    const cleanScience = bestCanon.realScienceFact.replace(/^REAL SCIENCE:\s*/i, '');
    return `${bestCanon.starTrekLore} ${cleanScience}`.trim();
  }

  return `Regarding "${query.trim()}", Starfleet LCARS databases correlate real-world physics, astronomy, and planetary science with Federation exploration telemetry. Please ask a specific follow-up detail or select any database module for deeper analysis.`;
}
