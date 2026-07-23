import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300">
        <TopBar />
        <main className="flex-1 p-6 bg-cyber-bg bg-cyber-grid bg-grid">
          {children}
        </main>
      </div>
    </div>
  );
}
