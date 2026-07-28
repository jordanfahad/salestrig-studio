'use client';

import React, { FC, ReactNode } from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

const CrossIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className="shrink-0 mt-[4px]"
  >
    <path
      d="M18 6 6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className="shrink-0 mt-[4px]"
  >
    <path
      d="m5 12.5 4.5 4.5L19 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Card: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="bg-sixth border border-fifth rounded-[12px] p-[20px] mobile:p-[16px] flex flex-col gap-[14px]">
    <h4 className="text-[17px] font-[600] leading-[1.35]">{title}</h4>
    {children}
  </section>
);

const Paragraph: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-[15px] leading-[1.65] text-balance">{children}</p>
);

const Step: FC<{ n: number; children: ReactNode }> = ({ n, children }) => (
  <li className="flex gap-[12px]">
    <div className="shrink-0 w-[26px] h-[26px] rounded-full bg-forth text-white text-[13px] font-[700] flex items-center justify-center">
      {n}
    </div>
    <div className="flex-1 min-w-0 pt-[3px] text-[15px] leading-[1.65]">
      {children}
    </div>
  </li>
);

// Long, unbreakable strings (error text, URLs) live here so they can scroll
// sideways on a phone instead of stretching the page.
const Code: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="overflow-x-auto max-w-full">
    <div className="inline-block bg-newBgColor border border-fifth rounded-[8px] px-[10px] py-[6px] text-[13px] font-mono leading-[1.5] break-words">
      {children}
    </div>
  </div>
);

export const TiktokGuideComponent: FC = () => {
  const t = useT();

  const studioSteps: string[] = [
    t(
      'tiktok_guide_studio_step_1',
      'Press "Create Post" to open the composer, the same way you do for Instagram.'
    ),
    t(
      'tiktok_guide_studio_step_2',
      'Press "Insert Media", then "Upload", and pick your file. Every TikTok post needs media: one video on its own, or one or more photos on their own. Never a video and photos in the same post.'
    ),
    t(
      'tiktok_guide_studio_step_3',
      'Write your caption in the writing box while it is still on screen.'
    ),
    t(
      'tiktok_guide_studio_step_4',
      'Copy that caption and keep it somewhere you can open on your phone, such as your notes app or a message to yourself. For a video, TikTok does not receive the caption and you will paste it in later. Photo posts do keep their caption.'
    ),
    t(
      'tiktok_guide_studio_step_5',
      'At the top of the composer, press the round profile pictures to choose where the post goes. Then, in the row of small square tabs just above the writing box, press the TikTok one. The settings stay hidden while the globe tab is selected, so you have to pick the TikTok tab first.'
    ),
    t(
      'tiktok_guide_studio_step_6',
      'Press the purple bar underneath. It shows your channel name followed by "Settings". The writing box disappears while the settings are open. That is normal. Press the bar again to bring the writing box back.'
    ),
    t(
      'tiktok_guide_studio_step_7',
      'Check that "Content posting method" still reads "Upload content to TikTok without posting it". It starts there, but this is the step from the box above, so look at it every time.'
    ),
    t(
      'tiktok_guide_studio_step_8',
      'Set the date and time you want and press "Add to Calendar". To send it straight away instead, use "Post now", which appears just above that button.'
    ),
  ];

  const phoneSteps: string[] = [
    t(
      'tiktok_guide_phone_step_1',
      'Open the TikTok app on the phone that is signed in to the account.'
    ),
    t(
      'tiktok_guide_phone_step_2',
      'Go to your inbox, the place where TikTok shows your notifications. TikTok leaves a notification there about the video Studio sent. It does not appear in TikTok Studio.'
    ),
    t(
      'tiktok_guide_phone_step_3',
      'Open that notification. Your video is waiting there, unfinished.'
    ),
    t(
      'tiktok_guide_phone_step_4',
      'Paste the caption you saved earlier, then set everything else the way you normally would: privacy, comments, duet, stitch, the cover frame, the AI-content label and any branded-content settings. All of those live in the TikTok app, not in Studio.'
    ),
    t(
      'tiktok_guide_phone_step_5',
      'Publish. Only now is the post on the profile.'
    ),
  ];

  const normalThings: { title: string; body: string; code?: string }[] = [
    {
      title: t(
        'tiktok_guide_normal_live_title',
        'The post is in the inbox but the profile is empty'
      ),
      body: t(
        'tiktok_guide_normal_live_body',
        'Expected. Studio shows an amber "In inbox" badge, not a green "Live" one, precisely because the video is only sitting in the account inbox. It reaches the profile when someone finishes it in the TikTok app. The badge stays amber even after that, because Studio has no way of knowing which video you published - use "Connect Post" on the calendar entry if you want to match it up and see its statistics.'
      ),
    },
    {
      title: t(
        'tiktok_guide_normal_link_title',
        'The post says "In inbox" instead of "Live"'
      ),
      body: t(
        'tiktok_guide_normal_link_body',
        'Correct. There is no published video to link to yet, so the calendar shows an amber "In inbox" and the post itself shows "In TikTok inbox" with a "How to finish" link. It turns into a real post once you finish it in the TikTok app.'
      ),
    },
    {
      title: t(
        'tiktok_guide_normal_caption_title',
        'The caption did not come across'
      ),
      body: t(
        'tiktok_guide_normal_caption_body',
        'Expected, for videos. TikTok has nowhere to put a caption on an unfinished upload, so you paste it in the app. Photo posts are different: their caption does come across.'
      ),
    },
    {
      title: t(
        'tiktok_guide_normal_greyed_title',
        'Half the TikTok settings turn grey'
      ),
      body: t(
        'tiktok_guide_normal_greyed_body',
        'Correct. Once you choose the upload option, privacy, comments, duet, stitch, the disclosure boxes, "Video made with AI" and "Auto add music" all go grey, because TikTok does not take them on an unfinished upload. Set all of that in the TikTok app instead.'
      ),
    },
    {
      title: t(
        'tiktok_guide_normal_addchannel_title',
        'There is no button to add a channel'
      ),
      body: t(
        'tiktok_guide_normal_addchannel_body',
        'That is on purpose. Your login is set up for the channels you look after. If one of them ever asks you to sign in again, you can reconnect it yourself.'
      ),
    },
  ];

  const limits: { title: string; body: string }[] = [
    {
      title: t('tiktok_guide_limit_pending_title', 'Five waiting uploads'),
      body: t(
        'tiktok_guide_limit_pending_body',
        'TikTok accepts at most 5 unfinished uploads in any 24 hours. Finish the ones already waiting in the app to make room.'
      ),
    },
    {
      title: t('tiktok_guide_limit_mp4_title', 'MP4 and MOV videos'),
      body: t(
        'tiktok_guide_limit_mp4_body',
        'A video has to be an .mp4 or a .mov file. iPhones record .mov, and those upload and post as they are, so there is nothing to convert. Anything else is refused with "Unsupported file type."'
      ),
    },
    {
      title: t('tiktok_guide_limit_media_title', 'Media is required'),
      body: t(
        'tiktok_guide_limit_media_body',
        'There is no text-only TikTok post. Send one video, or send photos. Never both in the same post.'
      ),
    },
    {
      title: t('tiktok_guide_limit_schedule_title', 'Scheduling is a hand-off time'),
      body: t(
        'tiktok_guide_limit_schedule_body',
        'The time you pick in Studio is when Studio hands the video to TikTok. It is not when the video goes live. It goes live when someone finishes it in the app.'
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[16px] w-full max-w-[820px]">
      <div className="flex flex-col gap-[4px]">
        <h3 className="text-[20px] font-[600]">
          {t('tiktok_guide_title', 'TikTok posting guide')}
        </h3>
        <div className="text-customColor18 text-[15px] leading-[1.6]">
          {t(
            'tiktok_guide_subtitle',
            'How to get a TikTok post from Studio onto the profile. It takes two short steps. Instagram is not affected.'
          )}
        </div>
      </div>

      {/* Why there is a second step */}
      <Card
        title={t('tiktok_guide_why_title', 'Why TikTok needs a second step')}
      >
        <Paragraph>
          {t(
            'tiktok_guide_why_p1',
            'Our TikTok app is still running on sandbox (test) credentials. While it is, TikTok does not let any outside tool put a post straight onto the profile.'
          )}
        </Paragraph>
        <Paragraph>
          {t(
            'tiktok_guide_why_p2',
            'So the work is split in two. Studio hands your video to TikTok, TikTok drops it into the account inbox, and you open the TikTok app on your phone and finish it there.'
          )}
        </Paragraph>
        <Paragraph>
          {t(
            'tiktok_guide_why_p3',
            'Nothing is broken. This is how TikTok treats a sandbox app, and this page will be updated if that ever changes. Instagram is not affected: those posts still go out on their own, with the caption you wrote.'
          )}
        </Paragraph>
      </Card>

      {/* THE critical step */}
      <section className="rounded-[12px] border-[2px] border-customColor19 bg-sixth overflow-hidden">
        {/* Black on customColor19 (#f97066) clears WCAG AA at 7.5:1; white
            would only reach 2.8:1 and is hard to read on a phone. */}
        <div className="bg-customColor19 text-black px-[16px] py-[10px] text-[13px] font-[700] uppercase tracking-[0.08em]">
          {t(
            'tiktok_guide_critical_badge',
            'Do this on every single TikTok post'
          )}
        </div>
        <div className="p-[20px] mobile:p-[16px] flex flex-col gap-[14px]">
          <h4 className="text-[18px] font-[700] leading-[1.35]">
            {t(
              'tiktok_guide_critical_title',
              'Change "Content posting method" before you send'
            )}
          </h4>
          <Paragraph>
            {t(
              'tiktok_guide_critical_intro',
              'Open the TikTok channel settings in the composer and find the dropdown called "Content posting method". It has two choices.'
            )}
          </Paragraph>

          <div className="flex flex-col gap-[10px]">
            <div className="flex gap-[10px] rounded-[10px] border border-fifth bg-newBgColor p-[12px]">
              <div className="text-customColor19">
                <CrossIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-[600] leading-[1.4]">
                  {t(
                    'tiktok_guide_option_direct',
                    'Post content directly to TikTok'
                  )}
                </div>
                <div className="text-[14px] leading-[1.55] text-customColor18 mt-[2px]">
                  {t(
                    'tiktok_guide_option_direct_note',
                    'It fails every time right now. Never switch to it, and change it back if you find a post already set to it.'
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-[10px] rounded-[10px] border-[2px] border-customColor42 bg-newBgColor p-[12px]">
              <div className="text-customColor42">
                <CheckIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-[600] leading-[1.4]">
                  {t(
                    'tiktok_guide_option_upload',
                    'Upload content to TikTok without posting it'
                  )}
                </div>
                <div className="text-[14px] leading-[1.55] text-customColor18 mt-[2px]">
                  {t(
                    'tiktok_guide_option_upload_note',
                    'Pick this one. Every time. It is the only setting that works while our app is on sandbox credentials.'
                  )}
                </div>
              </div>
            </div>
          </div>

          <Paragraph>
            {t(
              'tiktok_guide_critical_reset',
              'A new TikTok post now starts on the upload option already selected. Glance at it before you send anyway - an older post you reopen keeps whatever was saved on it.'
            )}
          </Paragraph>

          <div className="flex flex-col gap-[6px]">
            <div className="text-[14px] font-[600]">
              {t(
                'tiktok_guide_critical_error_label',
                'If you forget, the post fails with this message:'
              )}
            </div>
            <Code>App not approved for public posting, contact support</Code>
          </div>
        </div>
      </section>

      {/* Steps in Studio */}
      <Card
        title={t('tiktok_guide_studio_title', 'Step 1: send it from Studio')}
      >
        <ol className="flex flex-col gap-[14px]">
          {studioSteps.map((step, index) => (
            <Step key={index} n={index + 1}>
              {step}
            </Step>
          ))}
        </ol>
      </Card>

      {/* Steps on the phone */}
      <Card
        title={t(
          'tiktok_guide_phone_title',
          'Step 2: finish it in the TikTok app'
        )}
      >
        <Paragraph>
          {t(
            'tiktok_guide_phone_intro',
            'Nothing is on the profile until someone does this part. Try to do it the same day you send it.'
          )}
        </Paragraph>
        <ol className="flex flex-col gap-[14px]">
          {phoneSteps.map((step, index) => (
            <Step key={index} n={index + 1}>
              {step}
            </Step>
          ))}
        </ol>
      </Card>

      {/* Looks broken but is normal */}
      <Card
        title={t(
          'tiktok_guide_normal_title',
          'Looks broken, but it is normal'
        )}
      >
        <div className="flex flex-col gap-[16px]">
          {normalThings.map((item, index) => (
            <div key={index} className="flex flex-col gap-[4px]">
              <div className="text-[15px] font-[600] leading-[1.45]">
                {item.title}
              </div>
              <div className="text-[15px] leading-[1.65] text-customColor18">
                {item.body}
              </div>
              {item.code && (
                <div className="mt-[6px]">
                  <Code>{item.code}</Code>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Limits */}
      <Card title={t('tiktok_guide_limits_title', 'Limits to keep in mind')}>
        <div className="flex flex-col gap-[16px]">
          {limits.map((item, index) => (
            <div key={index} className="flex flex-col gap-[4px]">
              <div className="text-[15px] font-[600] leading-[1.45]">
                {item.title}
              </div>
              <div className="text-[15px] leading-[1.65] text-customColor18">
                {item.body}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* When something fails */}
      <Card title={t('tiktok_guide_fix_title', 'When a post fails')}>
        <Paragraph>
          {t(
            'tiktok_guide_fix_intro',
            'Find the message or the situation you ran into, then do what it says underneath it.'
          )}
        </Paragraph>

        <div className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[6px]">
            <div className="text-[15px] font-[600] leading-[1.45]">
              {t(
                'tiktok_guide_fix_direct_title',
                'The post failed with this message'
              )}
            </div>
            <Code>App not approved for public posting, contact support</Code>
            <div className="text-[15px] leading-[1.65] text-customColor18">
              {t(
                'tiktok_guide_fix_direct',
                'The "Content posting method" dropdown was left on "Post content directly to TikTok". Open the TikTok channel settings, change it to "Upload content to TikTok without posting it", and send the post again.'
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            <div className="text-[15px] font-[600] leading-[1.45]">
              {t(
                'tiktok_guide_fix_mov_title',
                'A video from an iPhone would not upload'
              )}
            </div>
            <div className="text-[15px] leading-[1.65] text-customColor18">
              {t(
                'tiktok_guide_fix_mov',
                'iPhone .mov files are accepted, so this is usually the file itself. "Unsupported file type." means the file is not really a video - re-save it from Photos rather than sending it through a chat app first, which can hand over a still frame instead.'
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            <div className="text-[15px] font-[600] leading-[1.45]">
              {t(
                'tiktok_guide_fix_nomedia_title',
                'The post will not send and there is no video or photo on it'
              )}
            </div>
            <div className="text-[15px] leading-[1.65] text-customColor18">
              {t(
                'tiktok_guide_fix_nomedia',
                'TikTok will not accept an empty post. Add a video, or add photos, then send again.'
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <div className="text-[15px] font-[600] leading-[1.45]">
              {t(
                'tiktok_guide_fix_pending_title',
                'The post failed and the message mentions pending posts'
              )}
            </div>
            <Code>
              TikTok limits pending posts to 5 within any 24-hour period. Please
              check your TikTok inbox in the TikTok mobile app and try again
              after 24 hours.
            </Code>
            <div className="text-[15px] leading-[1.65] text-customColor18">
              {t(
                'tiktok_guide_fix_pending',
                'You already have 5 unfinished uploads waiting. Finish them in the TikTok app to clear the queue, then send this post again.'
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            <div className="text-[15px] font-[600] leading-[1.45]">
              {t(
                'tiktok_guide_fix_reauth_title',
                'TikTok asks you to sign in again, or the channel looks disconnected'
              )}
            </div>
            <div className="text-[15px] leading-[1.65] text-customColor18">
              {t(
                'tiktok_guide_fix_reauth',
                'You can reconnect your own channel yourself. Do that first, then send the post again.'
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
