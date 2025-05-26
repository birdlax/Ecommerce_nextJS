// components/Layout/AdminLayout.js
import Navbar from '@/components/shared/Navbar'; 
import Head from 'next/head'; 

export default function AdminLayout({ children, title = "Admin Area" }) {
  const storeName = "ชื่อร้านของคุณ"; 

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Head>
        <title>{`${title} - ${storeName} Admin`}</title>
        {/* สำคัญ: ป้องกันไม่ให้ Search Engine เก็บข้อมูลหน้า Admin */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Navbar /> 

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16"> {/* mt-16 เพื่อไม่ให้ Navbar บัง content */}
        {/* ถ้ามี Sidebar สำหรับ Admin ก็สามารถเพิ่มได้ที่นี่ */}
        {children}
      </main>

    </div>
  );
}