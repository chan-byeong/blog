import { connection } from 'next/server';
import { AdminAnalytics } from '@/components/admin/admin-analytics';
import { AdminAnalyticsHeader } from '@/components/admin/admin-analytics-header';
import { AdminAnalyticsProvider } from '@/components/admin/admin-analytics-provider';
import { AdminAnalyticsSidebar } from '@/components/admin/admin-analytics-sidebar';

export default async function AdminAnalyticsPage() {
  await connection();

  return (
    <AdminAnalyticsProvider>
      <section className='col-span-full grid grid-cols-subgrid items-start gap-y-8 self-start pt-8 md:gap-y-14 md:pt-12'>
        <aside className='sticky col-span-full row-span-2 row-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-y-8 backdrop-blur-md sm:top-20 sm:gap-y-14 md:col-span-5'>
          <AdminAnalyticsHeader />
          <AdminAnalyticsSidebar />
        </aside>
        <AdminAnalytics />
      </section>
    </AdminAnalyticsProvider>
  );
}
