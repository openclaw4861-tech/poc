import GanttChart from '@/components/gantt/GanttChart';

export default function GanttPage() {
  return (
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
          <GanttChart />
        </div>
      </div>
    </div>
  );
}
