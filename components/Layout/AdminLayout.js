// components/Layout/AdminLayout.js
import Navbar from '@/components/shared/Navbar'; 
import AdminSidebar from '@/components/shared/AdminSidebar';
import Head from 'next/head';
// import AdminSidebar from './AdminSidebar'; // Optional: ถ้ามี Sidebar สำหรับ Admin

export default function AdminLayout({ children, title = "Admin Panel" }) {
  const storeName = "ชื่อร้านของคุณ";
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Head>
        <title>{`${title} - ${storeName} Admin`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Navbar /> 
      <div className="flex flex-1"> {/* flex-1 เพื่อให้ main content ขยายเต็มที่ */}
        {/* <AdminSidebar /> */} {/* Optional: ถ้ามี Sidebar */}
        <AdminSidebar />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 mt-16 overflow-y-auto"> {/* mt-16 สำหรับ fixed navbar, overflow-y-auto ถ้า content ยาว */}
          {children} {/* เนื้อหาของหน้า Admin จะถูก render ที่นี่ */}
        </main>
      </div>
      {/* ไม่มี Footer ที่นี่ */}
    </div>
  );
}