import { ContentPillarsComponent } from '@gitroom/frontend/components/content-pillars/content-pillars.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Content Pillars`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <ContentPillarsComponent />
    </div>
  );
}
