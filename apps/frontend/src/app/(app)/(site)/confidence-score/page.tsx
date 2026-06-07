import { ConfidenceScoreComponent } from '@gitroom/frontend/components/confidence-score/confidence-score.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Confidence Score`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <ConfidenceScoreComponent />
    </div>
  );
}
