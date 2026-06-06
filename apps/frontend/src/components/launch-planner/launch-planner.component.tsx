'use client';

import React, { FC, useCallback, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const PHASE_COLORS: Record<string, string> = {
  teaser: '#6E4488',
  value: '#1FB6A0',
  objection: '#C9A36B',
  'social-proof': '#835AA0',
  urgency: '#F2785C',
  'final-call': '#E1306C',
};

export const LaunchPlannerComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();
  const [offer, setOffer] = useState('');
  const [audience, setAudience] = useState('');
  const [duration, setDuration] = useState(14);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[] | null>(null);

  const run = useCallback(async () => {
    if (offer.trim().length < 5) {
      toaster.show(t('launch_offer_min', 'Describe your offer first.'), 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await (
        await fetch('/launch-planner', {
          method: 'POST',
          body: JSON.stringify({
            offer,
            audience: audience || undefined,
            durationDays: duration,
          }),
        })
      ).json();
      setPosts(
        ((res?.posts || []) as any[])
          .slice()
          .sort((a: any, b: any) => a.day - b.day)
      );
    } catch (e) {
      toaster.show(t('launch_failed', 'Could not plan — try again.'), 'warning');
    }
    setLoading(false);
  }, [offer, audience, duration]);

  const copy = (text: string) => () => {
    navigator.clipboard?.writeText(text);
    toaster.show(t('copied', 'Copied'), 'success');
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('launch_planner', 'Launch Campaign Planner')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'launch_planner_desc',
          'Describe your offer and get a complete, phased launch sequence — teasers, value, objection-handling, social proof, urgency, and the final call.'
        )}
      </div>

      <div className="my-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]">
        <textarea
          className="w-full min-h-[100px] bg-input rounded-[4px] p-[12px] outline-none"
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder={t(
            'launch_offer_ph',
            'What are you launching? (e.g. a $97 12-week group coaching program for new coaches)'
          )}
        />
        <input
          className="w-full bg-input rounded-[4px] p-[12px] outline-none"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder={t('launch_audience_ph', 'Audience (optional)')}
        />
        <div className="flex items-center gap-[10px]">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-[16px] py-[8px] rounded-[6px] border-fifth border ${
                duration === d ? 'bg-forth text-white' : ''
              }`}
            >
              {d} {t('days', 'days')}
            </button>
          ))}
        </div>
        <div>
          <Button onClick={run} loading={loading}>
            {t('plan_launch', 'Plan my launch')}
          </Button>
        </div>
      </div>

      {posts ? (
        <div className="flex flex-col gap-[12px]">
          {posts.map((p: any, i: number) => (
            <div
              key={i}
              className="bg-sixth border-fifth border rounded-[4px] p-[16px] flex flex-col gap-[8px]"
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[13px] font-[600]">
                  {t('day', 'Day')} {p.day}
                </span>
                <span
                  className="text-[11px] px-[8px] py-[2px] rounded-full text-white"
                  style={{ background: PHASE_COLORS[p.phase] || '#6E4488' }}
                >
                  {p.phase}
                </span>
                <div className="ms-auto">
                  <Button onClick={copy(`${p.title}\n\n${p.content}`)}>
                    {t('copy', 'Copy')}
                  </Button>
                </div>
              </div>
              <div className="font-[600]">{p.title}</div>
              <div className="whitespace-pre-wrap text-[14px] text-customColor18">
                {p.content}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
