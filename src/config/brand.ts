/**
 * Brand Configuration
 * Centralizes all brand-related settings for easy customization.
 */

export interface BrandConfig {
  companyName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

const DEFAULT_BRAND: BrandConfig = {
  companyName: process.env.NEXT_PUBLIC_BRAND_NAME || 'CRO Tool Suite',
  tagline: 'Conversion Rate Optimization Platform',
  primaryColor: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || '#2563eb',
  secondaryColor: process.env.NEXT_PUBLIC_BRAND_SECONDARY_COLOR || '#1e40af',
  accentColor: '#3b82f6',
};

let currentBrand: BrandConfig = { ...DEFAULT_BRAND };

export function getBrand(): BrandConfig {
  return { ...currentBrand };
}

export function updateBrand(updates: Partial<BrandConfig>): BrandConfig {
  currentBrand = { ...currentBrand, ...updates };
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--brand-primary', currentBrand.primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', currentBrand.secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', currentBrand.accentColor);
  }
  return { ...currentBrand };
}
