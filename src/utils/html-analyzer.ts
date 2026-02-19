/**
 * HTML Analysis Engine
 * Parses HTML content and extracts CRO-relevant signals.
 * This is the core engine that powers Tool 1's audit capabilities.
 */

export interface HTMLAnalysis {
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  forms: FormAnalysis;
  links: LinkAnalysis;
  meta: MetaAnalysis;
  structure: StructureAnalysis;
  trust: TrustSignalAnalysis;
  textContent: string;
}

export interface HeadingAnalysis {
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h2Text: string[];
  h3Count: number;
  hierarchyValid: boolean;
  headingLevelsUsed: number[];
}

export interface ImageAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  emptySrc: number;
  lazyLoadCount: number;
  responsiveCount: number;
}

export interface FormAnalysis {
  formCount: number;
  forms: {
    fieldCount: number;
    hasLabels: boolean;
    hasPlaceholders: boolean;
    inputTypes: string[];
    hasRequired: boolean;
    hasCaptcha: boolean;
    hasSubmitButton: boolean;
    submitButtonText: string;
  }[];
}

export interface LinkAnalysis {
  totalLinks: number;
  telLinks: number;
  mailtoLinks: number;
  whatsappLinks: number;
  externalLinks: number;
  socialLinks: number;
  hasStickyNav: boolean;
}

export interface MetaAnalysis {
  hasViewport: boolean;
  hasDescription: boolean;
  descriptionText: string;
  hasOgTags: boolean;
  hasCanonical: boolean;
  hasFavicon: boolean;
  charset: string;
  language: string;
}

export interface StructureAnalysis {
  hasHeader: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  hasHeroSection: boolean;
  sectionCount: number;
  hasVideo: boolean;
  hasIframe: boolean;
  hasMap: boolean;
  hasCookieConsent: boolean;
  hasPrivacyLink: boolean;
  hasTermsLink: boolean;
}

export interface TrustSignalAnalysis {
  hasTestimonials: boolean;
  hasReviewScore: boolean;
  hasCredentials: boolean;
  hasPhoneVisible: boolean;
  hasAddress: boolean;
  hasHoursOfOperation: boolean;
  hasTeamBios: boolean;
  hasCertifications: boolean;
  hasGuarantee: boolean;
  hasInsuranceInfo: boolean;
  hasFAQ: boolean;
  hasBeforeAfter: boolean;
  patientCountMentioned: boolean;
  yearsExperienceMentioned: boolean;
}

/**
 * Parse raw HTML string and extract all CRO-relevant signals.
 * Uses regex-based parsing for reliability without heavy DOM dependencies.
 */
export function analyzeHTML(html: string): HTMLAnalysis {
  const lowerHtml = html.toLowerCase();

  return {
    headings: analyzeHeadings(html),
    images: analyzeImages(html),
    forms: analyzeForms(html),
    links: analyzeLinks(html, lowerHtml),
    meta: analyzeMeta(html, lowerHtml),
    structure: analyzeStructure(html, lowerHtml),
    trust: analyzeTrustSignals(html, lowerHtml),
    textContent: extractTextContent(html),
  };
}

function analyzeHeadings(html: string): HeadingAnalysis {
  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/gi) || [];

  const stripTags = (s: string) => s.replace(/<[^>]*>/g, '').trim();

  const levelsUsed: number[] = [];
  if (h1Matches.length > 0) levelsUsed.push(1);
  if (h2Matches.length > 0) levelsUsed.push(2);
  if (h3Matches.length > 0) levelsUsed.push(3);

  // Check for hierarchy issues (e.g., H3 without H2)
  const hierarchyValid = !(levelsUsed.includes(3) && !levelsUsed.includes(2));

  return {
    h1Count: h1Matches.length,
    h1Text: h1Matches.map(stripTags),
    h2Count: h2Matches.length,
    h2Text: h2Matches.map(stripTags),
    h3Count: h3Matches.length,
    hierarchyValid,
    headingLevelsUsed: levelsUsed,
  };
}

function analyzeImages(html: string): ImageAnalysis {
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  let withAlt = 0;
  let withoutAlt = 0;
  let emptySrc = 0;
  let lazyLoad = 0;
  let responsive = 0;

  for (const img of imgTags) {
    if (/alt\s*=\s*"[^"]+"/i.test(img) || /alt\s*=\s*'[^']+'/i.test(img)) {
      withAlt++;
    } else {
      withoutAlt++;
    }
    if (/src\s*=\s*["']\s*["']/i.test(img)) emptySrc++;
    if (/loading\s*=\s*["']lazy["']/i.test(img)) lazyLoad++;
    if (/srcset/i.test(img) || /sizes/i.test(img)) responsive++;
  }

  return {
    totalImages: imgTags.length,
    imagesWithAlt: withAlt,
    imagesWithoutAlt: withoutAlt,
    emptySrc,
    lazyLoadCount: lazyLoad,
    responsiveCount: responsive,
  };
}

function analyzeForms(html: string): FormAnalysis {
  const formBlocks = html.match(/<form[\s\S]*?<\/form>/gi) || [];
  const forms = formBlocks.map((form) => {
    const inputs = form.match(/<input[^>]*>/gi) || [];
    const selects = form.match(/<select[\s\S]*?<\/select>/gi) || [];
    const textareas = form.match(/<textarea[\s\S]*?<\/textarea>/gi) || [];
    const fieldCount = inputs.length + selects.length + textareas.length;

    const labels = form.match(/<label/gi) || [];
    const placeholders = form.match(/placeholder\s*=/gi) || [];
    const required = form.match(/required/gi) || [];

    const inputTypes = inputs.map((inp) => {
      const typeMatch = inp.match(/type\s*=\s*["']([^"']+)["']/i);
      return typeMatch ? typeMatch[1] : 'text';
    }).filter((t) => t !== 'hidden');

    const hasCaptcha = /captcha|recaptcha|hcaptcha/i.test(form);

    const submitBtns = form.match(/<button[^>]*type\s*=\s*["']submit["'][^>]*>([\s\S]*?)<\/button>/gi)
      || form.match(/<input[^>]*type\s*=\s*["']submit["'][^>]*>/gi) || [];

    let submitText = 'Submit';
    const firstBtn = submitBtns[0];
    if (firstBtn) {
      const textMatch = firstBtn.replace(/<[^>]*>/g, '').trim();
      if (textMatch) submitText = textMatch;
      else {
        const valMatch = firstBtn.match(/value\s*=\s*["']([^"']+)["']/i);
        if (valMatch) submitText = valMatch[1];
      }
    }

    return {
      fieldCount,
      hasLabels: labels.length > 0,
      hasPlaceholders: placeholders.length > 0,
      inputTypes,
      hasRequired: required.length > 0,
      hasCaptcha,
      hasSubmitButton: submitBtns.length > 0,
      submitButtonText: submitText,
    };
  });

  return { formCount: formBlocks.length, forms };
}

function analyzeLinks(html: string, lowerHtml: string): LinkAnalysis {
  const allLinks = html.match(/<a[^>]*>/gi) || [];
  const telLinks = (html.match(/href\s*=\s*["']tel:/gi) || []).length;
  const mailtoLinks = (html.match(/href\s*=\s*["']mailto:/gi) || []).length;
  const whatsappLinks = (lowerHtml.match(/whatsapp|wa\.me|api\.whatsapp/g) || []).length;
  const socialPatterns = /facebook|twitter|instagram|linkedin|youtube|tiktok/gi;
  const socialLinks = (lowerHtml.match(socialPatterns) || []).length;
  const hasStickyNav = /position\s*:\s*(fixed|sticky)/i.test(html) && /<nav|<header/i.test(html);

  return {
    totalLinks: allLinks.length,
    telLinks,
    mailtoLinks,
    whatsappLinks,
    externalLinks: 0, // Would need base URL to calculate
    socialLinks,
    hasStickyNav,
  };
}

function analyzeMeta(html: string, lowerHtml: string): MetaAnalysis {
  const viewportMatch = /name\s*=\s*["']viewport["']/i.test(html);
  const descMatch = html.match(/name\s*=\s*["']description["']\s+content\s*=\s*["']([^"']*?)["']/i)
    || html.match(/content\s*=\s*["']([^"']*?)["']\s+name\s*=\s*["']description["']/i);
  const ogMatch = /property\s*=\s*["']og:/i.test(html);
  const canonicalMatch = /rel\s*=\s*["']canonical["']/i.test(html);
  const faviconMatch = /rel\s*=\s*["'](?:shortcut )?icon["']/i.test(html);
  const charsetMatch = html.match(/charset\s*=\s*["']?([^"'\s>]+)/i);
  const langMatch = html.match(/<html[^>]*lang\s*=\s*["']([^"']+)["']/i);

  return {
    hasViewport: viewportMatch,
    hasDescription: !!descMatch,
    descriptionText: descMatch ? descMatch[1] : '',
    hasOgTags: ogMatch,
    hasCanonical: canonicalMatch,
    hasFavicon: faviconMatch,
    charset: charsetMatch ? charsetMatch[1] : '',
    language: langMatch ? langMatch[1] : '',
  };
}

function analyzeStructure(html: string, lowerHtml: string): StructureAnalysis {
  return {
    hasHeader: /<header/i.test(html),
    hasNav: /<nav/i.test(html),
    hasMain: /<main/i.test(html),
    hasFooter: /<footer/i.test(html),
    hasHeroSection: /hero|banner|jumbotron/i.test(html),
    sectionCount: (html.match(/<section/gi) || []).length,
    hasVideo: /<video/i.test(html) || /youtube|vimeo/i.test(lowerHtml),
    hasIframe: /<iframe/i.test(html),
    hasMap: /google.*maps|maps\.google|mapbox/i.test(lowerHtml),
    hasCookieConsent: /cookie.*consent|cookie.*banner|cookie.*notice|lgpd/i.test(lowerHtml),
    hasPrivacyLink: /privacy|privacidade|política de privacidade/i.test(lowerHtml),
    hasTermsLink: /terms|termos|terms of service|termos de uso/i.test(lowerHtml),
  };
}

function analyzeTrustSignals(html: string, lowerHtml: string): TrustSignalAnalysis {
  return {
    hasTestimonials: /testimonial|depoimento|review|avaliação|"[^"]{20,}"/i.test(lowerHtml),
    hasReviewScore: /★|⭐|star|rating|nota|estrela|\d+(\.\d+)?\s*\/\s*5/i.test(lowerHtml),
    hasCredentials: /\b(dr\.|md|dds|phd|dvm|rn|cpt|lcsw|psyd)\b/i.test(lowerHtml),
    hasPhoneVisible: /\(\d{2,3}\)\s*\d{4,5}[-.\s]?\d{4}|\+\d{1,3}\s*\d/i.test(html),
    hasAddress: /\b(street|st\.|avenue|ave\.|rua|avenida|av\.)\b/i.test(lowerHtml) || /\d{5}[-]?\d{3}/i.test(html),
    hasHoursOfOperation: /hours|horário|schedule|segunda|monday|seg\s*[à-]/i.test(lowerHtml),
    hasTeamBios: /team|equipe|our doctors|nossos médicos|about us|sobre nós/i.test(lowerHtml),
    hasCertifications: /certified|certificad|accredited|credenciado|board certified/i.test(lowerHtml),
    hasGuarantee: /guarantee|garantia|satisfaction|satisfação|money back|risk.free/i.test(lowerHtml),
    hasInsuranceInfo: /insurance|convênio|plano de saúde|payment plan|parcel/i.test(lowerHtml),
    hasFAQ: /faq|frequently asked|perguntas frequentes|dúvidas/i.test(lowerHtml),
    hasBeforeAfter: /before.*after|antes.*depois/i.test(lowerHtml),
    patientCountMentioned: /\d{1,3}(,\d{3})*\+?\s*(patients|pacientes|clients|clientes|families|famílias|pets|animals)/i.test(lowerHtml),
    yearsExperienceMentioned: /\d+\+?\s*(years|anos|year|ano)\s*(of)?\s*(experience|experiência|in practice|de prática)/i.test(lowerHtml),
  };
}

function extractTextContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000); // Cap at 10k chars for analysis
}
