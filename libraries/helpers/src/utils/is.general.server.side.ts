export const isGeneralServerSide = () => {
  return !!process.env.IS_GENERAL;
};

/**
 * Salestrig Studio brand identity — single source of truth.
 * Built on the open-source Postiz project (AGPL-3.0); see NOTICE for attribution.
 * Do NOT hard-code the product name elsewhere — import from here.
 */
export const BRAND_NAME = 'Salestrig Studio';
export const BRAND_SHORT_NAME = 'Salestrig';
export const BRAND_COMPANY = 'Salestrig';
export const BRAND_DOMAIN = 'salestrig.com';

/** User-facing product name for page titles, headings, and copy. */
export const brandName = () => BRAND_NAME;
