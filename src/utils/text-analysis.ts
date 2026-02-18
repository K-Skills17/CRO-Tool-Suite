/**
 * Text Analysis Utilities
 * Readability scoring, content analysis, and copy evaluation functions.
 * These replace the need for external API calls.
 */

// Flesch Reading Ease calculation (no external dependency needed)
export function calculateFleschReadingEase(text: string): number {
  const sentences = countSentences(text);
  const words = countWords(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

// Flesch-Kincaid Grade Level
export function calculateFleschKincaid(text: string): number {
  const sentences = countSentences(text);
  const words = countWords(text);
  const syllables = countSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

export function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  return words.reduce((total, word) => total + countWordSyllables(word), 0);
}

function countWordSyllables(word: string): number {
  word = word.replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Power words that increase conversion
const POWER_WORDS = [
  'guaranteed', 'proven', 'trusted', 'free', 'instant', 'exclusive',
  'limited', 'save', 'results', 'professional', 'certified', 'expert',
  'safe', 'painless', 'comfortable', 'affordable', 'personalized',
  'experienced', 'advanced', 'gentle', 'caring', 'compassionate',
  'confidential', 'state-of-the-art', 'transforming', 'life-changing',
  // Portuguese power words
  'gratuito', 'garantido', 'comprovado', 'exclusivo', 'profissional',
  'seguro', 'indolor', 'confortável', 'acessível', 'personalizado',
  'experiente', 'avançado', 'carinhoso', 'confidencial', 'transformador',
];

// Emotional trigger words
const EMOTIONAL_TRIGGERS = [
  'afraid', 'worried', 'anxious', 'confident', 'beautiful', 'healthy',
  'pain', 'relief', 'comfort', 'trust', 'fear', 'hope', 'smile',
  'transform', 'dream', 'deserve', 'imagine', 'finally', 'peace',
  // Portuguese
  'medo', 'preocupado', 'ansioso', 'confiante', 'bonito', 'saudável',
  'dor', 'alívio', 'conforto', 'confiança', 'esperança', 'sorriso',
  'transformar', 'sonho', 'merecer', 'imaginar', 'finalmente', 'paz',
];

// Benefit-oriented phrases
const BENEFIT_INDICATORS = [
  'you will', 'you can', 'you deserve', 'get your', 'feel',
  'enjoy', 'experience', 'achieve', 'discover', 'imagine',
  'without', 'no more', 'say goodbye', 'welcome to',
  // Portuguese
  'você vai', 'você pode', 'você merece', 'sinta', 'aproveite',
  'experimente', 'alcance', 'descubra', 'imagine', 'sem mais',
];

// Feature-oriented phrases (less effective for conversion)
const FEATURE_INDICATORS = [
  'we offer', 'we provide', 'we have', 'our team', 'our clinic',
  'our technology', 'we use', 'we specialize', 'our services',
  // Portuguese
  'oferecemos', 'fornecemos', 'temos', 'nossa equipe', 'nossa clínica',
  'nossa tecnologia', 'usamos', 'especializamos', 'nossos serviços',
];

export interface CopyAnalysis {
  readingEase: number;
  gradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  powerWordCount: number;
  powerWordDensity: number;
  emotionalTriggerCount: number;
  benefitIndicatorCount: number;
  featureIndicatorCount: number;
  benefitToFeatureRatio: number;
  secondPersonCount: number;
  copyScore: number;
}

export function analyzeCopy(text: string): CopyAnalysis {
  const lowerText = text.toLowerCase();
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);

  const powerWordCount = POWER_WORDS.filter((w) => lowerText.includes(w)).length;
  const emotionalTriggerCount = EMOTIONAL_TRIGGERS.filter((w) => lowerText.includes(w)).length;
  const benefitIndicatorCount = BENEFIT_INDICATORS.filter((w) => lowerText.includes(w)).length;
  const featureIndicatorCount = FEATURE_INDICATORS.filter((w) => lowerText.includes(w)).length;

  const secondPersonMatches = lowerText.match(/\b(you|your|you're|yours|você|seu|sua)\b/g);
  const secondPersonCount = secondPersonMatches ? secondPersonMatches.length : 0;

  const benefitToFeatureRatio =
    featureIndicatorCount === 0
      ? benefitIndicatorCount > 0 ? 2.0 : 0
      : Number((benefitIndicatorCount / featureIndicatorCount).toFixed(2));

  const readingEase = calculateFleschReadingEase(text);
  const gradeLevel = calculateFleschKincaid(text);

  // Calculate copy score (0-100)
  let copyScore = 0;
  // Reading ease (target: 60-70 for healthcare)
  copyScore += readingEase >= 50 && readingEase <= 80 ? 20 : readingEase >= 30 ? 10 : 5;
  // Power words
  copyScore += Math.min(20, powerWordCount * 3);
  // Emotional triggers
  copyScore += Math.min(15, emotionalTriggerCount * 3);
  // Benefit vs feature
  copyScore += benefitToFeatureRatio >= 1.0 ? 20 : benefitToFeatureRatio >= 0.5 ? 12 : 5;
  // Second person usage
  copyScore += secondPersonCount >= 5 ? 15 : secondPersonCount >= 2 ? 10 : 3;
  // Sentence length (target: 15-20 words)
  const avgWords = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  copyScore += avgWords >= 10 && avgWords <= 25 ? 10 : avgWords < 10 ? 7 : 3;

  return {
    readingEase,
    gradeLevel,
    wordCount,
    sentenceCount,
    avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
    powerWordCount,
    powerWordDensity: wordCount > 0 ? Number((powerWordCount / wordCount * 100).toFixed(2)) : 0,
    emotionalTriggerCount,
    benefitIndicatorCount,
    featureIndicatorCount,
    benefitToFeatureRatio,
    secondPersonCount,
    copyScore: Math.min(100, copyScore),
  };
}

export function generateCopyImprovements(analysis: CopyAnalysis): string[] {
  const improvements: string[] = [];

  if (analysis.readingEase < 50) {
    improvements.push('Simplify language - aim for 6th-8th grade reading level. Use shorter sentences and common words.');
  }
  if (analysis.powerWordCount < 3) {
    improvements.push('Add more persuasive power words: guaranteed, proven, trusted, safe, comfortable.');
  }
  if (analysis.emotionalTriggerCount < 2) {
    improvements.push('Include emotional triggers that connect with patient fears and desires.');
  }
  if (analysis.benefitToFeatureRatio < 1.0) {
    improvements.push('Rebalance copy to lead with benefits ("You\'ll feel...") rather than features ("We offer...").');
  }
  if (analysis.secondPersonCount < 3) {
    improvements.push('Use more "you/your" language to speak directly to the patient.');
  }
  if (analysis.avgWordsPerSentence > 25) {
    improvements.push('Break long sentences into shorter ones (aim for 15-20 words per sentence).');
  }

  return improvements;
}
