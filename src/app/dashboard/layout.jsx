import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/components/SideBar';
import { PlanillaSelectionProvider } from '../contexts/PlanillaSelectionContext';
import Footer from '@/app/components/Footer';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  

  return (
    <PlanillaSelectionProvider>
      <div className="flex flex-col md:flex-row w-full bg-[#E5E7EB]" style={{ minHeight: '100dvh', overflow: 'hidden' }}>
        <Sidebar />
        <main className="flex-1 min-h-0 flex flex-col bg-[#F3F4F6]" style={{ maxHeight: '100dvh', overflow: 'hidden' }}>
          <div className="flex-1 min-h-0 overflow-auto px-4 py-4 md:px-6 pt-20 md:pt-4">{children}</div>
          <Footer dark={false} />
        </main>
      </div>
    </PlanillaSelectionProvider>
  );
}
