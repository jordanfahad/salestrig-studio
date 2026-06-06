import { LaunchPlannerComponent } from '@gitroom/frontend/components/launch-planner/launch-planner.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { brandName } from '@gitroom/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${brandName()} Launch Planner`,
  description: '',
};
export default async function Index() {
  return (
    <div className="p-[20px]">
      <LaunchPlannerComponent />
    </div>
  );
}
