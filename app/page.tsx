import { WeeklyDashboard } from '@/components/weekly-dashboard';
import { WeeklyEdit } from '@/components/weekly-edit';

export default function Home() {
  return (
    <WeeklyDashboard>
      <section id="weekly-edit" className="mt-9 scroll-mt-6" aria-labelledby="weekly-edit-heading">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="weekly-edit-heading" className="section-title">Weekly Edit</h2>
          <p className="muted-text text-sm">Demo ideas</p>
        </div>
        <WeeklyEdit heading="h3" />
      </section>
    </WeeklyDashboard>
  );
}
