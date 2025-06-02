// pages/admin/reports/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';

// Icon ตัวอย่าง (คุณสามารถใช้ SVG หรือ Icon Library อื่นๆ)
const ReportIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);
const RevenueIcon = ({ className = "w-8 h-8" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m12.75 0v.75A.75.75 0 0015 6h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);


const ReportsIndexPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Route Protection
  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  if (authIsLoading) {
    return <div className="p-6 text-center">กำลังโหลด...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500">คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้</div>;
  }

  const reportLinks = [
    { name: 'รายงานรายได้', href: '/admin/reports/revenue', description: 'ดูสรุปและแนวโน้มรายได้ แยกตามหมวดหมู่', icon: RevenueIcon },
    // { name: 'รายงานยอดขายตามสินค้า', href: '/admin/reports/sales-by-product', description: 'วิเคราะห์สินค้าขายดีและสินค้าที่ต้องปรับปรุง', icon: ReportIcon },
    // { name: 'รายงานสินค้าใกล้หมดสต็อก', href: '/admin/reports/low-stock', description: 'ตรวจสอบสินค้าที่ต้องสั่งซื้อเพิ่ม', icon: ReportIcon },
    // เพิ่มรายงานอื่นๆ ที่นี่
  ];

  const storeName = "ชื่อร้านของคุณ";

  return (
    <>
      <Head>
        <title>ศูนย์รวมรายงาน - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        ศูนย์รวมรายงาน (Reports Center)
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href} legacyBehavior>
              <a className="block p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center mb-3">
                  {Icon && <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400 mr-3 group-hover:scale-110 transition-transform" />}
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.name}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {link.description}
                </p>
              </a>
            </Link>
          );
        })}
      </div>
    </>
  );
};

const ReportsIndexPage = () => {
  return <ReportsIndexPageContent />;
};

ReportsIndexPage.getLayout = function getLayout(page) {
  return <AdminLayout title="ศูนย์รวมรายงาน">{page}</AdminLayout>;
};

export default ReportsIndexPage;