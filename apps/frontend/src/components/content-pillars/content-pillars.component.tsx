'use client';

import React, { FC, useCallback } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { FormProvider, useForm } from 'react-hook-form';
import { Input } from '@gitroom/react/form/input';
import { Button } from '@gitroom/react/form/button';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';

const DEFAULT_COLORS = [
  '#6E4488',
  '#F2785C',
  '#C9A36B',
  '#1FB6A0',
  '#835AA0',
  '#E1306C',
  '#0A66C2',
];

export const ContentPillarsComponent: FC = () => {
  const fetch = useFetch();
  const toaster = useToaster();
  const t = useT();

  const load = useCallback(
    async () => (await fetch('/content-pillars')).json(),
    []
  );
  const { data, mutate } = useSWR('content-pillars', load);
  const pillars: any[] = data || [];

  const form = useForm({ values: { name: '', color: DEFAULT_COLORS[0] } });
  const color = form.watch('color');

  const add = useCallback(
    async (values: any) => {
      if (!values.name?.trim()) return;
      await fetch('/content-pillars', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          color: values.color,
          order: pillars.length,
        }),
      });
      toaster.show(t('pillar_added', 'Pillar added'), 'success');
      form.reset({
        name: '',
        color: DEFAULT_COLORS[(pillars.length + 1) % DEFAULT_COLORS.length],
      });
      mutate();
    },
    [pillars.length]
  );

  const remove = useCallback(
    (p: any) => async () => {
      if (
        await deleteDialog(
          t('delete_pillar_confirm', `Delete the "${p.name}" pillar?`)
        )
      ) {
        await fetch(`/content-pillars/${p.id}`, { method: 'DELETE' });
        toaster.show(t('pillar_deleted', 'Pillar deleted'), 'success');
        mutate();
      }
    },
    []
  );

  return (
    <div className="flex flex-col">
      <h3 className="text-[20px]">{t('content_pillars', 'Content Pillars')}</h3>
      <div className="text-customColor18 mt-[4px]">
        {t(
          'content_pillars_desc',
          'Define 3–7 themes you post about and color-tag them, so you can see your balance across the calendar and keep your content intentional.'
        )}
      </div>

      <div className="my-[16px] bg-sixth border-fifth border rounded-[4px] p-[24px] flex flex-col gap-[16px]">
        {pillars.length > 0 ? (
          <div className="flex flex-col gap-[10px]">
            {pillars.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center gap-[12px] border-fifth border rounded-[4px] p-[12px]"
              >
                <span
                  className="h-[18px] w-[18px] rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                <span className="flex-1">{p.name}</span>
                <Button onClick={remove(p)}>{t('delete', 'Delete')}</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-customColor18">
            {t('no_pillars_yet', 'No pillars yet — add your first below.')}
          </div>
        )}

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(add)}
            className="flex flex-wrap items-end gap-[12px]"
          >
            <div className="min-w-[200px] flex-1">
              <Input
                name="name"
                label={t('pillar_name', 'Pillar name')}
                placeholder="Education"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[14px]">{t('color', 'Color')}</span>
              <div className="flex items-center gap-[8px]">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => form.setValue('color', c)}
                    className="h-[24px] w-[24px] rounded-full"
                    style={{
                      background: c,
                      outline: color === c ? '2px solid #fff' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
            <Button type="submit">{t('add_pillar', 'Add pillar')}</Button>
          </form>
          {pillars.length >= 7 ? (
            <div className="text-customColor18 text-[13px]">
              {t(
                'pillar_limit_hint',
                '7 pillars is the sweet spot — remove one to keep things focused.'
              )}
            </div>
          ) : null}
        </FormProvider>
      </div>
    </div>
  );
};
