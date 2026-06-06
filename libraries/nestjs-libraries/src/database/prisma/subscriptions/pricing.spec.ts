import { pricing, planDisplay, planDisplayName } from './pricing';

describe('Salestrig Studio pricing & entitlements', () => {
  it('prices the four paid tiers correctly (monthly)', () => {
    expect(pricing.STANDARD.month_price).toBe(15); // Starter
    expect(pricing.TEAM.month_price).toBe(20); // Studio
    expect(pricing.PRO.month_price).toBe(25); // Growth
    expect(pricing.ULTIMATE.month_price).toBe(49); // Agency
  });

  it('annual billing is exactly two months free (monthly x 10)', () => {
    for (const k of ['STANDARD', 'TEAM', 'PRO', 'ULTIMATE'] as const) {
      expect(pricing[k].year_price).toBe(pricing[k].month_price * 10);
    }
    expect(pricing.STANDARD.year_price).toBe(150);
    expect(pricing.TEAM.year_price).toBe(200);
    expect(pricing.PRO.year_price).toBe(250);
    expect(pricing.ULTIMATE.year_price).toBe(490);
  });

  it('enforces channel limits per tier', () => {
    expect(pricing.STANDARD.channel).toBe(5);
    expect(pricing.TEAM.channel).toBe(10);
    expect(pricing.PRO.channel).toBe(30);
    expect(pricing.ULTIMATE.channel).toBe(100);
  });

  it('enforces AI image/video quotas per tier', () => {
    expect(pricing.STANDARD.generate_videos).toBe(3);
    expect(pricing.TEAM.generate_videos).toBe(10);
    expect(pricing.PRO.generate_videos).toBe(30);
    expect(pricing.ULTIMATE.generate_videos).toBe(60);
    expect(pricing.TEAM.image_generation_count).toBe(100);
    expect(pricing.PRO.image_generation_count).toBe(300);
    expect(pricing.ULTIMATE.image_generation_count).toBe(500);
  });

  it('gates team support: Starter none, Studio/Growth/Agency included', () => {
    expect(pricing.STANDARD.team_members).toBe(false);
    expect(pricing.TEAM.team_members).toBe(true);
    expect(pricing.PRO.team_members).toBe(true);
    expect(pricing.ULTIMATE.team_members).toBe(true);
  });

  it('gives Starter 400 posts/mo and higher tiers effectively unlimited', () => {
    expect(pricing.STANDARD.posts_per_month).toBe(400);
    expect(pricing.TEAM.posts_per_month).toBeGreaterThanOrEqual(1_000_000);
    expect(pricing.PRO.posts_per_month).toBeGreaterThanOrEqual(1_000_000);
    expect(pricing.ULTIMATE.posts_per_month).toBeGreaterThanOrEqual(1_000_000);
  });

  it('maps internal tier keys to Salestrig display names', () => {
    expect(planDisplayName('STANDARD')).toBe('Starter');
    expect(planDisplayName('TEAM')).toBe('Studio');
    expect(planDisplayName('PRO')).toBe('Growth');
    expect(planDisplayName('ULTIMATE')).toBe('Agency');
  });

  it('marks Growth as the recommended plan and defaults unknown tiers to Free', () => {
    expect(planDisplay.PRO.recommended).toBe(true);
    expect(planDisplayName(null)).toBe('Free');
    expect(planDisplayName(undefined)).toBe('Free');
    expect(planDisplayName('NONSENSE')).toBe('Free');
  });
});
