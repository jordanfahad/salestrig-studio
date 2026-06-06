import { BrandVoiceComponent } from '@gitroom/frontend/components/brand-voice/brand-voice.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Brand Voice`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <BrandVoiceComponent />
    </div>
  );
}
