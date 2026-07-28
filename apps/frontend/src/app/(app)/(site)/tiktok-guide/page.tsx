import { TiktokGuideComponent } from '@gitroom/frontend/components/guides/tiktok-guide.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} TikTok Guide`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px] mobile:p-[16px] flex-1 min-w-0">
      <TiktokGuideComponent />
    </div>
  );
}
