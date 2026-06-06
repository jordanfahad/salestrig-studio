'use client';

import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const STATUS_META: Record<string, { label: string; color: string }> = {
  IDEA: { label: 'Idea', color: '#835AA0' },
  DRAFT: { label: 'Draft', color: '#C9A36B' },
  NEEDS_REVIEW: { label: 'Needs Review', color: '#F2785C' },
  APPROVED: { label: 'Approved', color: '#1FB6A0' },
};

// Postiz stores Post.content as a JSON string (array of { content }).
const readable = (c: string): string => {
  try {
    const arr = JSON.parse(c);
    if (Array.isArray(arr)) {
      return arr
        .map((x: any) => x?.content || '')
        .filter(Boolean)
        .join('\n\n');
    }
  } catch {
    // not JSON — show as-is
  }
  return c || '';
};

export const ApprovalsComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();

  const load = useCallback(async () => (await fetch('/approvals')).json(), []);
  const { data, mutate } = useSWR('approvals', load);
  const posts: any[] = data || [];

  const setStatus =
    (postId: string, approvalStatus: string, msg: string) => async () => {
      await fetch(`/approvals/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus }),
      });
      toaster.show(msg, 'success');
      mutate();
    };

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('approvals', 'Approvals')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'approvals_desc',
          'Your review queue. Your assistant drafts; you approve. Posts move from Idea → Draft → Needs Review → Approved.'
        )}
      </div>

      <div className="my-[16px] flex flex-col gap-[12px]">
        {posts.length === 0 ? (
          <div className="bg-sixth border-fifth border rounded-[4px] p-[24px] text-customColor18">
            {t('approvals_empty', 'Nothing waiting for review — you are all caught up. 🎉')}
          </div>
        ) : (
          posts.map((p: any) => {
            const meta = STATUS_META[p.approvalStatus] || STATUS_META.DRAFT;
            return (
              <div
                key={p.id}
                className="bg-sixth border-fifth border rounded-[4px] p-[16px] flex flex-col gap-[10px]"
              >
                <div className="flex items-center gap-[10px]">
                  <span
                    className="text-[11px] px-[8px] py-[2px] rounded-full text-white"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                  {p.title ? <span className="font-[600]">{p.title}</span> : null}
                  <span className="text-customColor18 text-[12px] ms-auto">
                    {new Date(p.publishDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="whitespace-pre-wrap text-[14px] text-customColor18 line-clamp-4">
                  {readable(p.content)}
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  <Button onClick={setStatus(p.id, 'APPROVED', t('approved', 'Approved'))}>
                    {t('approve', 'Approve')}
                  </Button>
                  <Button
                    onClick={setStatus(p.id, 'NEEDS_REVIEW', t('sent_to_review', 'Sent for review'))}
                  >
                    {t('request_review', 'Needs review')}
                  </Button>
                  <Button onClick={setStatus(p.id, 'DRAFT', t('moved_to_draft', 'Moved to draft'))}>
                    {t('to_draft', 'Back to draft')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
