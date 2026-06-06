export interface PricingInnerInterface {
  current: string;
  month_price: number;
  year_price: number;
  channel?: number;
  posts_per_month: number;
  team_members: boolean;
  community_features: boolean;
  featured_by_gitroom: boolean;
  ai: boolean;
  import_from_channels: boolean;
  image_generator?: boolean;
  image_generation_count: number;
  generate_videos: number;
  public_api: boolean;
  webhooks: number;
  autoPost: boolean;
}
export interface PricingInterface {
  [key: string]: PricingInnerInterface;
}
// ─── Salestrig Studio plans ──────────────────────────────────────────────────
// IMPORTANT: the OBJECT KEYS (FREE/STANDARD/TEAM/PRO/ULTIMATE) are the internal
// Prisma `SubscriptionTier` enum values and MUST stay stable (used across billing,
// permissions, Stripe, and the public API). User-facing names live in `planDisplay`
// below. Entitlement VALUES here are the single source of truth enforced server-side.
//
//   STANDARD → "Starter"  $15/mo  $150/yr
//   TEAM     → "Studio"   $20/mo  $200/yr
//   PRO      → "Growth"   $25/mo  $250/yr   (recommended)
//   ULTIMATE → "Agency"   $49/mo  $490/yr
// Annual = ~2 months free. unlimited posts = 1_000_000.
export const pricing: PricingInterface = {
  FREE: {
    current: 'FREE',
    month_price: 0,
    year_price: 0,
    channel: 0,
    image_generation_count: 0,
    posts_per_month: 0,
    team_members: false,
    community_features: false,
    featured_by_gitroom: false,
    ai: false,
    import_from_channels: false,
    image_generator: false,
    public_api: false,
    webhooks: 0,
    autoPost: false,
    generate_videos: 0,
  },
  // Starter — $15/mo, $150/yr
  STANDARD: {
    current: 'STANDARD',
    month_price: 15,
    year_price: 150,
    channel: 5,
    posts_per_month: 400,
    image_generation_count: 20,
    team_members: false,
    ai: true,
    community_features: false,
    featured_by_gitroom: false,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 2,
    autoPost: true,
    generate_videos: 3,
  },
  // Studio — $20/mo, $200/yr
  TEAM: {
    current: 'TEAM',
    month_price: 20,
    year_price: 200,
    channel: 10,
    posts_per_month: 1000000,
    image_generation_count: 100,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10,
    autoPost: true,
    generate_videos: 10,
  },
  // Growth — $25/mo, $250/yr (recommended)
  PRO: {
    current: 'PRO',
    month_price: 25,
    year_price: 250,
    channel: 30,
    posts_per_month: 1000000,
    image_generation_count: 300,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 30,
    autoPost: true,
    generate_videos: 30,
  },
  // Agency — $49/mo, $490/yr
  ULTIMATE: {
    current: 'ULTIMATE',
    month_price: 49,
    year_price: 490,
    channel: 100,
    posts_per_month: 1000000,
    image_generation_count: 500,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10000,
    autoPost: true,
    generate_videos: 60,
  },
};

/**
 * User-facing plan presentation — maps internal tier keys to Salestrig plan names.
 * Single source of truth for display; do NOT hard-code plan names in components.
 */
export interface PlanDisplay {
  name: string;
  tagline: string;
  recommended?: boolean;
  bestFor?: string;
}
export const planDisplay: Record<string, PlanDisplay> = {
  FREE: { name: 'Free', tagline: 'Explore the workspace' },
  STANDARD: {
    name: 'Starter',
    tagline: 'For solo founders finding their rhythm',
  },
  TEAM: {
    name: 'Studio',
    tagline: 'For creators working with an assistant or small team',
  },
  PRO: {
    name: 'Growth',
    tagline: 'For serious creators and growing brands',
    recommended: true,
    bestFor: 'Recommended',
  },
  ULTIMATE: {
    name: 'Agency',
    tagline: 'For boutique agencies and multi-brand operators',
  },
};

/** Resolve the Salestrig display name for an internal tier key. */
export const planDisplayName = (tier?: string | null): string =>
  (tier && planDisplay[tier]?.name) || planDisplay.FREE.name;
