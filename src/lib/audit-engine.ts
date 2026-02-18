/**
 * Core Audit Engine
 * Takes an HTML string + vertical ID, runs it through all audit checkpoints
 * from the checklist, and returns scored results per category and overall.
 */

import type { VerticalId, ScoringWeights } from '@/config/healthcare-verticals';
import { getVerticalConfig } from '@/config/healthcare-verticals';
import {
  AUDIT_CHECKLIST,
  type AuditCategory,
  type AuditCheckpoint,
  AUDIT_CATEGORY_LABELS,
  getCheckpointsByCategory,
  getMaxScoreForCategory,
} from '@/config/audit-checklist';
import { analyzeHTML, type HTMLAnalysis } from '@/utils/html-analyzer';
import { analyzeCopy, type CopyAnalysis } from '@/utils/text-analysis';
import {
  type CategoryScore,
  type CheckResult,
  type OverallScore,
  calculateWeightedTotal,
  getGrade,
  calculateBenchmarkComparison,
  generatePriorityRecommendations,
} from '@/utils/scoring';
import { createAppError, ErrorCode, handleError, logError, type AppError } from '@/utils/errors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditResult {
  url: string;
  vertical: VerticalId;
  timestamp: string;
  htmlAnalysis: HTMLAnalysis;
  copyAnalysis: CopyAnalysis;
  overallScore: OverallScore;
  recommendations: ReturnType<typeof generatePriorityRecommendations>;
  mode: 'internal' | 'client';
}

// ---------------------------------------------------------------------------
// Checkpoint evaluation helpers
// ---------------------------------------------------------------------------

/**
 * Evaluate a single audit checkpoint against the collected HTML & copy analysis.
 * Returns a CheckResult with pass/fail, score (0 or weight), and a human-readable finding.
 */
function evaluateCheckpoint(
  checkpoint: AuditCheckpoint,
  html: HTMLAnalysis,
  copy: CopyAnalysis,
  url: string,
): CheckResult {
  const { id, name, weight } = checkpoint;
  let passed = false;
  let finding = '';

  switch (id) {
    // === VISUAL HIERARCHY ===
    case 'vh-001': // Clear H1 headline
      passed = html.headings.h1Count === 1;
      finding = passed
        ? `Single H1 found: "${html.headings.h1Text[0] ?? ''}"`
        : html.headings.h1Count === 0
          ? 'No H1 tag found on page'
          : `Multiple H1 tags found (${html.headings.h1Count}). Use exactly one.`;
      break;

    case 'vh-002': // Heading hierarchy
      passed = html.headings.hierarchyValid;
      finding = passed
        ? 'Heading hierarchy is valid (no levels skipped)'
        : 'Heading hierarchy has skipped levels (e.g., H3 without H2)';
      break;

    case 'vh-003': // Above-fold value prop
      passed = html.headings.h1Count >= 1 && html.structure.hasHeroSection;
      finding = passed
        ? 'Hero section with headline detected above fold'
        : 'No clear hero section or value proposition detected above fold';
      break;

    case 'vh-004': // Visual contrast on CTA
      // Heuristic: presence of form submit buttons or distinct button elements
      passed = html.forms.forms.some((f) => f.hasSubmitButton);
      finding = passed
        ? 'CTA buttons detected with submit functionality'
        : 'No prominent CTA buttons detected for contrast evaluation';
      break;

    case 'vh-005': // White space usage
      passed = html.structure.sectionCount >= 2;
      finding = passed
        ? `Page has ${html.structure.sectionCount} distinct sections`
        : 'Insufficient section separation detected';
      break;

    case 'vh-006': // Image quality
      passed = html.images.totalImages >= 1 && html.images.emptySrc === 0;
      finding = passed
        ? `${html.images.totalImages} images found with valid sources`
        : html.images.totalImages === 0
          ? 'No images found on page'
          : `${html.images.emptySrc} images have empty src attributes`;
      break;

    case 'vh-007': // Consistent typography - heuristic check
      passed = true; // Cannot fully detect from HTML alone; default pass
      finding = 'Typography consistency requires visual review (CSS analysis)';
      break;

    case 'vh-008': // Readable font size
      passed = true; // Needs CSS computation; default pass with note
      finding = 'Font size validation requires CSS analysis';
      break;

    case 'vh-009': // Line length control
      passed = true; // Needs CSS computation
      finding = 'Line length control requires CSS analysis';
      break;

    case 'vh-010': // Color scheme consistency
      passed = true; // CSS-only check
      finding = 'Color scheme consistency requires CSS analysis';
      break;

    case 'vh-011': // Navigation clarity
      passed = html.structure.hasNav;
      finding = passed
        ? 'Navigation element (<nav>) found'
        : 'No <nav> element detected. Navigation may be unclear.';
      break;

    case 'vh-012': // Logo placement
      passed = html.structure.hasHeader && html.images.totalImages >= 1;
      finding = passed
        ? 'Header with images detected (likely includes logo)'
        : 'No clear logo placement detected in header';
      break;

    case 'vh-013': // Section separation
      passed = html.structure.sectionCount >= 3;
      finding = passed
        ? `${html.structure.sectionCount} content sections provide good separation`
        : `Only ${html.structure.sectionCount} sections detected; consider adding more separation`;
      break;

    case 'vh-014': // Image alt text
      passed = html.images.totalImages === 0 || html.images.imagesWithoutAlt === 0;
      finding = passed
        ? 'All images have alt text (or no images on page)'
        : `${html.images.imagesWithoutAlt} of ${html.images.totalImages} images missing alt text`;
      break;

    case 'vh-015': // No broken images
      passed = html.images.emptySrc === 0;
      finding = passed
        ? 'No empty image sources detected'
        : `${html.images.emptySrc} images have empty/invalid src attributes`;
      break;

    case 'vh-016': // Hero section present
      passed = html.structure.hasHeroSection;
      finding = passed
        ? 'Hero/banner section detected'
        : 'No hero section detected. Add a prominent hero area.';
      break;

    case 'vh-017': // Scannable layout
      passed = html.headings.h2Count >= 2 || html.structure.sectionCount >= 3;
      finding = passed
        ? 'Page uses multiple headings/sections for scannability'
        : 'Page may lack scannable structure. Add subheadings and sections.';
      break;

    case 'vh-018': // Footer completeness
      passed = html.structure.hasFooter;
      finding = passed
        ? 'Footer element detected'
        : 'No <footer> element found on page';
      break;

    case 'vh-019': // No popup overload
      passed = true; // Would need JS execution to detect; default pass
      finding = 'Popup detection requires runtime analysis';
      break;

    case 'vh-020': // Video integration
      passed = html.structure.hasVideo;
      finding = passed
        ? 'Video content detected on page'
        : 'No video content found. Consider adding explainer video.';
      break;

    // === COPY EFFECTIVENESS ===
    case 'ce-001': // Benefit-focused headline
      passed = copy.benefitIndicatorCount >= 1 || (html.headings.h1Count >= 1 && copy.copyScore >= 40);
      finding = passed
        ? 'Headline appears to communicate benefits'
        : 'Headline may be feature-focused rather than benefit-focused';
      break;

    case 'ce-002': // Subheadline supports H1
      passed = html.headings.h1Count >= 1 && html.headings.h2Count >= 1;
      finding = passed
        ? `H1 supported by ${html.headings.h2Count} subheadline(s)`
        : 'Missing supporting subheadline for the main headline';
      break;

    case 'ce-003': // Reading level appropriate
      passed = copy.readingEase > 60;
      finding = passed
        ? `Reading ease score: ${copy.readingEase} (target: >60)`
        : `Reading ease score: ${copy.readingEase} - too complex for general audiences`;
      break;

    case 'ce-004': // Benefits over features
      passed = copy.benefitToFeatureRatio >= 0.5;
      finding = passed
        ? `Benefit-to-feature ratio: ${copy.benefitToFeatureRatio} (good)`
        : `Benefit-to-feature ratio: ${copy.benefitToFeatureRatio} - needs more benefit language`;
      break;

    case 'ce-005': // Emotional triggers present
      passed = copy.emotionalTriggerCount >= 2;
      finding = passed
        ? `${copy.emotionalTriggerCount} emotional trigger words detected`
        : `Only ${copy.emotionalTriggerCount} emotional triggers found. Add more empathy language.`;
      break;

    case 'ce-006': // Clear value proposition
      passed = html.headings.h1Count >= 1 && copy.benefitIndicatorCount >= 1;
      finding = passed
        ? 'Value proposition appears present in top content'
        : 'No clear differentiating value proposition detected';
      break;

    case 'ce-007': // Objection handling
      passed = html.trust.hasFAQ;
      finding = passed
        ? 'FAQ or objection-handling content detected'
        : 'No FAQ or objection-handling section found';
      break;

    case 'ce-008': // Urgency/scarcity cues
      passed = copy.powerWordCount >= 2;
      finding = passed
        ? `${copy.powerWordCount} persuasive/urgency words detected`
        : 'Limited urgency or scarcity language in copy';
      break;

    case 'ce-009': // Short paragraphs
      passed = copy.avgWordsPerSentence <= 25;
      finding = passed
        ? `Average ${copy.avgWordsPerSentence} words per sentence (good)`
        : `Average ${copy.avgWordsPerSentence} words per sentence - too long`;
      break;

    case 'ce-010': // Power words usage
      passed = copy.powerWordCount >= 3;
      finding = passed
        ? `${copy.powerWordCount} power words found in copy`
        : `Only ${copy.powerWordCount} power words. Add more persuasive language.`;
      break;

    case 'ce-011': // Service descriptions clear
      passed = html.headings.h2Count >= 2 && copy.wordCount >= 100;
      finding = passed
        ? 'Multiple service sections with descriptions detected'
        : 'Service descriptions may be insufficient or missing';
      break;

    case 'ce-012': // No jargon overload
      passed = copy.readingEase >= 40;
      finding = passed
        ? 'Copy readability is within acceptable range for general audiences'
        : 'Copy may contain excessive jargon or overly complex language';
      break;

    case 'ce-013': // Second person language
      passed = copy.secondPersonCount >= 3;
      finding = passed
        ? `${copy.secondPersonCount} instances of "you/your" language detected`
        : `Only ${copy.secondPersonCount} instances of "you/your". Address the reader directly.`;
      break;

    case 'ce-014': // Process/steps explained
      passed = html.trust.hasFAQ || html.structure.sectionCount >= 4;
      finding = passed
        ? 'Process or how-it-works content detected'
        : 'No clear process explanation found. Add a "how it works" section.';
      break;

    case 'ce-015': // Micro-copy on forms
      passed = html.forms.forms.some((f) => f.hasLabels || f.hasPlaceholders);
      finding = passed
        ? 'Form fields have labels or placeholder text'
        : html.forms.formCount === 0
          ? 'No forms found on page'
          : 'Form fields lack proper labels and placeholders';
      break;

    // === TRUST & CREDIBILITY ===
    case 'tc-001': // Professional credentials
      passed = html.trust.hasCredentials;
      finding = passed
        ? 'Professional credentials (Dr., MD, DDS, etc.) detected'
        : 'No professional credentials found. Display practitioner qualifications.';
      break;

    case 'tc-002': // Customer testimonials
      passed = html.trust.hasTestimonials;
      finding = passed
        ? 'Testimonial or review content detected'
        : 'No testimonials found. Add social proof.';
      break;

    case 'tc-003': // Google reviews integration
      passed = html.trust.hasReviewScore;
      finding = passed
        ? 'Review rating/score indicator detected'
        : 'No Google review integration found';
      break;

    case 'tc-004': // Years in practice
      passed = html.trust.yearsExperienceMentioned;
      finding = passed
        ? 'Years of experience mentioned'
        : 'No experience duration mentioned. Add "X years of experience".';
      break;

    case 'tc-005': // Customer count
      passed = html.trust.patientCountMentioned;
      finding = passed
        ? 'Customer/client count statistic detected'
        : 'No customer count mentioned. Add "X+ customers served".';
      break;

    case 'tc-006': // Professional photos
      passed = html.images.totalImages >= 3;
      finding = passed
        ? `${html.images.totalImages} images found (likely includes team/facility photos)`
        : 'Few images detected. Add professional team and facility photos.';
      break;

    case 'tc-007': // Association logos
      passed = html.trust.hasCertifications;
      finding = passed
        ? 'Certification or accreditation indicators detected'
        : 'No professional association badges found';
      break;

    case 'tc-008': // Insurance/payment info
      passed = html.trust.hasInsuranceInfo;
      finding = passed
        ? 'Insurance or payment information detected'
        : 'No payment/pricing info found. List accepted payment methods or pricing.';
      break;

    case 'tc-009': // Guarantee/risk reversal
      passed = html.trust.hasGuarantee;
      finding = passed
        ? 'Satisfaction guarantee or risk-reversal language detected'
        : 'No guarantee or risk-reversal messaging found';
      break;

    case 'tc-010': // Physical address visible
      passed = html.trust.hasAddress;
      finding = passed
        ? 'Physical address detected on page'
        : 'No physical address found. Display business location.';
      break;

    case 'tc-011': // Phone number visible
      passed = html.trust.hasPhoneVisible || html.links.telLinks > 0;
      finding = passed
        ? 'Phone number detected on page'
        : 'No visible phone number found. Display contact number prominently.';
      break;

    case 'tc-012': // Before/after evidence
      passed = html.trust.hasBeforeAfter;
      finding = passed
        ? 'Before/after content detected'
        : 'No before/after evidence found. Consider adding case studies.';
      break;

    case 'tc-013': // Awards/recognition
      passed = html.trust.hasCertifications; // Overlaps with certifications
      finding = passed
        ? 'Awards or recognition indicators detected'
        : 'No awards or recognition displayed';
      break;

    case 'tc-014': // Team bios
      passed = html.trust.hasTeamBios;
      finding = passed
        ? 'Team or staff bio section detected'
        : 'No team bios found. Introduce your team members.';
      break;

    case 'tc-015': // Map/directions
      passed = html.structure.hasMap;
      finding = passed
        ? 'Map embed or directions detected'
        : 'No map or directions found. Add Google Maps embed.';
      break;

    // === CONVERSION FRICTION ===
    case 'cf-001': // Form field count
      passed = html.forms.forms.some((f) => f.fieldCount <= 5);
      finding = passed
        ? `Shortest form has ${Math.min(...html.forms.forms.map((f) => f.fieldCount))} fields (good)`
        : html.forms.formCount === 0
          ? 'No forms found on page. Add a conversion form.'
          : `All forms have more than 5 fields. Simplify the primary form.`;
      break;

    case 'cf-002': // Single-step form
      passed = html.forms.formCount >= 1; // Multi-step detection would need JS
      finding = passed
        ? 'Form detected (assumed single-step from HTML analysis)'
        : 'No form detected on page';
      break;

    case 'cf-003': // Click-to-call enabled
      passed = html.links.telLinks > 0;
      finding = passed
        ? `${html.links.telLinks} click-to-call link(s) found`
        : 'No tel: links found. Make phone numbers clickable.';
      break;

    case 'cf-004': // WhatsApp integration
      passed = html.links.whatsappLinks > 0;
      finding = passed
        ? 'WhatsApp contact option detected'
        : 'No WhatsApp integration found';
      break;

    case 'cf-005': // Online booking available
      passed = html.forms.formCount >= 1 || html.structure.hasIframe;
      finding = passed
        ? 'Online booking/form capability detected'
        : 'No online booking functionality found. Add scheduling widget.';
      break;

    case 'cf-006': // Multiple contact options
      {
        const contactMethods =
          (html.links.telLinks > 0 ? 1 : 0) +
          (html.links.mailtoLinks > 0 ? 1 : 0) +
          (html.links.whatsappLinks > 0 ? 1 : 0) +
          (html.forms.formCount > 0 ? 1 : 0);
        passed = contactMethods >= 3;
        finding = passed
          ? `${contactMethods} contact methods available`
          : `Only ${contactMethods} contact method(s). Add phone, form, and email/WhatsApp.`;
      }
      break;

    case 'cf-007': // Page load speed
      passed = true; // Requires performance measurement
      finding = 'Page load speed requires runtime performance testing';
      break;

    case 'cf-008': // No unnecessary steps
      passed = html.forms.formCount >= 1; // Heuristic: form on page = direct path
      finding = passed
        ? 'Conversion form available on page (direct path)'
        : 'No direct conversion path detected on this page';
      break;

    case 'cf-009': // Hours of operation visible
      passed = html.trust.hasHoursOfOperation;
      finding = passed
        ? 'Hours of operation information detected'
        : 'No business hours found. Display operating schedule.';
      break;

    case 'cf-010': // Form validation helpful
      passed = html.forms.forms.some((f) => f.hasRequired);
      finding = passed
        ? 'Form validation (required attributes) detected'
        : html.forms.formCount === 0
          ? 'No forms to validate'
          : 'Forms lack validation attributes. Add required and type constraints.';
      break;

    case 'cf-011': // No captcha on main form
      passed = html.forms.forms.length === 0 || !html.forms.forms[0].hasCaptcha;
      finding = passed
        ? 'Primary form does not use intrusive captcha'
        : 'Primary form has captcha which may increase friction';
      break;

    case 'cf-012': // Sticky contact option
      passed = html.links.hasStickyNav;
      finding = passed
        ? 'Sticky/fixed navigation or contact element detected'
        : 'No sticky contact option found while scrolling';
      break;

    case 'cf-013': // Clear pricing signals
      {
        const hasPricing = /(\$|R\$|€|£|price|preço|cost|custo|starting at|a partir de)/i.test(
          html.textContent,
        );
        passed = hasPricing;
        finding = passed
          ? 'Pricing or cost information detected'
          : 'No pricing signals found. Add "starting from" information.';
      }
      break;

    case 'cf-014': // FAQ section
      passed = html.trust.hasFAQ;
      finding = passed
        ? 'FAQ section detected'
        : 'No FAQ section found. Address common customer questions.';
      break;

    case 'cf-015': // Exit intent handling
      passed = false; // Requires JS runtime detection
      finding = 'Exit-intent detection requires JavaScript runtime analysis';
      break;

    // === MOBILE OPTIMIZATION ===
    case 'mo-001': // Viewport meta tag
      passed = html.meta.hasViewport;
      finding = passed
        ? 'Viewport meta tag present for responsive design'
        : 'Missing viewport meta tag. Critical for mobile rendering.';
      break;

    case 'mo-002': // Responsive design
      passed = html.meta.hasViewport; // Best approximation from HTML
      finding = passed
        ? 'Responsive design indicators present'
        : 'No responsive design indicators detected';
      break;

    case 'mo-003': // Touch-friendly buttons
      passed = true; // Needs CSS analysis
      finding = 'Touch target size requires CSS analysis';
      break;

    case 'mo-004': // No horizontal scroll
      passed = html.meta.hasViewport; // Viewport meta prevents most issues
      finding = passed
        ? 'Viewport meta tag helps prevent horizontal scroll'
        : 'Without viewport meta, horizontal scrolling is likely on mobile';
      break;

    case 'mo-005': // Mobile navigation
      passed = html.structure.hasNav;
      finding = passed
        ? 'Navigation structure detected (assumed mobile-friendly)'
        : 'No navigation element found';
      break;

    case 'mo-006': // Click-to-call prominent
      passed = html.links.telLinks > 0;
      finding = passed
        ? 'Tap-to-call functionality available'
        : 'No tap-to-call links found. Critical for mobile users.';
      break;

    case 'mo-007': // Readable without zoom
      passed = html.meta.hasViewport; // Approximation
      finding = passed
        ? 'Viewport settings support readable text without zoom'
        : 'Missing viewport may require users to zoom';
      break;

    case 'mo-008': // Image optimization
      passed = html.images.responsiveCount > 0 || html.images.lazyLoadCount > 0;
      finding = passed
        ? `${html.images.responsiveCount} responsive images, ${html.images.lazyLoadCount} lazy-loaded`
        : 'No responsive image attributes (srcset) or lazy loading detected';
      break;

    case 'mo-009': // Form mobile-friendly
      {
        const mobileInputTypes = ['tel', 'email', 'number', 'date'];
        const hasMobileTypes = html.forms.forms.some((f) =>
          f.inputTypes.some((t) => mobileInputTypes.includes(t)),
        );
        passed = hasMobileTypes;
        finding = passed
          ? 'Forms use appropriate mobile input types (tel, email, etc.)'
          : html.forms.formCount === 0
            ? 'No forms found'
            : 'Forms do not use mobile-optimized input types';
      }
      break;

    case 'mo-010': // Fast mobile load
      passed = html.images.lazyLoadCount > 0 || html.images.totalImages <= 5;
      finding = passed
        ? 'Page appears optimized for mobile load (lazy loading or minimal images)'
        : 'Page may be heavy for mobile. Add lazy loading to images.';
      break;

    case 'mo-011': // No intrusive interstitials
      passed = !html.structure.hasCookieConsent || true; // Cookie consent is OK
      finding = 'Interstitial detection requires runtime analysis';
      break;

    case 'mo-012': // Thumb-zone CTA
      passed = html.forms.formCount > 0 || html.links.telLinks > 0;
      finding = passed
        ? 'CTA elements present (thumb-zone placement requires visual review)'
        : 'No CTA elements detected for thumb-zone evaluation';
      break;

    // === CTA OPTIMIZATION ===
    case 'cta-001': // Primary CTA visible
      passed = html.forms.formCount > 0 || html.forms.forms.some((f) => f.hasSubmitButton);
      finding = passed
        ? 'CTA/form detected (above-fold placement requires visual review)'
        : 'No primary CTA form or button detected';
      break;

    case 'cta-002': // CTA uses action language
      {
        const actionWords = /book|schedule|get|start|call|request|agend|marqu|ligu/i;
        const ctaTexts = html.forms.forms.map((f) => f.submitButtonText).join(' ');
        passed = actionWords.test(ctaTexts) || actionWords.test(html.textContent.slice(0, 2000));
        finding = passed
          ? 'Action-oriented CTA language detected'
          : 'CTA text may lack strong action verbs (Book, Schedule, Get Started)';
      }
      break;

    case 'cta-003': // CTA stands out visually
      passed = html.forms.forms.some((f) => f.hasSubmitButton);
      finding = passed
        ? 'CTA button detected (visual contrast requires CSS analysis)'
        : 'No distinct CTA button found';
      break;

    case 'cta-004': // Multiple CTAs on page
      {
        const buttonCount = html.forms.forms.filter((f) => f.hasSubmitButton).length;
        passed = buttonCount >= 2 || (html.links.telLinks >= 1 && html.forms.formCount >= 1);
        finding = passed
          ? 'Multiple CTA opportunities detected across page'
          : 'Only one or no CTA found. Add CTAs at multiple scroll points.';
      }
      break;

    case 'cta-005': // CTA specificity
      {
        const genericTerms = /submit|enviar|send/i;
        const specificTerms = /book|schedule|appointment|consulta|agend|call|lig/i;
        const allCTAText = html.forms.forms.map((f) => f.submitButtonText).join(' ');
        passed = specificTerms.test(allCTAText) || !genericTerms.test(allCTAText);
        finding = passed
          ? 'CTA text is specific to the desired action'
          : 'CTA uses generic text like "Submit". Use "Book Appointment" instead.';
      }
      break;

    case 'cta-006': // Secondary CTA present
      {
        const hasSecondary = html.links.telLinks > 0 || html.links.whatsappLinks > 0;
        passed = hasSecondary && html.forms.formCount > 0;
        finding = passed
          ? 'Secondary CTA (phone/WhatsApp) available alongside primary form'
          : 'No secondary CTA for hesitant visitors. Add a "Call Us" or "Learn More" option.';
      }
      break;

    case 'cta-007': // CTA button size adequate
      passed = html.forms.forms.some((f) => f.hasSubmitButton);
      finding = passed
        ? 'CTA buttons present (size requires CSS analysis)'
        : 'No CTA buttons detected to evaluate size';
      break;

    case 'cta-008': // CTA directional cues
      passed = false; // Requires visual analysis
      finding = 'Directional cues require visual/CSS analysis';
      break;

    case 'cta-009': // Sticky/floating CTA
      passed = html.links.hasStickyNav;
      finding = passed
        ? 'Sticky/fixed elements detected (may include CTA)'
        : 'No sticky CTA found. Consider adding floating contact button.';
      break;

    case 'cta-010': // CTA surrounded by trust
      passed = html.trust.hasTestimonials && html.forms.formCount > 0;
      finding = passed
        ? 'Trust elements and CTA both present on page'
        : 'CTA may lack surrounding trust elements';
      break;

    // === COMPLIANCE & PRIVACY ===
    case 'cp-001': // SSL certificate
      passed = url.startsWith('https');
      finding = passed
        ? 'Site uses HTTPS encryption'
        : 'Site does not use HTTPS. Critical security issue.';
      break;

    case 'cp-002': // Privacy policy link
      passed = html.structure.hasPrivacyLink;
      finding = passed
        ? 'Privacy policy link detected'
        : 'No privacy policy link found. Required for compliance.';
      break;

    case 'cp-003': // Cookie consent
      passed = html.structure.hasCookieConsent;
      finding = passed
        ? 'Cookie consent mechanism detected'
        : 'No cookie consent banner found';
      break;

    case 'cp-004': // LGPD compliance signals
      passed = html.structure.hasCookieConsent || html.structure.hasPrivacyLink;
      finding = passed
        ? 'Data protection compliance indicators present'
        : 'No LGPD/data protection compliance signals detected';
      break;

    case 'cp-005': // Form data disclosure
      passed = html.structure.hasPrivacyLink && html.forms.formCount > 0;
      finding = passed
        ? 'Privacy link available alongside forms'
        : html.forms.formCount === 0
          ? 'No forms present to evaluate'
          : 'Forms lack data usage disclosure. Add privacy notice near forms.';
      break;

    case 'cp-006': // Terms of service
      passed = html.structure.hasTermsLink;
      finding = passed
        ? 'Terms of service link detected'
        : 'No terms of service link found';
      break;

    case 'cp-007': // Secure forms
      passed = url.startsWith('https') || html.forms.formCount === 0;
      finding = passed
        ? 'Forms submit over secure connection (HTTPS)'
        : 'Forms may not submit over HTTPS. Security risk.';
      break;

    case 'cp-008': // Professional licensing info
      passed = html.trust.hasCredentials;
      finding = passed
        ? 'Professional credential/licensing indicators found'
        : 'No professional licensing information displayed';
      break;

    case 'cp-009': // Accessibility basics
      passed = html.images.imagesWithoutAlt === 0 && html.forms.forms.some((f) => f.hasLabels);
      finding = passed
        ? 'Basic accessibility features present (alt text, labels)'
        : 'Accessibility improvements needed (missing alt text or form labels)';
      break;

    case 'cp-010': // Contact information complete
      {
        const contactItems =
          (html.trust.hasPhoneVisible ? 1 : 0) +
          (html.trust.hasAddress ? 1 : 0) +
          (html.links.mailtoLinks > 0 ? 1 : 0);
        passed = contactItems >= 2;
        finding = passed
          ? `${contactItems} of 3 contact elements present (phone, address, email)`
          : `Only ${contactItems} contact element(s). Provide complete contact information.`;
      }
      break;

    // Fallback for any unhandled checkpoints
    default:
      passed = false;
      finding = `Checkpoint ${id} evaluation not implemented`;
      break;
  }

  return {
    checkpointId: id,
    name,
    passed,
    score: passed ? weight : 0,
    maxScore: weight,
    finding,
  };
}

// ---------------------------------------------------------------------------
// Category scoring
// ---------------------------------------------------------------------------

const ALL_CATEGORIES: AuditCategory[] = [
  'visualHierarchy',
  'copyEffectiveness',
  'trustCredibility',
  'conversionFriction',
  'mobileOptimization',
  'ctaOptimization',
  'compliancePrivacy',
];

function buildCategoryScore(
  category: AuditCategory,
  html: HTMLAnalysis,
  copy: CopyAnalysis,
  url: string,
): CategoryScore {
  const checkpoints = getCheckpointsByCategory(category);
  const maxPossible = getMaxScoreForCategory(category);

  const details: CheckResult[] = checkpoints.map((cp) =>
    evaluateCheckpoint(cp, html, copy, url),
  );

  const earnedScore = details.reduce((sum, d) => sum + d.score, 0);
  const passedChecks = details.filter((d) => d.passed).length;
  const normalizedScore = maxPossible > 0 ? Math.round((earnedScore / maxPossible) * 100) : 0;

  return {
    category,
    score: normalizedScore,
    maxPossible,
    passedChecks,
    totalChecks: checkpoints.length,
    grade: getGrade(normalizedScore),
    details,
  };
}

// ---------------------------------------------------------------------------
// Main audit runner
// ---------------------------------------------------------------------------

/**
 * Run a full CRO audit on the provided HTML for the given industry vertical.
 *
 * @param html - Raw HTML string of the page to audit
 * @param verticalId - The industry vertical to use for weighting
 * @param url - The original URL (used for SSL checks and metadata)
 * @returns A complete AuditResult with scores, analysis, and recommendations
 */
export function runAudit(
  html: string,
  verticalId: VerticalId,
  url: string,
): AuditResult {
  try {
    // Validate inputs
    if (!html || html.trim().length === 0) {
      throw createAppError(ErrorCode.EMPTY_CONTENT, 'HTML content is empty', { url, verticalId });
    }

    if (!url) {
      throw createAppError(ErrorCode.INVALID_URL, 'URL is required for audit', { verticalId });
    }

    // Get vertical configuration (throws if invalid)
    const verticalConfig = getVerticalConfig(verticalId);
    const weights: ScoringWeights = verticalConfig.scoringWeights;

    // Analyze HTML structure
    const htmlAnalysis: HTMLAnalysis = analyzeHTML(html);

    // Analyze copy / text content
    const copyAnalysis: CopyAnalysis = analyzeCopy(htmlAnalysis.textContent);

    // Score each category
    const categoryScores = {} as Record<AuditCategory, CategoryScore>;
    for (const category of ALL_CATEGORIES) {
      categoryScores[category] = buildCategoryScore(category, htmlAnalysis, copyAnalysis, url);
    }

    // Calculate weighted total
    const totalScore = calculateWeightedTotal(categoryScores, weights);

    // Benchmark comparison
    const benchmarkComparison = calculateBenchmarkComparison(totalScore, verticalConfig.benchmarks);

    // Build overall score
    const overallScore: OverallScore = {
      total: totalScore,
      grade: getGrade(totalScore),
      categories: categoryScores,
      benchmarkComparison,
    };

    // Generate prioritized recommendations
    const recommendations = generatePriorityRecommendations(categoryScores, weights);

    return {
      url,
      vertical: verticalId,
      timestamp: new Date().toISOString(),
      htmlAnalysis,
      copyAnalysis,
      overallScore,
      recommendations,
      mode: 'internal',
    };
  } catch (error: unknown) {
    // If it is already an AppError, re-throw after logging
    const appError = handleError(error);
    logError(appError);

    // Re-throw so the caller can handle it
    throw appError;
  }
}
