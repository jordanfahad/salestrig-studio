import { RepurposeComponent } from '@gitroom/frontend/components/repurpose/repurpose.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Repurposing Studio`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <RepurposeComponent />
    </div>
  );
}
