/**
 * Copy Analysis & Rewriting Engine
 * Core engine for Tool 2: Conversion Copy Laboratory.
 * Analyzes copy effectiveness, generates A/B test variations,
 * and rewrites copy using proven conversion frameworks.
 */

import {
  analyzeCopy,
  CopyAnalysis,
  generateCopyImprovements,
  calculateFleschReadingEase,
} from '@/utils/text-analysis';
import {
  createAppError,
  handleError,
  ErrorCode,
  type AppError,
} from '@/utils/errors';
import { INDUSTRY_VERTICALS, type VerticalId, getCustomerTerm } from '@/config/healthcare-verticals';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface CopyReport {
  original: string;
  analysis: CopyAnalysis;
  overallScore: number;
  categoryScores: {
    clarity: number;
    persuasion: number;
    emotional: number;
    readability: number;
    ctaStrength: number;
  };
  improvements: string[];
  frameworkSuggestion: string;
}

export interface CopyVariation {
  text: string;
  hypothesis: string;
  framework: string;
  predictedLiftMin: number;
  predictedLiftMax: number;
  focusArea: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CTA_ACTION_VERBS = [
  'book', 'schedule', 'get', 'start', 'claim', 'reserve',
  'request', 'call', 'contact', 'download', 'try', 'join',
  'discover', 'unlock', 'grab', 'secure',
];

const URGENCY_PHRASES = [
  'limited', 'today', 'now', 'only', 'hurry', 'last chance',
  'don\'t miss', 'act fast', 'before it\'s gone', 'ending soon',
];

const CLARITY_DETRACTORS = [
  'utilize', 'leverage', 'synergy', 'holistic', 'paradigm',
  'optimize', 'facilitate', 'implement', 'methodology',
  'comprehensive', 'innovative', 'cutting-edge', 'next-gen',
];

// ---------------------------------------------------------------------------
// 1. analyzeAndScore
// ---------------------------------------------------------------------------

/**
 * Performs a full copy analysis and returns a CopyReport with scores,
 * improvements, and a framework suggestion.
 *
 * @param text - The copy text to analyse.
 * @param verticalId - Optional industry vertical for scoring adjustments.
 */
export function analyzeAndScore(text: string, verticalId?: string): CopyReport {
  if (!text || text.trim().length === 0) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'Copy text is required for analysis.',
      { field: 'text' },
    );
  }

  try {
    const analysis = analyzeCopy(text);
    const improvements = generateCopyImprovements(analysis);

    // ---- Category scores (each 0-100) ----
    const clarity = calculateClarityScore(text, analysis);
    const persuasion = calculatePersuasionScore(analysis);
    const emotional = calculateEmotionalScore(analysis);
    const readability = calculateReadabilityScore(analysis);
    const ctaStrength = calculateCtaStrengthScore(text);

    const categoryScores = { clarity, persuasion, emotional, readability, ctaStrength };

    // ---- Overall score ----
    let overallScore = Math.round(
      clarity * 0.20 +
      persuasion * 0.25 +
      emotional * 0.20 +
      readability * 0.15 +
      ctaStrength * 0.20,
    );

    // ---- Vertical-specific adjustments ----
    if (verticalId && verticalId in INDUSTRY_VERTICALS) {
      const verticalConfig = INDUSTRY_VERTICALS[verticalId as VerticalId];
      const lowerText = text.toLowerCase();
      const customerTermPlural = getCustomerTerm(verticalId as VerticalId, true);

      // Bonus for addressing the vertical's common pain points
      const painPointHits = verticalConfig.commonPainPoints.filter(
        (pp) => lowerText.includes(pp.toLowerCase()),
      ).length;
      overallScore += Math.min(5, painPointHits * 2);

      // Bonus for addressing desires
      const desireHits = verticalConfig.commonDesires.filter(
        (d) => lowerText.includes(d.toLowerCase()),
      ).length;
      overallScore += Math.min(5, desireHits * 2);

      // Bonus for mentioning key conversion actions
      const ctaHits = verticalConfig.keyConversionActions.filter(
        (cta) => lowerText.includes(cta.toLowerCase()),
      ).length;
      overallScore += Math.min(3, ctaHits * 2);

      // Add vertical-specific improvements
      if (painPointHits === 0) {
        improvements.push(
          `Address vertical-specific pain points: ${verticalConfig.commonPainPoints.slice(0, 3).join(', ')}.`,
        );
      }
      if (desireHits === 0) {
        improvements.push(
          `Incorporate ${customerTermPlural} desires: ${verticalConfig.commonDesires.slice(0, 3).join(', ')}.`,
        );
      }
    }

    overallScore = Math.max(0, Math.min(100, overallScore));

    // ---- Framework suggestion ----
    const frameworkSuggestion = suggestFramework(analysis, categoryScores);

    return {
      original: text,
      analysis,
      overallScore,
      categoryScores,
      improvements,
      frameworkSuggestion,
    };
  } catch (error) {
    if ((error as AppError).code) throw error;
    throw handleError(error);
  }
}

// ---------------------------------------------------------------------------
// 2. generateVariations
// ---------------------------------------------------------------------------

/**
 * Generates A/B test copy variations using proven conversion frameworks.
 *
 * @param text - The original copy text.
 * @param type - The copy element type.
 * @param count - Number of variations to generate (default 3, max 5).
 */
export function generateVariations(
  text: string,
  type: 'headline' | 'subheadline' | 'body' | 'cta',
  count: number = 3,
): CopyVariation[] {
  if (!text || text.trim().length === 0) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'Original copy text is required to generate variations.',
      { field: 'text' },
    );
  }

  const safeCount = Math.max(1, Math.min(5, count));
  const variations: CopyVariation[] = [];

  const generators = getVariationGenerators(type);

  for (let i = 0; i < safeCount && i < generators.length; i++) {
    try {
      variations.push(generators[i](text, type));
    } catch {
      // Skip failed generators silently; we still return what we can.
    }
  }

  return variations;
}

// ---------------------------------------------------------------------------
// 3. rewriteWithFramework
// ---------------------------------------------------------------------------

/**
 * Rewrites the given copy using a specified conversion copywriting framework.
 *
 * @param text - The original text.
 * @param framework - One of PAS, AIDA, BAB, FAB.
 */
export function rewriteWithFramework(
  text: string,
  framework: 'PAS' | 'AIDA' | 'BAB' | 'FAB',
): string {
  if (!text || text.trim().length === 0) {
    throw createAppError(
      ErrorCode.INVALID_INPUT,
      'Text is required for framework rewrite.',
      { field: 'text' },
    );
  }

  const sentences = splitSentences(text);

  switch (framework) {
    case 'PAS':
      return applyPAS(sentences, text);
    case 'AIDA':
      return applyAIDA(sentences, text);
    case 'BAB':
      return applyBAB(sentences, text);
    case 'FAB':
      return applyFAB(sentences, text);
    default:
      throw createAppError(
        ErrorCode.INVALID_INPUT,
        `Unknown framework: ${framework}. Use PAS, AIDA, BAB, or FAB.`,
        { framework },
      );
  }
}

// ---------------------------------------------------------------------------
// Private helpers - Category scoring
// ---------------------------------------------------------------------------

function calculateClarityScore(text: string, analysis: CopyAnalysis): number {
  let score = 50;

  // Shorter avg sentence length is clearer
  if (analysis.avgWordsPerSentence <= 15) score += 20;
  else if (analysis.avgWordsPerSentence <= 20) score += 15;
  else if (analysis.avgWordsPerSentence <= 25) score += 5;
  else score -= 10;

  // Penalise jargon / clarity detractors
  const lowerText = text.toLowerCase();
  const jargonCount = CLARITY_DETRACTORS.filter((w) => lowerText.includes(w)).length;
  score -= jargonCount * 5;

  // Reward benefit-to-feature ratio (clear value communication)
  if (analysis.benefitToFeatureRatio >= 1.5) score += 15;
  else if (analysis.benefitToFeatureRatio >= 1) score += 10;
  else if (analysis.benefitToFeatureRatio >= 0.5) score += 5;

  // Reward second-person language (direct, clear)
  if (analysis.secondPersonCount >= 3) score += 10;
  else if (analysis.secondPersonCount >= 1) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculatePersuasionScore(analysis: CopyAnalysis): number {
  let score = 20;

  // Power words
  score += Math.min(25, analysis.powerWordCount * 5);

  // Benefit-to-feature ratio
  if (analysis.benefitToFeatureRatio >= 2) score += 25;
  else if (analysis.benefitToFeatureRatio >= 1) score += 15;
  else if (analysis.benefitToFeatureRatio >= 0.5) score += 8;

  // Second person (addresses the reader)
  score += Math.min(15, analysis.secondPersonCount * 3);

  // Copy score from text-analysis as sanity check
  score += Math.round(analysis.copyScore * 0.15);

  return Math.max(0, Math.min(100, score));
}

function calculateEmotionalScore(analysis: CopyAnalysis): number {
  let score = 15;

  // Emotional triggers
  score += Math.min(40, analysis.emotionalTriggerCount * 8);

  // Power words (many are emotionally loaded)
  score += Math.min(20, analysis.powerWordCount * 4);

  // Second person makes copy feel personal
  score += Math.min(15, analysis.secondPersonCount * 3);

  // Penalty if too feature-heavy (feels clinical, not emotional)
  if (analysis.featureIndicatorCount > analysis.benefitIndicatorCount) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateReadabilityScore(analysis: CopyAnalysis): number {
  // Map Flesch Reading Ease (0-100) to our score.
  // Target: 60-70 is ideal for most audiences (8th grade level).
  const flesch = analysis.readingEase;

  if (flesch >= 60 && flesch <= 80) return 95;
  if (flesch >= 50 && flesch < 60) return 80;
  if (flesch >= 80 && flesch <= 90) return 80;
  if (flesch >= 40 && flesch < 50) return 60;
  if (flesch > 90) return 70;
  if (flesch >= 30 && flesch < 40) return 40;
  return 25;
}

function calculateCtaStrengthScore(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 10;

  // Action verbs
  const actionVerbCount = CTA_ACTION_VERBS.filter((v) => lowerText.includes(v)).length;
  score += Math.min(30, actionVerbCount * 10);

  // Urgency phrases
  const urgencyCount = URGENCY_PHRASES.filter((u) => lowerText.includes(u)).length;
  score += Math.min(20, urgencyCount * 7);

  // Second person in CTA context
  if (/your\s+(free|first|complimentary)/i.test(text)) score += 15;
  if (/you\s+(deserve|can|will)/i.test(text)) score += 10;

  // Specificity bonus (e.g., "Book Your Free Consultation" vs "Submit")
  if (/book\s+(your|a|an)/i.test(text)) score += 10;
  if (/schedule\s+(your|a|an)/i.test(text)) score += 10;
  if (/get\s+(your|a|an)/i.test(text)) score += 10;

  // Penalty for generic CTAs
  if (/\bsubmit\b/i.test(text) && !(/\bbook\b|\bschedule\b|\bcall\b/i.test(text))) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Private helpers - Framework suggestion
// ---------------------------------------------------------------------------

function suggestFramework(
  analysis: CopyAnalysis,
  scores: CopyReport['categoryScores'],
): string {
  if (scores.emotional < 40 && scores.persuasion < 50) {
    return 'PAS (Problem-Agitate-Solve): Your copy lacks emotional engagement. PAS will help you tap into the reader\'s pain points, amplify urgency, then present your solution.';
  }

  if (scores.ctaStrength < 40) {
    return 'AIDA (Attention-Interest-Desire-Action): Your CTA needs strengthening. AIDA builds a logical progression that naturally leads to a strong call-to-action.';
  }

  if (analysis.benefitToFeatureRatio < 0.8) {
    return 'FAB (Feature-Advantage-Benefit): Your copy is feature-heavy. FAB will help you translate each feature into a clear customer benefit.';
  }

  if (scores.clarity < 50) {
    return 'BAB (Before-After-Bridge): Your copy needs clearer value communication. BAB paints a vivid before/after picture with your service as the bridge.';
  }

  return 'Your copy is reasonably well-structured. Consider testing PAS for emotional engagement or AIDA for a stronger conversion path.';
}

// ---------------------------------------------------------------------------
// Private helpers - Variation generators
// ---------------------------------------------------------------------------

type VariationGenerator = (text: string, type: string) => CopyVariation;

function getVariationGenerators(type: string): VariationGenerator[] {
  return [
    generatePASVariation,
    generateAIDAVariation,
    generateBenefitFirstVariation,
    generateUrgencyVariation,
    generateSocialProofVariation,
  ];
}

function generatePASVariation(text: string, type: string): CopyVariation {
  const sentences = splitSentences(text);
  const core = extractCoreMessage(sentences);

  let rewritten: string;
  if (type === 'headline' || type === 'subheadline') {
    rewritten = `Struggling with ${core.painPoint}? ${core.solution} can help you ${core.benefit}.`;
  } else if (type === 'cta') {
    rewritten = `Stop ${core.painPoint} -- ${core.ctaAction} Today`;
  } else {
    rewritten = `Are you dealing with ${core.painPoint}? ` +
      `It can feel overwhelming when ${core.agitation}. ` +
      `That's why ${core.solution} -- so you can finally ${core.benefit}.`;
  }

  return {
    text: rewritten,
    hypothesis: 'PAS framework creates emotional connection by addressing pain before presenting the solution, increasing engagement and click-through.',
    framework: 'PAS',
    predictedLiftMin: 5,
    predictedLiftMax: 15,
    focusArea: 'Emotional engagement via pain point identification',
  };
}

function generateAIDAVariation(text: string, type: string): CopyVariation {
  const sentences = splitSentences(text);
  const core = extractCoreMessage(sentences);

  let rewritten: string;
  if (type === 'headline' || type === 'subheadline') {
    rewritten = `Discover How to ${capitalizeFirst(core.benefit)} -- Without ${core.painPoint}`;
  } else if (type === 'cta') {
    rewritten = `Yes, I Want to ${capitalizeFirst(core.benefit)}!`;
  } else {
    rewritten = `Imagine ${core.benefit}. ` +
      `Our customers achieve this through ${core.solution}. ` +
      `With proven results and personalized service, you deserve a better experience. ` +
      `${core.ctaAction} and take the first step today.`;
  }

  return {
    text: rewritten,
    hypothesis: 'AIDA creates a logical progression from attention to action, reducing cognitive friction and increasing conversion rates.',
    framework: 'AIDA',
    predictedLiftMin: 3,
    predictedLiftMax: 12,
    focusArea: 'Structured persuasion flow from attention to action',
  };
}

function generateBenefitFirstVariation(text: string, type: string): CopyVariation {
  const sentences = splitSentences(text);
  const core = extractCoreMessage(sentences);

  let rewritten: string;
  if (type === 'headline' || type === 'subheadline') {
    rewritten = `${capitalizeFirst(core.benefit)} -- Guaranteed by ${core.solution}`;
  } else if (type === 'cta') {
    rewritten = `Get Your ${capitalizeFirst(core.benefit)} Now`;
  } else {
    rewritten = `You deserve ${core.benefit}. ` +
      `${core.solution} makes it possible with trusted, personalized care. ` +
      `No more ${core.painPoint} -- just results you can see and feel.`;
  }

  return {
    text: rewritten,
    hypothesis: 'Leading with benefits rather than features speaks directly to what the reader wants, increasing relevance and engagement.',
    framework: 'Benefit-First',
    predictedLiftMin: 4,
    predictedLiftMax: 14,
    focusArea: 'Benefit-led messaging over feature-led messaging',
  };
}

function generateUrgencyVariation(text: string, type: string): CopyVariation {
  const sentences = splitSentences(text);
  const core = extractCoreMessage(sentences);

  let rewritten: string;
  if (type === 'headline' || type === 'subheadline') {
    rewritten = `Don't Wait -- ${capitalizeFirst(core.benefit)} Is Within Reach`;
  } else if (type === 'cta') {
    rewritten = `Claim Your Spot -- ${core.ctaAction} Today`;
  } else {
    rewritten = `Every day without action is another day dealing with ${core.painPoint}. ` +
      `${core.solution} has limited availability this month. ` +
      `${core.ctaAction} now and start your journey to ${core.benefit}.`;
  }

  return {
    text: rewritten,
    hypothesis: 'Adding appropriate urgency motivates faster decision-making without being pushy, increasing conversion velocity.',
    framework: 'Urgency / Scarcity',
    predictedLiftMin: 6,
    predictedLiftMax: 18,
    focusArea: 'Time-sensitive motivation and loss aversion',
  };
}

function generateSocialProofVariation(text: string, type: string): CopyVariation {
  const sentences = splitSentences(text);
  const core = extractCoreMessage(sentences);

  let rewritten: string;
  if (type === 'headline' || type === 'subheadline') {
    rewritten = `Trusted by Thousands -- ${capitalizeFirst(core.benefit)} Starts Here`;
  } else if (type === 'cta') {
    rewritten = `Join Hundreds of Happy Customers -- ${core.ctaAction}`;
  } else {
    rewritten = `Hundreds of customers have already experienced ${core.benefit} with ${core.solution}. ` +
      `Don't just take our word for it -- our results speak for themselves. ` +
      `${core.ctaAction} and see why customers trust us for ${core.benefit}.`;
  }

  return {
    text: rewritten,
    hypothesis: 'Social proof reduces perceived risk and builds trust, particularly effective in trust-driven industries where credibility is the primary conversion driver.',
    framework: 'Social Proof',
    predictedLiftMin: 7,
    predictedLiftMax: 20,
    focusArea: 'Trust building through social validation',
  };
}

// ---------------------------------------------------------------------------
// Private helpers - Framework rewriting
// ---------------------------------------------------------------------------

function applyPAS(sentences: string[], original: string): string {
  const core = extractCoreMessage(sentences);

  return [
    `[PROBLEM]`,
    `Are you struggling with ${core.painPoint}? You're not alone -- it's one of the most common concerns we hear from our customers.`,
    ``,
    `[AGITATE]`,
    `Left unaddressed, ${core.painPoint} can ${core.agitation}. The longer you wait, the harder it becomes to find relief.`,
    ``,
    `[SOLVE]`,
    `That's exactly why ${core.solution} exists. Our approach helps you ${core.benefit} -- with personalized care you can trust.`,
    ``,
    `${core.ctaAction} today and take the first step toward ${core.benefit}.`,
  ].join('\n');
}

function applyAIDA(sentences: string[], original: string): string {
  const core = extractCoreMessage(sentences);

  return [
    `[ATTENTION]`,
    `What if you could ${core.benefit} -- without the stress of ${core.painPoint}?`,
    ``,
    `[INTEREST]`,
    `${core.solution} uses proven methods to deliver real, lasting results. Our experienced team has helped countless customers achieve their goals.`,
    ``,
    `[DESIRE]`,
    `Imagine waking up every day feeling confident and comfortable. No more worrying about ${core.painPoint}. Just the results you deserve.`,
    ``,
    `[ACTION]`,
    `${core.ctaAction} now -- your journey to ${core.benefit} starts with a single step.`,
  ].join('\n');
}

function applyBAB(sentences: string[], original: string): string {
  const core = extractCoreMessage(sentences);

  return [
    `[BEFORE]`,
    `Right now, you may be dealing with ${core.painPoint}. It affects your daily life, your confidence, and your well-being.`,
    ``,
    `[AFTER]`,
    `But imagine a life where ${core.benefit}. Where you feel confident, comfortable, and in control. That's the transformation our customers experience.`,
    ``,
    `[BRIDGE]`,
    `${core.solution} is the bridge between where you are and where you want to be. With trusted, personalized care, we'll guide you every step of the way.`,
    ``,
    `${core.ctaAction} and start your transformation today.`,
  ].join('\n');
}

function applyFAB(sentences: string[], original: string): string {
  const core = extractCoreMessage(sentences);

  return [
    `[FEATURE]`,
    `We offer ${core.solution} -- backed by experienced professionals and modern techniques.`,
    ``,
    `[ADVANTAGE]`,
    `Unlike generic approaches, our ${core.solution} is personalized to your unique needs. This means faster results, less discomfort, and a care plan designed specifically for you.`,
    ``,
    `[BENEFIT]`,
    `The result? You get to ${core.benefit}. No more ${core.painPoint} -- just the outcome you've been looking for.`,
    ``,
    `${core.ctaAction} today and experience the difference personalized care makes.`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Private helpers - Text utilities
// ---------------------------------------------------------------------------

interface CoreMessage {
  painPoint: string;
  agitation: string;
  solution: string;
  benefit: string;
  ctaAction: string;
}

function extractCoreMessage(sentences: string[]): CoreMessage {
  const fullText = sentences.join(' ').toLowerCase();

  // Try to intelligently extract components from the text
  const painPoint = extractPainPoint(fullText) || 'this challenge';
  const solution = extractSolution(fullText) || 'our dedicated care';
  const benefit = extractBenefit(fullText) || 'achieve the results you deserve';
  const agitation = `affect your quality of life and overall well-being`;
  const ctaAction = extractCtaAction(fullText) || 'Get started today';

  return { painPoint, agitation, solution, benefit, ctaAction };
}

function extractPainPoint(text: string): string | null {
  const painPatterns = [
    /struggling with\s+([^.!?,]+)/i,
    /suffering from\s+([^.!?,]+)/i,
    /dealing with\s+([^.!?,]+)/i,
    /worried about\s+([^.!?,]+)/i,
    /tired of\s+([^.!?,]+)/i,
    /frustrated with\s+([^.!?,]+)/i,
    /pain\s+(?:from|in|with)\s+([^.!?,]+)/i,
    /problem(?:s)?\s+(?:with|of)\s+([^.!?,]+)/i,
  ];

  for (const pattern of painPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback: look for negative sentiment phrases
  const negativeWords = ['pain', 'anxiety', 'fear', 'discomfort', 'stress', 'worry'];
  for (const word of negativeWords) {
    if (text.includes(word)) {
      const idx = text.indexOf(word);
      const surrounding = text.slice(Math.max(0, idx - 10), idx + word.length + 20);
      return surrounding.trim().replace(/^[^a-z]+/i, '').replace(/[^a-z]+$/i, '');
    }
  }

  return null;
}

function extractSolution(text: string): string | null {
  const solutionPatterns = [
    /(?:our|we offer|we provide)\s+([^.!?,]{5,40})/i,
    /(?:with|through|using)\s+(?:our\s+)?([^.!?,]{5,40})/i,
    /(?:treatment|service|procedure|therapy|program|care)\s*(?:for|that)\s+([^.!?,]+)/i,
  ];

  for (const pattern of solutionPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function extractBenefit(text: string): string | null {
  const benefitPatterns = [
    /(?:you (?:will|can)|you'll)\s+([^.!?,]+)/i,
    /(?:achieve|enjoy|experience|feel|get)\s+([^.!?,]+)/i,
    /(?:so you can|helping you)\s+([^.!?,]+)/i,
    /(?:benefit|result)s?\s*(?:include|:)\s*([^.!?,]+)/i,
  ];

  for (const pattern of benefitPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function extractCtaAction(text: string): string | null {
  const ctaPatterns = [
    /(book\s+(?:your|a|an)\s+[^.!?,]+)/i,
    /(schedule\s+(?:your|a|an)\s+[^.!?,]+)/i,
    /(call\s+(?:us|now|today)[^.!?,]*)/i,
    /(get\s+(?:your|a|an)\s+(?:free\s+)?[^.!?,]+)/i,
    /(request\s+(?:your|a|an)\s+[^.!?,]+)/i,
    /(contact\s+(?:us|our)[^.!?,]*)/i,
  ];

  for (const pattern of ctaPatterns) {
    const match = text.match(pattern);
    if (match) return capitalizeFirst(match[1].trim());
  }

  return null;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function capitalizeFirst(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
