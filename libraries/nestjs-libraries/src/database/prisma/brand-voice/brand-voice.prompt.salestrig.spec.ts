import { brandVoiceSystemPrompt } from './brand-voice.prompt';

describe('Salestrig Studio brand voice prompt', () => {
  it('returns empty string for no/empty kit', () => {
    expect(brandVoiceSystemPrompt(null)).toBe('');
    expect(brandVoiceSystemPrompt(undefined)).toBe('');
    expect(brandVoiceSystemPrompt({})).toBe('');
    // emojiPolicy alone (a default) is not "meaningful content"
    expect(brandVoiceSystemPrompt({ emojiPolicy: 'minimal' })).toBe('');
  });

  it('builds instructions from the configured fields', () => {
    const out = brandVoiceSystemPrompt({
      tone: 'warm, confident',
      audience: 'women founders',
      pillars: ['Education', 'Story'],
      preferredCtas: ['DM me “GROW”'],
      bannedPhrases: ['hustle', 'guru'],
      emojiPolicy: 'expressive',
      offers: 'a $97 launch course',
      extraNotes: 'Always write in first person.',
    });
    expect(out).toContain('brand voice profile');
    expect(out).toContain('warm, confident');
    expect(out).toContain('women founders');
    expect(out).toContain('Education, Story');
    expect(out).toContain('DM me “GROW”');
    expect(out).toContain('hustle, guru');
    expect(out).toContain('expressively');
    expect(out).toContain('a $97 launch course');
    expect(out).toContain('first person');
  });

  it('respects the emoji policy', () => {
    expect(brandVoiceSystemPrompt({ tone: 'calm', emojiPolicy: 'none' })).toContain(
      'Do not use emojis'
    );
    expect(brandVoiceSystemPrompt({ tone: 'calm', emojiPolicy: 'minimal' })).toContain(
      'sparingly'
    );
  });
});
