/**
 * Healthcare Verticals Configuration
 * Defines all supported healthcare verticals with their specific scoring weights,
 * benchmarks, and conversion characteristics.
 */

export type VerticalId =
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
  | 'medical_spa';

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
  scoringWeights: ScoringWeights;
  benchmarks: ConversionBenchmarks;
  keyConversionActions: string[];
  criticalTrustElements: string[];
  commonPainPoints: string[];
  commonDesires: string[];
  specialties: string[];
}

export const HEALTHCARE_VERTICALS: Record<VerticalId, VerticalConfig> = {
  dental: {
    id: 'dental',
    label: 'Dental Clinic',
    description: 'General, cosmetic, and specialty dental practices',
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
};

export const VERTICAL_OPTIONS = Object.values(HEALTHCARE_VERTICALS).map((v) => ({
  value: v.id,
  label: v.label,
  description: v.description,
}));

export function getVerticalConfig(id: VerticalId): VerticalConfig {
  const config = HEALTHCARE_VERTICALS[id];
  if (!config) {
    throw new Error(`[CONFIG_ERROR] Unknown healthcare vertical: "${id}". Valid options: ${Object.keys(HEALTHCARE_VERTICALS).join(', ')}`);
  }
  return config;
}
