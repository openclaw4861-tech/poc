import { cookies } from 'next/headers';
import { initializeDatabase } from '@/lib/db/actions';
import GanttChartClient from '@/components/gantt/GanttChartClient';

export default async function GanttPage() {
  // Initialize database on server (only once)
  const hasInitialized = (await cookies()).get('db_initialized');
  if (!hasInitialized) {
    try {
      await initializeDatabase();
      // Set cookie to prevent re-initialization
      (await cookies()).set('db_initialized', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  🏗️ SVAR Gantt Chart
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 h-[calc(100vh-200px)]">
            <GanttChartClient />
          </div>
        </div>
      </div>
    </>
  );
}
