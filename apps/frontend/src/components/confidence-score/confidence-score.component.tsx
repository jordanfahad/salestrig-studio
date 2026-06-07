'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const PLATFORMS = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'X', 'Threads'];
const SUBS: { key: string; label: string }[] = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'hook', label: 'Hook' },
  { key: 'cta', label: 'Call to action' },
  { key: 'platformFit', label: 'Platform fit' },
  { key: 'brandVoice', label: 'Brand voice' },
];
const scoreColor = (n: number) =>
  n >= 80 ? '#1FB6A0' : n >= 60 ? '#C9A36B' : '#F2785C';

export const ConfidenceScoreComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);

  const run = useCallback(async () => {
    if (content.trim().length < 5) {
      toaster.show(t('score_min', 'Paste a draft to score.'), 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await (
        await fetch('/content-score', {
          method: 'POST',
          body: JSON.stringify({ content, platform }),
        })
      ).json();
      setScore(res);
    } catch (e) {
      toaster.show(t('score_failed', 'Could not score — try again.'), 'warning');
    }
    setLoading(false);
  }, [content, platform]);

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('confidence_score', 'Content Confidence Score')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'confidence_score_desc',
          'Paste a draft and get an instant read on clarity, hook, CTA, platform fit, and brand-voice consistency — with fixes.'
        )}
      </div>

      <div className="my-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]">
        <textarea
          className="w-full min-h-[140px] bg-input rounded-[4px] p-[12px] outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('score_ph', 'Paste your post draft here…')}
        />
        <div className="flex items-center gap-[8px] flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-[12px] py-[6px] rounded-[6px] border-fifth border text-[13px] ${
                platform === p ? 'bg-forth text-white' : ''
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div>
          <Button onClick={run} loading={loading}>
            {t('score_btn', 'Score my post')}
          </Button>
        </div>
      </div>

      {score ? (
        <div className="bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]">
          <div className="flex items-center gap-[16px]">
            <div
              className="w-[84px] h-[84px] rounded-full flex items-center justify-center text-[26px] font-[700] text-white"
              style={{ background: scoreColor(score.overall) }}
            >
              {score.overall}
            </div>
            <div>
              <div className="text-[18px] font-[600]">
                {t('overall_score', 'Overall confidence')}
              </div>
              <div className="text-customColor18 text-[14px]">
                {score.overall >= 80
                  ? t('looks_strong', 'Looks strong — ship it.')
                  : score.overall >= 60
                    ? t('almost_there', 'Almost there — a few tweaks.')
                    : t('needs_work', 'Worth another pass.')}
              </div>
            </div>
          </div>
          <div className="grid gap-[10px]">
            {SUBS.map((s) => {
              const v = score[s.key] ?? 0;
              return (
                <div key={s.key}>
                  <div className="flex justify-between text-[13px]">
                    <span>{s.label}</span>
                    <span className="font-[600]">{v}</span>
                  </div>
                  <div className="mt-[4px] h-[8px] w-full rounded-full bg-input overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${v}%`, background: scoreColor(v) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {score.suggestions?.length ? (
            <div>
              <div className="font-[600] mb-[6px]">
                {t('suggestions', 'Suggestions')}
              </div>
              <ul className="flex flex-col gap-[6px] text-[14px] text-customColor18">
                {score.suggestions.map((s: string, i: number) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
