'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const OUTPUTS: { key: string; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn post' },
  { key: 'xThread', label: 'X / Twitter thread' },
  { key: 'instagram', label: 'Instagram caption' },
  { key: 'reelScript', label: 'Reel / short-video script' },
  { key: 'tiktokHooks', label: 'TikTok hook ideas' },
  { key: 'emailTeaser', label: 'Email teaser' },
  { key: 'storyPrompts', label: 'Instagram story prompts' },
];

export const RepurposeComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = useCallback(async () => {
    if (content.trim().length < 20) {
      toaster.show(
        t('repurpose_min', 'Paste at least a paragraph to repurpose.'),
        'warning'
      );
      return;
    }
    setLoading(true);
    try {
      const res = await (
        await fetch('/repurpose', {
          method: 'POST',
          body: JSON.stringify({ content }),
        })
      ).json();
      setResult(res);
    } catch (e) {
      toaster.show(t('repurpose_failed', 'Could not generate — try again.'), 'warning');
    }
    setLoading(false);
  }, [content]);

  const copy = (text: string) => () => {
    navigator.clipboard?.writeText(text);
    toaster.show(t('copied', 'Copied'), 'success');
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('repurposing_studio', 'Repurposing Studio')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'repurposing_studio_desc',
          'Paste a blog post, transcript, newsletter, or long caption — get platform-perfect versions in your brand voice.'
        )}
      </div>

      <div className="my-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]">
        <textarea
          className="w-full min-h-[160px] bg-input rounded-[4px] p-[12px] outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('repurpose_placeholder', 'Paste your long-form content here…')}
        />
        <div>
          <Button onClick={run} loading={loading}>
            {t('repurpose_generate', 'Repurpose with AI')}
          </Button>
        </div>
      </div>

      {result ? (
        <div className="grid gap-[16px] md:grid-cols-2">
          {OUTPUTS.map((o) => {
            const val = (result as any)[o.key];
            const text = Array.isArray(val) ? val.join('\n\n') : val || '';
            if (!text) return null;
            return (
              <div
                key={o.key}
                className="bg-sixth border-fifth border rounded-[4px] p-[16px] flex flex-col gap-[8px]"
              >
                <div className="flex items-center justify-between">
                  <div className="font-[600]">{o.label}</div>
                  <Button onClick={copy(text)}>{t('copy', 'Copy')}</Button>
                </div>
                <div className="whitespace-pre-wrap text-[14px] text-customColor18">
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
