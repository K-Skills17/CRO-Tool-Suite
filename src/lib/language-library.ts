/**
 * Customer Language Extraction & Storage Library
 * Part of Tool 2: Conversion Copy Laboratory.
 *
 * Extracts pain points, desires, emotional triggers, and objections from
 * raw customer text (reviews, testimonials, support tickets). Aggregates
 * findings into a reusable LanguageProfile for copy generation.
 */

import {
  createAppError,
  handleError,
  ErrorCode,
  type AppError,
} from '@/utils/errors';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Phrase {
  text: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ExtractedLanguage {
  painPoints: Phrase[];
  desires: Phrase[];
  emotional: Phrase[];
  objections: Phrase[];
  commonPhrases: Phrase[];
}

export interface LanguageProfile {
  topPainPoints: Phrase[];
  topDesires: Phrase[];
  topEmotional: Phrase[];
  phraseCount: number;
  sourcesAnalyzed: number;
}

// ---------------------------------------------------------------------------
// Constants - Pattern dictionaries for extraction
// ---------------------------------------------------------------------------

const PAIN_POINT_INDICATORS = [
  'frustrated', 'annoyed', 'disappointed', 'hate', 'terrible',
  'worst', 'awful', 'horrible', 'struggle', 'suffering',
  'can\'t', 'unable', 'impossible', 'difficult', 'hard to',
  'pain', 'ache', 'hurt', 'uncomfortable', 'problem',
  'issue', 'concern', 'worry', 'fear', 'afraid',
  'expensive', 'costly', 'overpriced', 'rip off', 'waste',
  'slow', 'wait', 'delayed', 'long time', 'took forever',
  'rude', 'unprofessional', 'careless', 'ignored',
  'confusing', 'unclear', 'complicated', 'no information',
];

const DESIRE_INDICATORS = [
  'wish', 'want', 'need', 'hope', 'looking for',
  'would love', 'dream', 'desire', 'prefer', 'ideal',
  'finally', 'at last', 'amazing', 'perfect', 'excellent',
  'best', 'love', 'fantastic', 'wonderful', 'great',
  'recommend', 'glad', 'happy', 'satisfied', 'impressed',
  'comfortable', 'painless', 'easy', 'quick', 'fast',
  'friendly', 'caring', 'professional', 'clean', 'modern',
  'affordable', 'worth it', 'fair price', 'reasonable',
  'confident', 'relief', 'better', 'improved', 'transformed',
];

const EMOTIONAL_INDICATORS = [
  'scared', 'terrified', 'nervous', 'anxious', 'worried',
  'relieved', 'grateful', 'thankful', 'blessed', 'emotional',
  'crying', 'tears', 'overwhelmed', 'shocked', 'surprised',
  'confident', 'empowered', 'hopeful', 'excited', 'thrilled',
  'frustrated', 'angry', 'furious', 'upset', 'devastated',
  'calm', 'peaceful', 'relaxed', 'safe', 'secure',
  'embarrassed', 'ashamed', 'self-conscious', 'insecure',
  'proud', 'beautiful', 'handsome', 'attractive',
  'life-changing', 'game-changer', 'miracle', 'incredible',
];

const OBJECTION_INDICATORS = [
  'too expensive', 'can\'t afford', 'not worth', 'overpriced',
  'don\'t trust', 'not sure', 'skeptical', 'doubt', 'hesitant',
  'afraid', 'scared of', 'fear of', 'worried about',
  'don\'t need', 'unnecessary', 'not necessary',
  'takes too long', 'no time', 'busy', 'inconvenient',
  'heard bad things', 'bad reviews', 'bad experience',
  'will it work', 'does it work', 'not effective',
  'side effects', 'risks', 'dangerous', 'unsafe',
  'tried before', 'didn\'t work', 'failed', 'no results',
  'insurance', 'coverage', 'out of pocket',
  'too far', 'location', 'travel', 'distance',
];

// ---------------------------------------------------------------------------
// 1. extractPhrases
// ---------------------------------------------------------------------------

/**
 * Extracts categorised phrases from raw customer text (reviews,
 * testimonials, support tickets).
 *
 * @param text - Raw input text from customer sources.
 */
export function extractPhrases(text: string): ExtractedLanguage {
  if (!text || text.trim().length === 0) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'Text is required for language extraction.',
      { field: 'text' },
    );
  }

  try {
    const sentences = splitIntoSentences(text);

    const painPoints = extractCategory(sentences, PAIN_POINT_INDICATORS, 'negative');
    const desires = extractCategory(sentences, DESIRE_INDICATORS, 'positive');
    const emotional = extractCategory(sentences, EMOTIONAL_INDICATORS, 'neutral');
    const objections = extractCategory(sentences, OBJECTION_INDICATORS, 'negative');
    const commonPhrases = extractCommonPhrases(text);

    // Re-classify emotional phrases by their actual sentiment
    for (const phrase of emotional) {
      phrase.sentiment = classifySentiment(phrase.text);
    }

    return {
      painPoints: sortByFrequency(painPoints),
      desires: sortByFrequency(desires),
      emotional: sortByFrequency(emotional),
      objections: sortByFrequency(objections),
      commonPhrases: sortByFrequency(commonPhrases),
    };
  } catch (error) {
    if ((error as AppError).code) throw error;
    throw handleError(error);
  }
}

// ---------------------------------------------------------------------------
// 2. buildLanguageProfile
// ---------------------------------------------------------------------------

/**
 * Aggregates multiple ExtractedLanguage entries into a unified
 * LanguageProfile, ranking phrases by cumulative frequency.
 *
 * @param entries - Array of previously extracted language sets.
 */
export function buildLanguageProfile(entries: ExtractedLanguage[]): LanguageProfile {
  if (!entries || entries.length === 0) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'At least one ExtractedLanguage entry is required to build a profile.',
      { field: 'entries' },
    );
  }

  try {
    const painMap = new Map<string, Phrase>();
    const desireMap = new Map<string, Phrase>();
    const emotionalMap = new Map<string, Phrase>();

    for (const entry of entries) {
      mergePhrases(painMap, entry.painPoints);
      mergePhrases(desireMap, entry.desires);
      mergePhrases(emotionalMap, entry.emotional);
    }

    const topPainPoints = mapToSortedArray(painMap).slice(0, 20);
    const topDesires = mapToSortedArray(desireMap).slice(0, 20);
    const topEmotional = mapToSortedArray(emotionalMap).slice(0, 20);

    const phraseCount = topPainPoints.length + topDesires.length + topEmotional.length;

    return {
      topPainPoints,
      topDesires,
      topEmotional,
      phraseCount,
      sourcesAnalyzed: entries.length,
    };
  } catch (error) {
    if ((error as AppError).code) throw error;
    throw handleError(error);
  }
}

// ---------------------------------------------------------------------------
// 3. suggestCopyFromLanguage
// ---------------------------------------------------------------------------

/**
 * Uses a LanguageProfile to suggest copy variations that incorporate
 * actual customer language.
 *
 * @param profile - The aggregated LanguageProfile.
 * @param type - The type of copy to generate suggestions for.
 */
export function suggestCopyFromLanguage(
  profile: LanguageProfile,
  type: 'headline' | 'subheadline' | 'testimonial_highlight',
): string[] {
  if (!profile) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'A LanguageProfile is required to generate suggestions.',
      { field: 'profile' },
    );
  }

  try {
    const suggestions: string[] = [];

    const topPain = profile.topPainPoints[0]?.text || 'your biggest challenge';
    const secondPain = profile.topPainPoints[1]?.text || 'everyday frustrations';
    const topDesire = profile.topDesires[0]?.text || 'the results you deserve';
    const secondDesire = profile.topDesires[1]?.text || 'peace of mind';
    const topEmotion = profile.topEmotional[0]?.text || 'real relief';

    switch (type) {
      case 'headline':
        suggestions.push(
          `Say Goodbye to "${topPain}" -- Experience ${capitalizePhrase(topDesire)} Today`,
          `Tired of ${topPain}? Discover How to ${capitalizePhrase(topDesire)}`,
          `From "${topPain}" to "${topDesire}" -- Your Transformation Starts Here`,
          `Finally, ${capitalizePhrase(topDesire)} Without the ${capitalizePhrase(topPain)}`,
          `What Our Patients Say: "${capitalizePhrase(topEmotion)}" -- And You Can Too`,
        );
        break;

      case 'subheadline':
        suggestions.push(
          `Our patients told us "${topPain}" was their biggest concern. That's why we built a better way to ${topDesire}.`,
          `We hear you: "${secondPain}" shouldn't stand between you and ${topDesire}. Here's how we help.`,
          `Join hundreds who went from feeling "${topPain}" to experiencing "${topDesire}" -- with care designed around your needs.`,
          `"${capitalizePhrase(topEmotion)}" -- the words patients use most to describe their experience with us.`,
        );
        break;

      case 'testimonial_highlight':
        suggestions.push(
          `"I was dealing with ${topPain}, but now I feel ${topEmotion}. Best decision I ever made!"`,
          `"After struggling with ${topPain}, I finally found ${topDesire}. I can't recommend this enough."`,
          `"I was skeptical at first, but the results speak for themselves -- ${topDesire} is real."`,
          `"From ${topPain} to ${topEmotion} -- this team truly changed my life."`,
        );
        break;

      default:
        suggestions.push(
          `Address "${topPain}" and promise "${topDesire}" in your copy.`,
          `Use emotional language like "${topEmotion}" that mirrors your patients' own words.`,
        );
    }

    return suggestions;
  } catch (error) {
    if ((error as AppError).code) throw error;
    throw handleError(error);
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\n+/g, '. ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

/**
 * Scans sentences for indicator words and extracts the surrounding phrase.
 */
function extractCategory(
  sentences: string[],
  indicators: string[],
  defaultSentiment: 'positive' | 'negative' | 'neutral',
): Phrase[] {
  const phraseMap = new Map<string, Phrase>();

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();

    for (const indicator of indicators) {
      if (lower.includes(indicator)) {
        // Extract a meaningful phrase around the indicator
        const phrase = extractSurroundingPhrase(lower, indicator);
        const normalised = normalisePhrase(phrase);

        if (normalised.length < 5 || normalised.length > 100) continue;

        const existing = phraseMap.get(normalised);
        if (existing) {
          existing.frequency += 1;
        } else {
          phraseMap.set(normalised, {
            text: normalised,
            frequency: 1,
            sentiment: defaultSentiment,
          });
        }
      }
    }
  }

  return Array.from(phraseMap.values());
}

/**
 * Extracts a window of words around the indicator for a more meaningful phrase.
 */
function extractSurroundingPhrase(text: string, indicator: string): string {
  const idx = text.indexOf(indicator);
  if (idx === -1) return indicator;

  // Get ~60 chars around the indicator
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + indicator.length + 30);
  let phrase = text.slice(start, end).trim();

  // Trim to word boundaries
  if (start > 0) {
    const firstSpace = phrase.indexOf(' ');
    if (firstSpace > 0) phrase = phrase.slice(firstSpace + 1);
  }
  if (end < text.length) {
    const lastSpace = phrase.lastIndexOf(' ');
    if (lastSpace > 0) phrase = phrase.slice(0, lastSpace);
  }

  // Remove trailing punctuation mess
  phrase = phrase.replace(/^[^a-z0-9]+/i, '').replace(/[^a-z0-9.!?]+$/i, '');

  return phrase;
}

/**
 * Extracts frequently occurring multi-word phrases (2-4 words).
 */
function extractCommonPhrases(text: string): Phrase[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const phraseCounts = new Map<string, number>();
  const stopWords = new Set([
    'the', 'and', 'was', 'were', 'are', 'been', 'being', 'have', 'has', 'had',
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
    'can', 'for', 'not', 'but', 'with', 'this', 'that', 'from', 'they', 'them',
    'their', 'there', 'here', 'then', 'than', 'when', 'what', 'which', 'who',
    'whom', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'only', 'own', 'same', 'just', 'very', 'also',
  ]);

  // Extract bigrams and trigrams
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n);

      // Skip if all words are stop words
      if (ngram.every((w) => stopWords.has(w))) continue;

      const phrase = ngram.join(' ');
      phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
    }
  }

  // Only keep phrases that appear more than once
  const result: Phrase[] = [];
  phraseCounts.forEach((count, phrase) => {
    if (count >= 2) {
      result.push({
        text: phrase,
        frequency: count,
        sentiment: classifySentiment(phrase),
      });
    }
  });

  return result;
}

function classifySentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();

  const positiveWords = [
    'love', 'great', 'amazing', 'excellent', 'wonderful', 'best',
    'happy', 'glad', 'recommend', 'comfortable', 'friendly', 'caring',
    'professional', 'satisfied', 'impressed', 'relief', 'confident',
    'beautiful', 'perfect', 'fantastic', 'quick', 'easy', 'painless',
  ];

  const negativeWords = [
    'hate', 'terrible', 'awful', 'horrible', 'worst', 'disappointed',
    'frustrated', 'angry', 'rude', 'unprofessional', 'pain', 'hurt',
    'expensive', 'overpriced', 'slow', 'waited', 'scared', 'afraid',
    'uncomfortable', 'careless', 'bad', 'poor', 'waste',
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveWords) {
    if (lower.includes(word)) positiveScore++;
  }
  for (const word of negativeWords) {
    if (lower.includes(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

function normalisePhrase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function sortByFrequency(phrases: Phrase[]): Phrase[] {
  return [...phrases].sort((a, b) => b.frequency - a.frequency);
}

function mergePhrases(target: Map<string, Phrase>, source: Phrase[]): void {
  for (const phrase of source) {
    const key = phrase.text.toLowerCase();
    const existing = target.get(key);
    if (existing) {
      existing.frequency += phrase.frequency;
    } else {
      target.set(key, { ...phrase });
    }
  }
}

function mapToSortedArray(map: Map<string, Phrase>): Phrase[] {
  return Array.from(map.values()).sort((a, b) => b.frequency - a.frequency);
}

function capitalizePhrase(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
