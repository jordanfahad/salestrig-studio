import { ApprovalsComponent } from '@gitroom/frontend/components/approvals/approvals.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Approvals`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <ApprovalsComponent />
    </div>
  );
}
