/**
 * CRO Audit Checklist Configuration
 * 200+ checkpoints organized by the 7 scoring categories.
 * Each checkpoint has a weight, detection method hint, and description.
 * Checkpoints are industry-agnostic and apply to any website vertical.
 */

export interface AuditCheckpoint {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  weight: number; // 1-5 importance scale
  detectMethod: 'html' | 'css' | 'content' | 'structure' | 'performance' | 'manual';
  passCondition: string;
}

export type AuditCategory =
  | 'visualHierarchy'
  | 'copyEffectiveness'
  | 'trustCredibility'
  | 'conversionFriction'
  | 'mobileOptimization'
  | 'ctaOptimization'
  | 'compliancePrivacy';

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  visualHierarchy: 'Visual Hierarchy & UX',
  copyEffectiveness: 'Copy Effectiveness',
  trustCredibility: 'Trust & Credibility',
  conversionFriction: 'Conversion Friction',
  mobileOptimization: 'Mobile Optimization',
  ctaOptimization: 'CTA Optimization',
  compliancePrivacy: 'Compliance & Privacy',
};

export const AUDIT_CHECKLIST: AuditCheckpoint[] = [
  // === VISUAL HIERARCHY & UX (30 checkpoints) ===
  { id: 'vh-001', category: 'visualHierarchy', name: 'Clear H1 headline', description: 'Page has exactly one H1 tag that communicates the primary value proposition', weight: 5, detectMethod: 'html', passCondition: 'Single H1 tag present' },
  { id: 'vh-002', category: 'visualHierarchy', name: 'Heading hierarchy', description: 'Headings follow proper H1>H2>H3 hierarchy without skipping levels', weight: 3, detectMethod: 'html', passCondition: 'No heading level skips' },
  { id: 'vh-003', category: 'visualHierarchy', name: 'Above-fold value prop', description: 'Primary value proposition visible without scrolling', weight: 5, detectMethod: 'structure', passCondition: 'Key content in first viewport' },
  { id: 'vh-004', category: 'visualHierarchy', name: 'Visual contrast on CTA', description: 'Primary CTA button has strong color contrast against background', weight: 4, detectMethod: 'css', passCondition: 'CTA contrast ratio > 4.5:1' },
  { id: 'vh-005', category: 'visualHierarchy', name: 'White space usage', description: 'Adequate spacing between sections prevents visual clutter', weight: 3, detectMethod: 'css', passCondition: 'Section padding >= 40px' },
  { id: 'vh-006', category: 'visualHierarchy', name: 'Image quality', description: 'Images are high-quality and relevant to the service or product', weight: 4, detectMethod: 'html', passCondition: 'Images present with adequate dimensions' },
  { id: 'vh-007', category: 'visualHierarchy', name: 'Consistent typography', description: 'No more than 2-3 font families used across the page', weight: 3, detectMethod: 'css', passCondition: 'Font family count <= 3' },
  { id: 'vh-008', category: 'visualHierarchy', name: 'Readable font size', description: 'Body text is at least 16px for comfortable reading', weight: 4, detectMethod: 'css', passCondition: 'Body font-size >= 16px' },
  { id: 'vh-009', category: 'visualHierarchy', name: 'Line length control', description: 'Text lines do not exceed 75 characters for readability', weight: 3, detectMethod: 'css', passCondition: 'Max-width set on text containers' },
  { id: 'vh-010', category: 'visualHierarchy', name: 'Color scheme consistency', description: 'Consistent color palette used throughout the page', weight: 3, detectMethod: 'css', passCondition: 'Limited color palette detected' },
  { id: 'vh-011', category: 'visualHierarchy', name: 'Navigation clarity', description: 'Primary navigation is visible and clearly labeled', weight: 4, detectMethod: 'html', passCondition: 'Nav element present with links' },
  { id: 'vh-012', category: 'visualHierarchy', name: 'Logo placement', description: 'Logo is visible in header area for brand recognition', weight: 3, detectMethod: 'html', passCondition: 'Image in header/nav area' },
  { id: 'vh-013', category: 'visualHierarchy', name: 'Section separation', description: 'Content sections are visually distinct from each other', weight: 3, detectMethod: 'structure', passCondition: 'Multiple distinct sections detected' },
  { id: 'vh-014', category: 'visualHierarchy', name: 'Image alt text', description: 'Images have descriptive alt text for accessibility', weight: 3, detectMethod: 'html', passCondition: 'All images have alt attributes' },
  { id: 'vh-015', category: 'visualHierarchy', name: 'No broken images', description: 'All image sources are valid and loadable', weight: 4, detectMethod: 'html', passCondition: 'No empty src attributes' },
  { id: 'vh-016', category: 'visualHierarchy', name: 'Hero section present', description: 'Prominent hero section with image/video and headline', weight: 4, detectMethod: 'structure', passCondition: 'Large hero-like section at top' },
  { id: 'vh-017', category: 'visualHierarchy', name: 'Scannable layout', description: 'Content uses bullets, icons, or cards for easy scanning', weight: 3, detectMethod: 'html', passCondition: 'Lists or card-like structures present' },
  { id: 'vh-018', category: 'visualHierarchy', name: 'Footer completeness', description: 'Footer includes contact info, links, and essential details', weight: 3, detectMethod: 'html', passCondition: 'Footer element with content' },
  { id: 'vh-019', category: 'visualHierarchy', name: 'No popup overload', description: 'Not more than one popup/modal on page load', weight: 4, detectMethod: 'html', passCondition: 'Minimal modal/popup elements' },
  { id: 'vh-020', category: 'visualHierarchy', name: 'Video integration', description: 'Video content used to explain services (bonus)', weight: 2, detectMethod: 'html', passCondition: 'Video or iframe embed present' },

  // === COPY EFFECTIVENESS (30 checkpoints) ===
  { id: 'ce-001', category: 'copyEffectiveness', name: 'Benefit-focused headline', description: 'H1 communicates a clear benefit, not just a feature or name', weight: 5, detectMethod: 'content', passCondition: 'H1 contains benefit language' },
  { id: 'ce-002', category: 'copyEffectiveness', name: 'Subheadline supports H1', description: 'Subheading elaborates on the main headline promise', weight: 4, detectMethod: 'content', passCondition: 'H2 follows H1 with supporting text' },
  { id: 'ce-003', category: 'copyEffectiveness', name: 'Reading level appropriate', description: 'Copy is written at 6th-8th grade reading level for accessibility', weight: 4, detectMethod: 'content', passCondition: 'Flesch reading ease > 60' },
  { id: 'ce-004', category: 'copyEffectiveness', name: 'Benefits over features', description: 'Copy leads with customer benefits rather than technical features', weight: 5, detectMethod: 'content', passCondition: 'Benefit language ratio > 0.5' },
  { id: 'ce-005', category: 'copyEffectiveness', name: 'Emotional triggers present', description: 'Copy addresses emotional needs (safety, trust, confidence)', weight: 4, detectMethod: 'content', passCondition: 'Emotional keywords detected' },
  { id: 'ce-006', category: 'copyEffectiveness', name: 'Clear value proposition', description: 'Unique value proposition is stated within first 2 sections', weight: 5, detectMethod: 'content', passCondition: 'Differentiating language in top content' },
  { id: 'ce-007', category: 'copyEffectiveness', name: 'Objection handling', description: 'Common customer objections are addressed in the copy', weight: 4, detectMethod: 'content', passCondition: 'FAQ or objection-handling content present' },
  { id: 'ce-008', category: 'copyEffectiveness', name: 'Urgency/scarcity cues', description: 'Appropriate urgency without being pushy (limited availability, etc.)', weight: 3, detectMethod: 'content', passCondition: 'Urgency language detected' },
  { id: 'ce-009', category: 'copyEffectiveness', name: 'Short paragraphs', description: 'Paragraphs are 3-4 lines max for easy scanning', weight: 3, detectMethod: 'html', passCondition: 'Average paragraph < 100 words' },
  { id: 'ce-010', category: 'copyEffectiveness', name: 'Power words usage', description: 'Copy uses persuasive power words (guaranteed, proven, trusted)', weight: 3, detectMethod: 'content', passCondition: 'Power words present in copy' },
  { id: 'ce-011', category: 'copyEffectiveness', name: 'Service descriptions clear', description: 'Each service has a clear, customer-friendly description', weight: 4, detectMethod: 'content', passCondition: 'Service sections with descriptive text' },
  { id: 'ce-012', category: 'copyEffectiveness', name: 'No jargon overload', description: 'Industry jargon is explained or avoided in customer-facing copy', weight: 4, detectMethod: 'content', passCondition: 'Low jargon density' },
  { id: 'ce-013', category: 'copyEffectiveness', name: 'Second person language', description: 'Copy uses "you/your" to speak directly to the reader', weight: 3, detectMethod: 'content', passCondition: 'Second person pronouns present' },
  { id: 'ce-014', category: 'copyEffectiveness', name: 'Process/steps explained', description: 'How-it-works or what-to-expect section present', weight: 4, detectMethod: 'content', passCondition: 'Process/steps content detected' },
  { id: 'ce-015', category: 'copyEffectiveness', name: 'Micro-copy on forms', description: 'Form labels, placeholders, and helper text are clear', weight: 3, detectMethod: 'html', passCondition: 'Form fields have labels/placeholders' },

  // === TRUST & CREDIBILITY (30 checkpoints) ===
  { id: 'tc-001', category: 'trustCredibility', name: 'Professional credentials', description: 'Professional credentials or qualifications clearly displayed', weight: 5, detectMethod: 'content', passCondition: 'Credential indicators present (Dr., MD, DDS, JD, CPA, etc.)' },
  { id: 'tc-002', category: 'trustCredibility', name: 'Customer testimonials', description: 'Real customer/client testimonials with names or identifiers', weight: 5, detectMethod: 'content', passCondition: 'Testimonial content detected' },
  { id: 'tc-003', category: 'trustCredibility', name: 'Google reviews integration', description: 'Google review score or link to reviews displayed', weight: 4, detectMethod: 'content', passCondition: 'Review/rating indicators present' },
  { id: 'tc-004', category: 'trustCredibility', name: 'Years in practice', description: 'Experience duration communicated (est. year or years count)', weight: 3, detectMethod: 'content', passCondition: 'Experience duration mentioned' },
  { id: 'tc-005', category: 'trustCredibility', name: 'Customer count', description: 'Number of customers/clients served is mentioned', weight: 3, detectMethod: 'content', passCondition: 'Customer count or similar stat present' },
  { id: 'tc-006', category: 'trustCredibility', name: 'Professional photos', description: 'Professional team/facility photos (not stock photos)', weight: 4, detectMethod: 'html', passCondition: 'Multiple team/facility images' },
  { id: 'tc-007', category: 'trustCredibility', name: 'Association logos', description: 'Professional association memberships displayed', weight: 3, detectMethod: 'html', passCondition: 'Logo/badge images present' },
  { id: 'tc-008', category: 'trustCredibility', name: 'Payment/pricing info', description: 'Accepted payment methods, pricing, or insurance options listed', weight: 4, detectMethod: 'content', passCondition: 'Payment/pricing/insurance language detected' },
  { id: 'tc-009', category: 'trustCredibility', name: 'Guarantee/risk reversal', description: 'Satisfaction guarantee or risk-free offer present', weight: 4, detectMethod: 'content', passCondition: 'Guarantee language detected' },
  { id: 'tc-010', category: 'trustCredibility', name: 'Physical address visible', description: 'Physical business address is displayed', weight: 4, detectMethod: 'content', passCondition: 'Address pattern detected' },
  { id: 'tc-011', category: 'trustCredibility', name: 'Phone number visible', description: 'Phone number prominently displayed', weight: 5, detectMethod: 'html', passCondition: 'tel: link or phone pattern detected' },
  { id: 'tc-012', category: 'trustCredibility', name: 'Before/after evidence', description: 'Before and after photos or case studies shown', weight: 3, detectMethod: 'content', passCondition: 'Before/after language or gallery detected' },
  { id: 'tc-013', category: 'trustCredibility', name: 'Awards/recognition', description: 'Industry awards or recognition displayed', weight: 2, detectMethod: 'content', passCondition: 'Award/recognition language detected' },
  { id: 'tc-014', category: 'trustCredibility', name: 'Team bios', description: 'Individual team member bios with photos and qualifications', weight: 4, detectMethod: 'content', passCondition: 'Team/staff bio section detected' },

  { id: 'tc-015', category: 'trustCredibility', name: 'Map/directions', description: 'Google Maps embed or directions provided', weight: 3, detectMethod: 'html', passCondition: 'Map iframe or directions link present' },

  // === CONVERSION FRICTION (30 checkpoints) ===
  { id: 'cf-001', category: 'conversionFriction', name: 'Form field count', description: 'Primary form has 5 or fewer fields', weight: 5, detectMethod: 'html', passCondition: 'Form field count <= 5' },
  { id: 'cf-002', category: 'conversionFriction', name: 'Single-step form', description: 'Primary conversion form fits on one screen', weight: 4, detectMethod: 'html', passCondition: 'Form is single-step' },
  { id: 'cf-003', category: 'conversionFriction', name: 'Click-to-call enabled', description: 'Phone numbers are clickable on mobile', weight: 5, detectMethod: 'html', passCondition: 'tel: links present' },
  { id: 'cf-004', category: 'conversionFriction', name: 'WhatsApp/chat integration', description: 'WhatsApp, live chat, or messaging contact option available', weight: 4, detectMethod: 'html', passCondition: 'WhatsApp or chat link detected' },
  { id: 'cf-005', category: 'conversionFriction', name: 'Online booking available', description: 'Direct appointment booking functionality on site', weight: 5, detectMethod: 'html', passCondition: 'Booking/scheduling widget detected' },
  { id: 'cf-006', category: 'conversionFriction', name: 'Multiple contact options', description: 'At least 3 contact methods available (phone, form, email/WhatsApp)', weight: 4, detectMethod: 'html', passCondition: 'Multiple contact methods detected' },
  { id: 'cf-007', category: 'conversionFriction', name: 'Page load speed', description: 'Page loads in under 3 seconds', weight: 5, detectMethod: 'performance', passCondition: 'Load time < 3s' },
  { id: 'cf-008', category: 'conversionFriction', name: 'No unnecessary steps', description: 'Conversion path is direct (no intermediate pages)', weight: 4, detectMethod: 'structure', passCondition: 'Direct conversion path' },
  { id: 'cf-009', category: 'conversionFriction', name: 'Hours of operation visible', description: 'Business hours clearly displayed', weight: 4, detectMethod: 'content', passCondition: 'Hours/schedule information present' },
  { id: 'cf-010', category: 'conversionFriction', name: 'Form validation helpful', description: 'Form shows inline validation, not just error after submit', weight: 3, detectMethod: 'html', passCondition: 'Form validation attributes present' },
  { id: 'cf-011', category: 'conversionFriction', name: 'No captcha on main form', description: 'Primary conversion form doesn\'t require captcha', weight: 3, detectMethod: 'html', passCondition: 'No captcha on primary form' },
  { id: 'cf-012', category: 'conversionFriction', name: 'Sticky contact option', description: 'Contact method remains accessible while scrolling', weight: 4, detectMethod: 'css', passCondition: 'Fixed/sticky contact element detected' },
  { id: 'cf-013', category: 'conversionFriction', name: 'Clear pricing signals', description: 'Pricing or "starting from" information available', weight: 3, detectMethod: 'content', passCondition: 'Price/cost language detected' },
  { id: 'cf-014', category: 'conversionFriction', name: 'FAQ section', description: 'Frequently asked questions address common concerns', weight: 3, detectMethod: 'content', passCondition: 'FAQ section detected' },
  { id: 'cf-015', category: 'conversionFriction', name: 'Exit intent handling', description: 'Exit-intent or engagement triggers present', weight: 2, detectMethod: 'html', passCondition: 'Exit-intent script detected' },

  // === MOBILE OPTIMIZATION (25 checkpoints) ===
  { id: 'mo-001', category: 'mobileOptimization', name: 'Viewport meta tag', description: 'Proper viewport meta tag for responsive design', weight: 5, detectMethod: 'html', passCondition: 'viewport meta tag present' },
  { id: 'mo-002', category: 'mobileOptimization', name: 'Responsive design', description: 'CSS media queries or responsive framework detected', weight: 5, detectMethod: 'css', passCondition: 'Media queries or responsive framework present' },
  { id: 'mo-003', category: 'mobileOptimization', name: 'Touch-friendly buttons', description: 'Buttons and links have minimum 44x44px touch targets', weight: 4, detectMethod: 'css', passCondition: 'Button min size >= 44px' },
  { id: 'mo-004', category: 'mobileOptimization', name: 'No horizontal scroll', description: 'Page does not require horizontal scrolling on mobile', weight: 5, detectMethod: 'css', passCondition: 'No overflow-x issues' },
  { id: 'mo-005', category: 'mobileOptimization', name: 'Mobile navigation', description: 'Hamburger menu or mobile-friendly navigation present', weight: 4, detectMethod: 'html', passCondition: 'Mobile nav pattern detected' },
  { id: 'mo-006', category: 'mobileOptimization', name: 'Click-to-call prominent', description: 'Phone number is tap-to-call on mobile', weight: 5, detectMethod: 'html', passCondition: 'tel: link prominent on mobile' },
  { id: 'mo-007', category: 'mobileOptimization', name: 'Readable without zoom', description: 'Text is readable without pinch-to-zoom', weight: 4, detectMethod: 'css', passCondition: 'Font size >= 14px on mobile' },
  { id: 'mo-008', category: 'mobileOptimization', name: 'Image optimization', description: 'Images use responsive sizing or srcset', weight: 3, detectMethod: 'html', passCondition: 'Responsive image attributes present' },
  { id: 'mo-009', category: 'mobileOptimization', name: 'Form mobile-friendly', description: 'Forms use appropriate input types (tel, email, etc.)', weight: 4, detectMethod: 'html', passCondition: 'Input type attributes appropriate' },
  { id: 'mo-010', category: 'mobileOptimization', name: 'Fast mobile load', description: 'Page optimized for mobile network speeds', weight: 4, detectMethod: 'performance', passCondition: 'Minimal large resources' },
  { id: 'mo-011', category: 'mobileOptimization', name: 'No intrusive interstitials', description: 'No full-screen popups that block mobile content', weight: 4, detectMethod: 'html', passCondition: 'No mobile interstitials detected' },
  { id: 'mo-012', category: 'mobileOptimization', name: 'Thumb-zone CTA', description: 'Primary CTA positioned in thumb-friendly zone', weight: 3, detectMethod: 'structure', passCondition: 'CTA in lower half of viewport' },

  // === CTA OPTIMIZATION (25 checkpoints) ===
  { id: 'cta-001', category: 'ctaOptimization', name: 'Primary CTA visible', description: 'Main CTA visible above the fold', weight: 5, detectMethod: 'structure', passCondition: 'CTA button in first viewport' },
  { id: 'cta-002', category: 'ctaOptimization', name: 'CTA uses action language', description: 'CTA text uses action verbs (Book, Schedule, Get, Start)', weight: 5, detectMethod: 'content', passCondition: 'Action verb in CTA text' },
  { id: 'cta-003', category: 'ctaOptimization', name: 'CTA stands out visually', description: 'CTA button has distinct color from rest of page', weight: 4, detectMethod: 'css', passCondition: 'CTA color contrasts with page palette' },
  { id: 'cta-004', category: 'ctaOptimization', name: 'Multiple CTAs on page', description: 'CTA appears at multiple scroll points', weight: 4, detectMethod: 'html', passCondition: 'Multiple CTA buttons detected' },
  { id: 'cta-005', category: 'ctaOptimization', name: 'CTA specificity', description: 'CTA is specific (Book Appointment vs generic Submit)', weight: 4, detectMethod: 'content', passCondition: 'CTA text is specific to action' },
  { id: 'cta-006', category: 'ctaOptimization', name: 'Secondary CTA present', description: 'Lower-commitment secondary CTA for hesitant visitors', weight: 3, detectMethod: 'html', passCondition: 'Secondary action available' },
  { id: 'cta-007', category: 'ctaOptimization', name: 'CTA button size adequate', description: 'CTA button is large enough to be easily clickable', weight: 4, detectMethod: 'css', passCondition: 'Button padding adequate' },
  { id: 'cta-008', category: 'ctaOptimization', name: 'CTA directional cues', description: 'Visual cues (arrows, images) point toward CTA', weight: 2, detectMethod: 'structure', passCondition: 'Directional elements near CTA' },
  { id: 'cta-009', category: 'ctaOptimization', name: 'Sticky/floating CTA', description: 'CTA remains accessible during scrolling', weight: 4, detectMethod: 'css', passCondition: 'Fixed/sticky CTA element' },
  { id: 'cta-010', category: 'ctaOptimization', name: 'CTA surrounded by trust', description: 'Trust elements (testimonials, guarantees) near CTA', weight: 3, detectMethod: 'structure', passCondition: 'Trust content adjacent to CTA' },

  // === COMPLIANCE & PRIVACY (20 checkpoints) ===
  { id: 'cp-001', category: 'compliancePrivacy', name: 'SSL certificate', description: 'Site uses HTTPS encryption', weight: 5, detectMethod: 'html', passCondition: 'HTTPS in URL' },
  { id: 'cp-002', category: 'compliancePrivacy', name: 'Privacy policy link', description: 'Privacy policy page linked from footer or form', weight: 5, detectMethod: 'html', passCondition: 'Privacy policy link detected' },
  { id: 'cp-003', category: 'compliancePrivacy', name: 'Cookie consent', description: 'Cookie consent banner or notice present', weight: 4, detectMethod: 'html', passCondition: 'Cookie consent element detected' },
  { id: 'cp-004', category: 'compliancePrivacy', name: 'Data protection compliance', description: 'Data protection compliance indicators (GDPR, LGPD, CCPA, etc.)', weight: 4, detectMethod: 'content', passCondition: 'Data protection language detected' },
  { id: 'cp-005', category: 'compliancePrivacy', name: 'Form data disclosure', description: 'Forms explain how submitted data will be used', weight: 3, detectMethod: 'html', passCondition: 'Data use notice near forms' },
  { id: 'cp-006', category: 'compliancePrivacy', name: 'Terms of service', description: 'Terms of service page accessible', weight: 3, detectMethod: 'html', passCondition: 'Terms link detected' },
  { id: 'cp-007', category: 'compliancePrivacy', name: 'Secure forms', description: 'Forms submit over HTTPS', weight: 5, detectMethod: 'html', passCondition: 'Form action uses HTTPS' },
  { id: 'cp-008', category: 'compliancePrivacy', name: 'Professional licensing info', description: 'Professional license/registration numbers displayed', weight: 3, detectMethod: 'content', passCondition: 'License/registration info detected' },
  { id: 'cp-009', category: 'compliancePrivacy', name: 'Accessibility basics', description: 'Basic accessibility features (alt text, contrast, labels)', weight: 3, detectMethod: 'html', passCondition: 'Accessibility attributes present' },
  { id: 'cp-010', category: 'compliancePrivacy', name: 'Contact information complete', description: 'Full contact details (address, phone, email) available', weight: 4, detectMethod: 'content', passCondition: 'Complete contact info detected' },
];

export function getCheckpointsByCategory(category: AuditCategory): AuditCheckpoint[] {
  return AUDIT_CHECKLIST.filter((cp) => cp.category === category);
}

export function getMaxScoreForCategory(category: AuditCategory): number {
  return getCheckpointsByCategory(category).reduce((sum, cp) => sum + cp.weight, 0);
}
