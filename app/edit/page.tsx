import { Shell } from '@/components/shell';
import { WeeklyEdit } from '@/components/weekly-edit';

export default function Page() {
  return (
    <Shell title="Your weekly edit">
      <p className="mb-8">An illustrative Sunday edit.</p>
      <WeeklyEdit />
    </Shell>
  );
}
