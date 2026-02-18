/**
 * Industry Verticals Configuration
 * Defines all supported industry verticals with their specific scoring weights,
 * benchmarks, and conversion characteristics.
 *
 * Healthcare verticals remain the primary focus, with additional industries
 * available for general CRO auditing across any vertical.
 */

// ---------------------------------------------------------------------------
// Industry categories
// ---------------------------------------------------------------------------

export type IndustryCategory =
  | 'healthcare'
  | 'ecommerce'
  | 'saas'
  | 'professional_services'
  | 'real_estate'
  | 'education'
  | 'home_services'
  | 'fitness_wellness'
  | 'hospitality';

export const INDUSTRY_CATEGORY_LABELS: Record<IndustryCategory, string> = {
  healthcare: 'Healthcare (Primary)',
  ecommerce: 'E-Commerce',
  saas: 'SaaS / Technology',
  professional_services: 'Professional Services',
  real_estate: 'Real Estate',
  education: 'Education',
  home_services: 'Home Services',
  fitness_wellness: 'Fitness & Wellness',
  hospitality: 'Hospitality & Travel',
};

// ---------------------------------------------------------------------------
// Vertical IDs
// ---------------------------------------------------------------------------

export type VerticalId =
  // Healthcare (primary)
  | 'dental'
  | 'aesthetic'
  | 'veterinary'
  | 'physical_therapy'
  | 'psychology'
  | 'general_medical'
  | 'specialized_medical'
  | 'alternative_medicine'
  | 'nutrition'
  | 'ophthalmology'
  | 'dermatology'
  | 'medical_spa'
  // E-Commerce
  | 'ecommerce_general'
  | 'ecommerce_fashion'
  | 'ecommerce_electronics'
  // SaaS / Technology
  | 'saas_b2b'
  | 'saas_b2c'
  // Professional Services
  | 'legal'
  | 'accounting'
  | 'consulting'
  // Real Estate
  | 'real_estate_residential'
  | 'real_estate_commercial'
  // Education
  | 'education_online'
  | 'education_institution'
  // Home Services
  | 'home_services_general'
  | 'home_services_contractors'
  // Fitness & Wellness
  | 'gym_fitness'
  | 'yoga_pilates'
  // Hospitality
  | 'hotel_resort'
  | 'restaurant';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ScoringWeights {
  visualHierarchy: number;
  copyEffectiveness: number;
  trustCredibility: number;
  conversionFriction: number;
  mobileOptimization: number;
  ctaOptimization: number;
  compliancePrivacy: number;
}

export interface ConversionBenchmarks {
  average: number;
  good: number;
  excellent: number;
}

export interface VerticalConfig {
  id: VerticalId;
  label: string;
  description: string;
  industry: IndustryCategory;
  /** Term for the end-user (patient, customer, client, student, guest, etc.) */
  customerTerm: string;
  /** Plural form of the customer term */
  customerTermPlural: string;
  scoringWeights: ScoringWeights;
  benchmarks: ConversionBenchmarks;
  keyConversionActions: string[];
  criticalTrustElements: string[];
  commonPainPoints: string[];
  commonDesires: string[];
  specialties: string[];
}

// ---------------------------------------------------------------------------
// All verticals (healthcare-first, then other industries)
// ---------------------------------------------------------------------------

export const INDUSTRY_VERTICALS: Record<VerticalId, VerticalConfig> = {
  // =======================================================================
  // HEALTHCARE (Primary)
  // =======================================================================
  dental: {
    id: 'dental',
    label: 'Dental Clinic',
    description: 'General, cosmetic, and specialty dental practices',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.13,
      trustCredibility: 0.20,
      conversionFriction: 0.20,
      mobileOptimization: 0.15,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 2.8, good: 4.5, excellent: 7.0 },
    keyConversionActions: ['Book Appointment', 'Call Now', 'Request Consultation'],
    criticalTrustElements: ['before/after photos', 'patient testimonials', 'credentials', 'years in practice'],
    commonPainPoints: ['dental anxiety', 'tooth pain', 'cost concerns', 'scheduling difficulty'],
    commonDesires: ['confident smile', 'pain-free treatment', 'same-day appointments', 'affordable care'],
    specialties: ['General', 'Cosmetic', 'Orthodontics', 'Pediatric', 'Emergency', 'Implants'],
  },
  aesthetic: {
    id: 'aesthetic',
    label: 'Aesthetic / Cosmetic Clinic',
    description: 'Botox, fillers, body contouring, skin treatments',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.15,
      copyEffectiveness: 0.12,
      trustCredibility: 0.22,
      conversionFriction: 0.15,
      mobileOptimization: 0.13,
      ctaOptimization: 0.13,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 3.2, good: 5.1, excellent: 8.0 },
    keyConversionActions: ['Book Consultation', 'View Gallery', 'Get Quote'],
    criticalTrustElements: ['before/after gallery', 'doctor credentials', 'certifications', 'celebrity endorsements'],
    commonPainPoints: ['aging skin', 'unwanted fat', 'low confidence', 'fear of looking unnatural'],
    commonDesires: ['look younger', 'feel beautiful', 'non-invasive options', 'natural results'],
    specialties: ['Botox/Fillers', 'Body Contouring', 'Skin Treatments', 'Hair Restoration', 'Laser Treatments'],
  },
  veterinary: {
    id: 'veterinary',
    label: 'Veterinary Clinic',
    description: 'Small animal, large animal, exotic, and emergency vet services',
    industry: 'healthcare',
    customerTerm: 'pet owner',
    customerTermPlural: 'pet owners',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.12,
      trustCredibility: 0.18,
      conversionFriction: 0.22,
      mobileOptimization: 0.18,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 4.1, good: 6.3, excellent: 9.0 },
    keyConversionActions: ['Call Emergency', 'Book Visit', 'New Patient Form'],
    criticalTrustElements: ['pet photos', 'vet credentials', 'emergency availability', 'equipment showcase'],
    commonPainPoints: ['pet suffering', 'emergency access', 'cost of care', 'finding specialized care'],
    commonDesires: ['compassionate care', 'experienced staff', 'affordable options', '24/7 availability'],
    specialties: ['Small Animals', 'Large Animals', 'Exotic', 'Emergency', 'Mobile Vet', 'Dental'],
  },
  physical_therapy: {
    id: 'physical_therapy',
    label: 'Physical Therapy',
    description: 'Rehabilitation, sports medicine, and movement therapy',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.15,
      trustCredibility: 0.18,
      conversionFriction: 0.18,
      mobileOptimization: 0.15,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 3.5, good: 5.8, excellent: 8.5 },
    keyConversionActions: ['Free Assessment', 'Book Session', 'Insurance Check'],
    criticalTrustElements: ['success stories', 'therapist bios', 'specialization areas', 'insurance accepted'],
    commonPainPoints: ['chronic pain', 'limited mobility', 'surgery avoidance', 'slow recovery'],
    commonDesires: ['pain-free life', 'active again', 'avoid surgery', 'fast recovery'],
    specialties: ['Sports', 'Orthopedic', 'Neurological', 'Pediatric', 'Geriatric', 'Post-surgical'],
  },
  psychology: {
    id: 'psychology',
    label: 'Psychology / Mental Health',
    description: 'Therapy, counseling, and mental health services',
    industry: 'healthcare',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.08,
      copyEffectiveness: 0.18,
      trustCredibility: 0.22,
      conversionFriction: 0.15,
      mobileOptimization: 0.12,
      ctaOptimization: 0.10,
      compliancePrivacy: 0.15,
    },
    benchmarks: { average: 2.1, good: 3.8, excellent: 6.0 },
    keyConversionActions: ['Schedule Session', 'Contact Confidentially', 'Take Assessment'],
    criticalTrustElements: ['therapist bios', 'confidentiality assurance', 'approach descriptions', 'insurance/sliding scale'],
    commonPainPoints: ['anxiety', 'depression', 'relationship struggles', 'trauma', 'stress'],
    commonDesires: ['feel like myself', 'someone who understands', 'confidential care', 'practical tools'],
    specialties: ['CBT', 'Couples Therapy', 'Child Psychology', 'Trauma/PTSD', 'Addiction', 'Anxiety/Depression'],
  },
  general_medical: {
    id: 'general_medical',
    label: 'General Medical Practice',
    description: 'Family medicine, internal medicine, urgent care',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.12,
      trustCredibility: 0.20,
      conversionFriction: 0.22,
      mobileOptimization: 0.16,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 2.5, good: 4.2, excellent: 7.0 },
    keyConversionActions: ['Book Appointment', 'Patient Portal', 'Call Office'],
    criticalTrustElements: ['doctor credentials', 'insurance list', 'hours of operation', 'patient reviews'],
    commonPainPoints: ['long wait times', 'hard to get appointments', 'impersonal care', 'cost uncertainty'],
    commonDesires: ['quick access', 'personal attention', 'transparent pricing', 'comprehensive care'],
    specialties: ['Family Medicine', 'Internal Medicine', 'Urgent Care', 'Preventive', 'Geriatric'],
  },
  specialized_medical: {
    id: 'specialized_medical',
    label: 'Specialized Medical',
    description: 'Cardiology, orthopedics, ENT, and other specialties',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.13,
      trustCredibility: 0.25,
      conversionFriction: 0.17,
      mobileOptimization: 0.13,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 2.3, good: 4.0, excellent: 6.5 },
    keyConversionActions: ['Request Referral', 'Book Consultation', 'Second Opinion'],
    criticalTrustElements: ['board certifications', 'research publications', 'hospital affiliations', 'case studies'],
    commonPainPoints: ['finding the right specialist', 'referral process', 'wait times', 'understanding diagnosis'],
    commonDesires: ['expert opinion', 'clear diagnosis', 'treatment options', 'second opinions'],
    specialties: ['Cardiology', 'Orthopedics', 'ENT', 'Urology', 'Gastroenterology', 'Neurology'],
  },
  alternative_medicine: {
    id: 'alternative_medicine',
    label: 'Alternative Medicine',
    description: 'Acupuncture, chiropractic, naturopathy, homeopathy',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.18,
      trustCredibility: 0.22,
      conversionFriction: 0.15,
      mobileOptimization: 0.13,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 3.0, good: 5.0, excellent: 7.5 },
    keyConversionActions: ['Book First Visit', 'Free Consultation', 'Learn More'],
    criticalTrustElements: ['practitioner credentials', 'testimonials', 'approach explanation', 'research backing'],
    commonPainPoints: ['skepticism', 'chronic issues not resolved by conventional medicine', 'medication side effects'],
    commonDesires: ['natural healing', 'holistic approach', 'fewer medications', 'root cause treatment'],
    specialties: ['Acupuncture', 'Chiropractic', 'Naturopathy', 'Homeopathy', 'Ayurveda', 'Traditional Chinese Medicine'],
  },
  nutrition: {
    id: 'nutrition',
    label: 'Nutrition / Dietetics',
    description: 'Nutritionists, dietitians, weight management',
    industry: 'healthcare',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.18,
      trustCredibility: 0.17,
      conversionFriction: 0.17,
      mobileOptimization: 0.14,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 3.3, good: 5.5, excellent: 8.0 },
    keyConversionActions: ['Free Assessment', 'Book Consultation', 'Download Meal Plan'],
    criticalTrustElements: ['success stories with photos', 'credentials', 'approach explanation', 'meal plan samples'],
    commonPainPoints: ['weight struggles', 'diet confusion', 'health conditions', 'emotional eating'],
    commonDesires: ['sustainable results', 'personalized plan', 'feel energized', 'no fad diets'],
    specialties: ['Weight Management', 'Sports Nutrition', 'Clinical', 'Pediatric', 'Eating Disorders', 'Plant-based'],
  },
  ophthalmology: {
    id: 'ophthalmology',
    label: 'Ophthalmology / Optometry',
    description: 'Eye care, LASIK, vision correction',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.12,
      trustCredibility: 0.22,
      conversionFriction: 0.18,
      mobileOptimization: 0.14,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 2.6, good: 4.3, excellent: 7.0 },
    keyConversionActions: ['Book Eye Exam', 'LASIK Consultation', 'Insurance Check'],
    criticalTrustElements: ['technology showcase', 'surgeon credentials', 'success rates', 'patient testimonials'],
    commonPainPoints: ['vision deterioration', 'glasses dependence', 'fear of eye surgery', 'cost of procedures'],
    commonDesires: ['clear vision', 'freedom from glasses', 'latest technology', 'safe procedures'],
    specialties: ['General Eye Care', 'LASIK', 'Cataract', 'Retina', 'Pediatric', 'Glaucoma'],
  },
  dermatology: {
    id: 'dermatology',
    label: 'Dermatology',
    description: 'Skin care, conditions, cosmetic dermatology',
    industry: 'healthcare',
    customerTerm: 'patient',
    customerTermPlural: 'patients',
    scoringWeights: {
      visualHierarchy: 0.14,
      copyEffectiveness: 0.12,
      trustCredibility: 0.20,
      conversionFriction: 0.17,
      mobileOptimization: 0.14,
      ctaOptimization: 0.13,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 3.0, good: 4.8, excellent: 7.5 },
    keyConversionActions: ['Book Skin Check', 'View Treatments', 'Consultation'],
    criticalTrustElements: ['before/after photos', 'board certification', 'condition expertise', 'technology used'],
    commonPainPoints: ['skin conditions', 'acne', 'aging concerns', 'skin cancer worry'],
    commonDesires: ['clear skin', 'youthful appearance', 'expert diagnosis', 'effective treatment'],
    specialties: ['Medical', 'Cosmetic', 'Surgical', 'Pediatric', 'Mohs Surgery', 'Laser'],
  },
  medical_spa: {
    id: 'medical_spa',
    label: 'Medical Spa',
    description: 'Med spa services combining medical and spa treatments',
    industry: 'healthcare',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.16,
      copyEffectiveness: 0.13,
      trustCredibility: 0.18,
      conversionFriction: 0.16,
      mobileOptimization: 0.14,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.09,
    },
    benchmarks: { average: 3.5, good: 5.5, excellent: 8.5 },
    keyConversionActions: ['Book Treatment', 'View Specials', 'Gift Cards'],
    criticalTrustElements: ['treatment galleries', 'medical director credentials', 'luxury atmosphere', 'product lines'],
    commonPainPoints: ['aging', 'self-confidence', 'treatment intimidation', 'cost justification'],
    commonDesires: ['relaxation + results', 'luxury experience', 'visible improvement', 'memberships/packages'],
    specialties: ['Injectables', 'Laser', 'Body', 'Skin', 'Wellness', 'IV Therapy'],
  },

  // =======================================================================
  // E-COMMERCE
  // =======================================================================
  ecommerce_general: {
    id: 'ecommerce_general',
    label: 'E-Commerce (General)',
    description: 'Online retail stores, marketplaces, DTC brands',
    industry: 'ecommerce',
    customerTerm: 'customer',
    customerTermPlural: 'customers',
    scoringWeights: {
      visualHierarchy: 0.15,
      copyEffectiveness: 0.12,
      trustCredibility: 0.18,
      conversionFriction: 0.22,
      mobileOptimization: 0.15,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 2.5, good: 4.0, excellent: 6.5 },
    keyConversionActions: ['Add to Cart', 'Buy Now', 'Shop Sale'],
    criticalTrustElements: ['customer reviews', 'secure checkout badges', 'return policy', 'shipping info'],
    commonPainPoints: ['product quality concerns', 'shipping costs', 'return hassles', 'sizing uncertainty'],
    commonDesires: ['fast shipping', 'quality products', 'easy returns', 'great deals'],
    specialties: ['General Retail', 'DTC', 'Marketplace', 'Dropshipping', 'Subscription Box'],
  },
  ecommerce_fashion: {
    id: 'ecommerce_fashion',
    label: 'Fashion & Apparel',
    description: 'Clothing, accessories, footwear online stores',
    industry: 'ecommerce',
    customerTerm: 'shopper',
    customerTermPlural: 'shoppers',
    scoringWeights: {
      visualHierarchy: 0.18,
      copyEffectiveness: 0.10,
      trustCredibility: 0.15,
      conversionFriction: 0.22,
      mobileOptimization: 0.17,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 1.8, good: 3.2, excellent: 5.5 },
    keyConversionActions: ['Add to Cart', 'Shop Collection', 'View Lookbook'],
    criticalTrustElements: ['size guide', 'customer photos', 'return policy', 'product reviews'],
    commonPainPoints: ['sizing issues', 'quality uncertainty', 'slow shipping', 'no try-on option'],
    commonDesires: ['trendy styles', 'perfect fit', 'fast delivery', 'exclusive collections'],
    specialties: ['Women\'s', 'Men\'s', 'Luxury', 'Streetwear', 'Activewear', 'Accessories'],
  },
  ecommerce_electronics: {
    id: 'ecommerce_electronics',
    label: 'Electronics & Tech',
    description: 'Consumer electronics, gadgets, tech accessories',
    industry: 'ecommerce',
    customerTerm: 'buyer',
    customerTermPlural: 'buyers',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.15,
      trustCredibility: 0.20,
      conversionFriction: 0.20,
      mobileOptimization: 0.15,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 2.0, good: 3.5, excellent: 5.8 },
    keyConversionActions: ['Add to Cart', 'Compare Models', 'Buy Now'],
    criticalTrustElements: ['spec sheets', 'expert reviews', 'warranty info', 'comparison tools'],
    commonPainPoints: ['spec confusion', 'price sensitivity', 'compatibility fears', 'tech support worries'],
    commonDesires: ['best value', 'latest tech', 'reliable performance', 'good warranty'],
    specialties: ['Smartphones', 'Laptops', 'Audio', 'Smart Home', 'Gaming', 'Accessories'],
  },

  // =======================================================================
  // SaaS / TECHNOLOGY
  // =======================================================================
  saas_b2b: {
    id: 'saas_b2b',
    label: 'SaaS B2B',
    description: 'Business software, enterprise tools, platforms',
    industry: 'saas',
    customerTerm: 'user',
    customerTermPlural: 'users',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.18,
      trustCredibility: 0.22,
      conversionFriction: 0.18,
      mobileOptimization: 0.10,
      ctaOptimization: 0.16,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 3.0, good: 5.5, excellent: 8.5 },
    keyConversionActions: ['Start Free Trial', 'Book Demo', 'Get Started'],
    criticalTrustElements: ['client logos', 'case studies', 'G2/Capterra reviews', 'security certifications'],
    commonPainPoints: ['tool sprawl', 'high costs', 'steep learning curve', 'poor integrations'],
    commonDesires: ['save time', 'increase revenue', 'easy adoption', 'reliable support'],
    specialties: ['CRM', 'Project Management', 'Marketing', 'Analytics', 'HR/Recruiting', 'Finance'],
  },
  saas_b2c: {
    id: 'saas_b2c',
    label: 'SaaS B2C / Apps',
    description: 'Consumer apps, productivity tools, subscription services',
    industry: 'saas',
    customerTerm: 'user',
    customerTermPlural: 'users',
    scoringWeights: {
      visualHierarchy: 0.14,
      copyEffectiveness: 0.15,
      trustCredibility: 0.15,
      conversionFriction: 0.22,
      mobileOptimization: 0.16,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.04,
    },
    benchmarks: { average: 3.5, good: 6.0, excellent: 10.0 },
    keyConversionActions: ['Sign Up Free', 'Download App', 'Start Trial'],
    criticalTrustElements: ['app store ratings', 'user count', 'press mentions', 'user testimonials'],
    commonPainPoints: ['too many options', 'privacy concerns', 'subscription fatigue', 'complexity'],
    commonDesires: ['simple solution', 'free tier', 'instant results', 'privacy-first'],
    specialties: ['Productivity', 'Photo/Video', 'Finance', 'Health', 'Social', 'Utilities'],
  },

  // =======================================================================
  // PROFESSIONAL SERVICES
  // =======================================================================
  legal: {
    id: 'legal',
    label: 'Legal Services',
    description: 'Law firms, attorneys, legal aid',
    industry: 'professional_services',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.08,
      copyEffectiveness: 0.15,
      trustCredibility: 0.28,
      conversionFriction: 0.18,
      mobileOptimization: 0.12,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.07,
    },
    benchmarks: { average: 2.0, good: 4.0, excellent: 6.5 },
    keyConversionActions: ['Free Consultation', 'Call Now', 'Case Evaluation'],
    criticalTrustElements: ['attorney bios', 'case results', 'bar admissions', 'client testimonials'],
    commonPainPoints: ['legal complexity', 'high costs', 'fear of process', 'finding the right lawyer'],
    commonDesires: ['clear guidance', 'affordable rates', 'winning track record', 'responsive communication'],
    specialties: ['Personal Injury', 'Family Law', 'Criminal Defense', 'Business Law', 'Immigration', 'Estate Planning'],
  },
  accounting: {
    id: 'accounting',
    label: 'Accounting & Tax',
    description: 'CPAs, bookkeeping, tax preparation, financial advisory',
    industry: 'professional_services',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.08,
      copyEffectiveness: 0.14,
      trustCredibility: 0.26,
      conversionFriction: 0.18,
      mobileOptimization: 0.12,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 2.2, good: 4.0, excellent: 6.0 },
    keyConversionActions: ['Free Consultation', 'Get Quote', 'Schedule Call'],
    criticalTrustElements: ['CPA credentials', 'years experience', 'client count', 'industry expertise'],
    commonPainPoints: ['tax complexity', 'fear of audit', 'disorganized finances', 'missed deductions'],
    commonDesires: ['save money', 'peace of mind', 'timely filing', 'expert guidance'],
    specialties: ['Tax Prep', 'Bookkeeping', 'Business Tax', 'Personal Tax', 'Advisory', 'Payroll'],
  },
  consulting: {
    id: 'consulting',
    label: 'Consulting',
    description: 'Management, strategy, IT, and business consulting',
    industry: 'professional_services',
    customerTerm: 'client',
    customerTermPlural: 'clients',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.18,
      trustCredibility: 0.25,
      conversionFriction: 0.15,
      mobileOptimization: 0.10,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 2.5, good: 4.5, excellent: 7.0 },
    keyConversionActions: ['Book Discovery Call', 'Download Guide', 'Get Proposal'],
    criticalTrustElements: ['case studies', 'client logos', 'team credentials', 'methodology'],
    commonPainPoints: ['unclear ROI', 'generic advice', 'implementation gaps', 'high fees'],
    commonDesires: ['measurable results', 'industry expertise', 'actionable roadmap', 'ongoing support'],
    specialties: ['Strategy', 'Operations', 'IT/Digital', 'HR', 'Marketing', 'Financial'],
  },

  // =======================================================================
  // REAL ESTATE
  // =======================================================================
  real_estate_residential: {
    id: 'real_estate_residential',
    label: 'Residential Real Estate',
    description: 'Real estate agents, brokerages, home buying/selling',
    industry: 'real_estate',
    customerTerm: 'buyer',
    customerTermPlural: 'buyers',
    scoringWeights: {
      visualHierarchy: 0.15,
      copyEffectiveness: 0.12,
      trustCredibility: 0.20,
      conversionFriction: 0.18,
      mobileOptimization: 0.15,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 2.0, good: 3.8, excellent: 6.0 },
    keyConversionActions: ['Schedule Viewing', 'Get Market Report', 'Request Valuation'],
    criticalTrustElements: ['transaction volume', 'client testimonials', 'market knowledge', 'license info'],
    commonPainPoints: ['market confusion', 'bidding wars', 'hidden costs', 'finding the right agent'],
    commonDesires: ['dream home', 'best price', 'smooth process', 'local expertise'],
    specialties: ['Buying', 'Selling', 'First-time Buyers', 'Luxury', 'Investment', 'Relocation'],
  },
  real_estate_commercial: {
    id: 'real_estate_commercial',
    label: 'Commercial Real Estate',
    description: 'Office, retail, industrial space leasing and sales',
    industry: 'real_estate',
    customerTerm: 'tenant',
    customerTermPlural: 'tenants',
    scoringWeights: {
      visualHierarchy: 0.10,
      copyEffectiveness: 0.15,
      trustCredibility: 0.25,
      conversionFriction: 0.18,
      mobileOptimization: 0.10,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.08,
    },
    benchmarks: { average: 1.5, good: 3.0, excellent: 5.0 },
    keyConversionActions: ['Request Info', 'Schedule Tour', 'Download Brochure'],
    criticalTrustElements: ['portfolio size', 'tenant roster', 'market reports', 'development track record'],
    commonPainPoints: ['lease complexity', 'location scouting', 'hidden fees', 'negotiation stress'],
    commonDesires: ['prime location', 'flexible terms', 'turnkey space', 'growth potential'],
    specialties: ['Office', 'Retail', 'Industrial', 'Mixed-use', 'Land', 'Investment'],
  },

  // =======================================================================
  // EDUCATION
  // =======================================================================
  education_online: {
    id: 'education_online',
    label: 'Online Education',
    description: 'Online courses, e-learning platforms, coaching programs',
    industry: 'education',
    customerTerm: 'student',
    customerTermPlural: 'students',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.18,
      trustCredibility: 0.18,
      conversionFriction: 0.18,
      mobileOptimization: 0.14,
      ctaOptimization: 0.15,
      compliancePrivacy: 0.05,
    },
    benchmarks: { average: 3.0, good: 5.0, excellent: 8.0 },
    keyConversionActions: ['Enroll Now', 'Start Free', 'Watch Preview'],
    criticalTrustElements: ['instructor credentials', 'student testimonials', 'completion rates', 'curriculum preview'],
    commonPainPoints: ['overwhelm', 'self-paced accountability', 'quality concerns', 'too many options'],
    commonDesires: ['career advancement', 'practical skills', 'flexible schedule', 'certification'],
    specialties: ['Business', 'Tech/Coding', 'Design', 'Marketing', 'Languages', 'Personal Development'],
  },
  education_institution: {
    id: 'education_institution',
    label: 'Schools & Universities',
    description: 'K-12, higher education, trade schools',
    industry: 'education',
    customerTerm: 'student',
    customerTermPlural: 'students',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.14,
      trustCredibility: 0.22,
      conversionFriction: 0.16,
      mobileOptimization: 0.14,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.10,
    },
    benchmarks: { average: 2.5, good: 4.5, excellent: 7.0 },
    keyConversionActions: ['Apply Now', 'Request Info', 'Schedule Visit'],
    criticalTrustElements: ['accreditation', 'alumni success', 'faculty profiles', 'campus facilities'],
    commonPainPoints: ['tuition costs', 'program fit', 'campus safety', 'post-graduation outcomes'],
    commonDesires: ['quality education', 'career readiness', 'financial aid', 'campus community'],
    specialties: ['K-12', 'Undergraduate', 'Graduate', 'Trade School', 'Online Programs', 'Continuing Ed'],
  },

  // =======================================================================
  // HOME SERVICES
  // =======================================================================
  home_services_general: {
    id: 'home_services_general',
    label: 'Home Services',
    description: 'Plumbing, electrical, HVAC, cleaning, pest control',
    industry: 'home_services',
    customerTerm: 'homeowner',
    customerTermPlural: 'homeowners',
    scoringWeights: {
      visualHierarchy: 0.08,
      copyEffectiveness: 0.12,
      trustCredibility: 0.22,
      conversionFriction: 0.25,
      mobileOptimization: 0.15,
      ctaOptimization: 0.12,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 3.5, good: 5.5, excellent: 8.0 },
    keyConversionActions: ['Get Free Estimate', 'Call Now', 'Book Service'],
    criticalTrustElements: ['license/insurance', 'customer reviews', 'before/after photos', 'service guarantees'],
    commonPainPoints: ['unreliable contractors', 'unclear pricing', 'emergency situations', 'poor workmanship'],
    commonDesires: ['fast response', 'fair pricing', 'quality work', 'licensed and insured'],
    specialties: ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Pest Control', 'Landscaping'],
  },
  home_services_contractors: {
    id: 'home_services_contractors',
    label: 'Contractors & Remodeling',
    description: 'General contractors, remodeling, roofing, construction',
    industry: 'home_services',
    customerTerm: 'homeowner',
    customerTermPlural: 'homeowners',
    scoringWeights: {
      visualHierarchy: 0.12,
      copyEffectiveness: 0.12,
      trustCredibility: 0.25,
      conversionFriction: 0.18,
      mobileOptimization: 0.13,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 2.5, good: 4.5, excellent: 7.0 },
    keyConversionActions: ['Free Estimate', 'View Portfolio', 'Schedule Consultation'],
    criticalTrustElements: ['project portfolio', 'customer reviews', 'license info', 'warranty details'],
    commonPainPoints: ['budget overruns', 'project delays', 'communication gaps', 'quality concerns'],
    commonDesires: ['on time and budget', 'transparent pricing', 'quality craftsmanship', 'design vision'],
    specialties: ['Kitchen', 'Bathroom', 'Roofing', 'Addition', 'General', 'Commercial'],
  },

  // =======================================================================
  // FITNESS & WELLNESS
  // =======================================================================
  gym_fitness: {
    id: 'gym_fitness',
    label: 'Gym / Fitness Center',
    description: 'Gyms, CrossFit, personal training, group fitness',
    industry: 'fitness_wellness',
    customerTerm: 'member',
    customerTermPlural: 'members',
    scoringWeights: {
      visualHierarchy: 0.14,
      copyEffectiveness: 0.14,
      trustCredibility: 0.16,
      conversionFriction: 0.20,
      mobileOptimization: 0.16,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 3.0, good: 5.0, excellent: 8.0 },
    keyConversionActions: ['Free Trial', 'Join Now', 'Book Class'],
    criticalTrustElements: ['transformation photos', 'trainer credentials', 'member testimonials', 'facility tour'],
    commonPainPoints: ['intimidation', 'cost vs value', 'crowded facilities', 'lack of results'],
    commonDesires: ['get fit', 'supportive community', 'flexible schedule', 'expert guidance'],
    specialties: ['General Fitness', 'CrossFit', 'Personal Training', 'Group Classes', 'Boxing/MMA', 'Swimming'],
  },
  yoga_pilates: {
    id: 'yoga_pilates',
    label: 'Yoga / Pilates / Mind-Body',
    description: 'Yoga studios, Pilates, meditation, mindfulness',
    industry: 'fitness_wellness',
    customerTerm: 'practitioner',
    customerTermPlural: 'practitioners',
    scoringWeights: {
      visualHierarchy: 0.14,
      copyEffectiveness: 0.16,
      trustCredibility: 0.16,
      conversionFriction: 0.18,
      mobileOptimization: 0.16,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.06,
    },
    benchmarks: { average: 3.5, good: 5.5, excellent: 8.5 },
    keyConversionActions: ['Book First Class', 'View Schedule', 'Free Intro Session'],
    criticalTrustElements: ['instructor bios', 'class descriptions', 'studio atmosphere', 'student testimonials'],
    commonPainPoints: ['beginner anxiety', 'flexibility concerns', 'schedule conflicts', 'pricing confusion'],
    commonDesires: ['stress relief', 'flexibility', 'community', 'holistic wellness'],
    specialties: ['Vinyasa', 'Hot Yoga', 'Restorative', 'Pilates Mat', 'Pilates Reformer', 'Meditation'],
  },

  // =======================================================================
  // HOSPITALITY
  // =======================================================================
  hotel_resort: {
    id: 'hotel_resort',
    label: 'Hotels & Resorts',
    description: 'Hotels, resorts, vacation rentals, B&Bs',
    industry: 'hospitality',
    customerTerm: 'guest',
    customerTermPlural: 'guests',
    scoringWeights: {
      visualHierarchy: 0.18,
      copyEffectiveness: 0.12,
      trustCredibility: 0.16,
      conversionFriction: 0.20,
      mobileOptimization: 0.16,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.04,
    },
    benchmarks: { average: 2.2, good: 4.0, excellent: 6.5 },
    keyConversionActions: ['Book Now', 'Check Availability', 'View Rooms'],
    criticalTrustElements: ['photo gallery', 'guest reviews', 'star rating', 'amenities list'],
    commonPainPoints: ['hidden fees', 'misleading photos', 'bad location', 'poor service'],
    commonDesires: ['relaxation', 'great location', 'value for money', 'memorable experience'],
    specialties: ['Luxury', 'Business', 'Boutique', 'Resort', 'B&B', 'Vacation Rental'],
  },
  restaurant: {
    id: 'restaurant',
    label: 'Restaurants & Food',
    description: 'Restaurants, cafes, catering, food delivery',
    industry: 'hospitality',
    customerTerm: 'diner',
    customerTermPlural: 'diners',
    scoringWeights: {
      visualHierarchy: 0.16,
      copyEffectiveness: 0.10,
      trustCredibility: 0.16,
      conversionFriction: 0.22,
      mobileOptimization: 0.18,
      ctaOptimization: 0.14,
      compliancePrivacy: 0.04,
    },
    benchmarks: { average: 3.0, good: 5.0, excellent: 8.0 },
    keyConversionActions: ['Reserve Table', 'Order Online', 'View Menu'],
    criticalTrustElements: ['food photos', 'customer reviews', 'chef bio', 'awards/recognition'],
    commonPainPoints: ['long wait times', 'limited menu info', 'reservation difficulty', 'inconsistent quality'],
    commonDesires: ['great food', 'easy reservations', 'ambiance', 'special experiences'],
    specialties: ['Fine Dining', 'Casual', 'Fast Casual', 'Catering', 'Food Truck', 'Delivery'],
  },
};

// ---------------------------------------------------------------------------
// Backward-compatible alias
// ---------------------------------------------------------------------------

/** @deprecated Use INDUSTRY_VERTICALS instead */
export const HEALTHCARE_VERTICALS = INDUSTRY_VERTICALS;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const VERTICAL_OPTIONS = Object.values(INDUSTRY_VERTICALS).map((v) => ({
  value: v.id,
  label: v.label,
  description: v.description,
  industry: v.industry,
}));

/**
 * Returns vertical options grouped by industry category.
 */
export function getVerticalOptionsByIndustry(): { industry: IndustryCategory; label: string; verticals: typeof VERTICAL_OPTIONS }[] {
  const grouped = new Map<IndustryCategory, typeof VERTICAL_OPTIONS>();

  for (const opt of VERTICAL_OPTIONS) {
    const list = grouped.get(opt.industry) || [];
    list.push(opt);
    grouped.set(opt.industry, list);
  }

  return Array.from(grouped.entries()).map(([industry, verticals]) => ({
    industry,
    label: INDUSTRY_CATEGORY_LABELS[industry],
    verticals,
  }));
}

export function getVerticalConfig(id: VerticalId): VerticalConfig {
  const config = INDUSTRY_VERTICALS[id];
  if (!config) {
    throw new Error(`[CONFIG_ERROR] Unknown vertical: "${id}". Valid options: ${Object.keys(INDUSTRY_VERTICALS).join(', ')}`);
  }
  return config;
}

/**
 * Returns the customer term for a given vertical (e.g. "patient", "customer", "client").
 */
export function getCustomerTerm(id: VerticalId, plural = false): string {
  const config = INDUSTRY_VERTICALS[id];
  if (!config) return plural ? 'customers' : 'customer';
  return plural ? config.customerTermPlural : config.customerTerm;
}

/**
 * Returns whether a vertical belongs to the healthcare industry.
 */
export function isHealthcareVertical(id: VerticalId): boolean {
  return INDUSTRY_VERTICALS[id]?.industry === 'healthcare';
}
