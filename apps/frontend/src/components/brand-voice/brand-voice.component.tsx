'use client';

import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '@gitroom/react/form/input';
import { Textarea } from '@gitroom/react/form/textarea';
import { Select } from '@gitroom/react/form/select';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const toArray = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export const BrandVoiceComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();

  const load = useCallback(async () => {
    return (await fetch('/brand-voice')).json();
  }, []);
  const { data, mutate } = useSWR('brand-voice', load);

  const form = useForm({
    values: {
      tone: data?.tone || '',
      audience: data?.audience || '',
      offers: data?.offers || '',
      emojiPolicy: data?.emojiPolicy || 'minimal',
      bannedPhrasesText: (data?.bannedPhrases || []).join(', '),
      preferredCtasText: (data?.preferredCtas || []).join(', '),
      pillarsText: (data?.pillars || []).join(', '),
      extraNotes: data?.extraNotes || '',
    },
  });

  const save = useCallback(async (values: any) => {
    await fetch('/brand-voice', {
      method: 'POST',
      body: JSON.stringify({
        tone: values.tone || undefined,
        audience: values.audience || undefined,
        offers: values.offers || undefined,
        emojiPolicy: values.emojiPolicy || 'minimal',
        bannedPhrases: toArray(values.bannedPhrasesText),
        preferredCtas: toArray(values.preferredCtasText),
        pillars: toArray(values.pillarsText),
        extraNotes: values.extraNotes || undefined,
      }),
    });
    toaster.show(
      t('brand_voice_saved', 'Brand voice saved — your AI now writes in your voice'),
      'success'
    );
    mutate();
  }, []);

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('brand_voice_kit', 'Brand Voice Kit')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'brand_voice_kit_desc',
          'Teach Salestrig Studio how you sound. Every AI draft will follow this profile so your content stays authentically on-brand.'
        )}
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(save)}>
          <div className="my-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[20px]">
            <Input
              name="tone"
              label={t('tone_of_voice', 'Tone of voice')}
              placeholder="warm, confident, encouraging"
            />
            <Textarea
              name="audience"
              label={t('target_audience', 'Who you create for')}
              placeholder="e.g. women founders building service businesses"
            />
            <Textarea
              name="offers"
              label={t('offers', 'Your offers / products')}
              placeholder="What you sell, so the AI can reference it naturally"
            />
            <Select name="emojiPolicy" label={t('emoji_policy', 'Emoji style')}>
              <option value="none">{t('emoji_none', 'No emojis')}</option>
              <option value="minimal">{t('emoji_minimal', 'Sparingly')}</option>
              <option value="expressive">{t('emoji_expressive', 'Expressive')}</option>
            </Select>
            <Input
              name="pillarsText"
              label={t('content_pillars', 'Content pillars (comma separated)')}
              placeholder="Education, Story, Offer, Community"
            />
            <Input
              name="preferredCtasText"
              label={t('preferred_ctas', 'Preferred calls-to-action (comma separated)')}
              placeholder="DM me GROW, Comment below, Link in bio"
            />
            <Input
              name="bannedPhrasesText"
              label={t('banned_phrases', 'Words & phrases to avoid (comma separated)')}
              placeholder="hustle, guru, crushing it"
            />
            <Textarea
              name="extraNotes"
              label={t('extra_notes', 'Anything else the AI should honor')}
              placeholder="e.g. always write in first person; never give medical advice"
            />
            <div>
              <Button type="submit">{t('save_brand_voice', 'Save brand voice')}</Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
