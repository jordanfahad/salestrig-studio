import type { BrandVoice } from '@prisma/client';

/**
 * Salestrig Studio — turn a Brand Voice Kit into a system-prompt fragment that
 * is prepended to AI generation so drafts sound authentically on-brand.
 * Returns '' when the kit has no meaningful content (so callers can skip it).
 */
export function brandVoiceSystemPrompt(
  bv?: Partial<BrandVoice> | null
): string {
  if (!bv) return '';
  const parts: string[] = [];

  if (bv.tone) parts.push(`Tone of voice: ${bv.tone}.`);
  if (bv.audience) parts.push(`Write for this audience: ${bv.audience}.`);
  if (bv.offers)
    parts.push(`Reference these offers/products when relevant: ${bv.offers}.`);
  if (bv.pillars?.length)
    parts.push(`Lean on these content pillars: ${bv.pillars.join(', ')}.`);
  if (bv.preferredCtas?.length)
    parts.push(
      `Prefer these calls-to-action: ${bv.preferredCtas.join(' | ')}.`
    );
  if (bv.bannedPhrases?.length)
    parts.push(
      `Never use these words or phrases: ${bv.bannedPhrases.join(', ')}.`
    );

  // Nothing meaningful configured → no brand-voice instruction at all.
  if (!parts.length) return '';

  const emoji = bv.emojiPolicy || 'minimal';
  parts.push(
    emoji === 'none'
      ? 'Do not use emojis.'
      : emoji === 'expressive'
        ? 'Use emojis expressively where they add warmth.'
        : 'Use emojis sparingly.'
  );

  if (bv.extraNotes) parts.push(bv.extraNotes);

  return [
    'Follow this brand voice profile strictly so the content sounds authentically on-brand:',
    ...parts.map((p) => `- ${p}`),
  ].join('\n');
}
