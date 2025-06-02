// pages/admin/revenue.js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getRevenueByCategory } from '@/utils/orderService'; // หรือ adminService
import AdminLayout from '@/components/Layout/AdminLayout'; // ใช้ Admin Layout

const RevenuePage = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [revenueData, setRevenueData] = useState([]); // สมมติ API คืน Array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRevenue = useCallback(async () => {
    if (isAuthenticated && isAdmin) {
      setLoading(true);
      setError('');
      try {
        const data = await getRevenueByCategory();
        // สมมติ data คือ array of { category_name, total_revenue, ... }
        // หรือถ้าเป็น object { overall_total_revenue, revenue_by_category: [...] }
        // ก็ต้องปรับเป็น setRevenueData(data.revenue_by_category || []);
        setRevenueData(Array.isArray(data) ? data : (data?.revenue_by_category || []));
        console.log("Revenue data fetched:", data);
      } catch (err) {
        console.error("Failed to fetch revenue data:", err);
        setError(err.message || 'Could not load revenue data.');
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace('/login?redirect=/admin/revenue'); // หรือไปหน้าแรกถ้าไม่ใช่ admin
      } else {
        fetchRevenue();
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router, fetchRevenue]);

  if (authIsLoading || loading) {
    return <div className="p-4">Loading revenue data...</div>;
  }
  if (!isAuthenticated || !isAdmin) return null; // Redirecting
  if (error) {
    return <div className="p-4 text-red-500">Error loading revenue: {error}</div>;
  }

  // สมมติว่า revenueData เป็น array of { category_name, total_revenue, total_orders, total_items_sold }
  const overallRevenue = revenueData.reduce((sum, cat) => sum + (cat.total_revenue || 0), 0);

  return (
    <>
      <Head>
        <title>รายงานรายได้ตามหมวดหมู่ - Admin</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">รายงานรายได้ตามหมวดหมู่</h1>

        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">
                รายได้รวมทั้งหมด: {overallRevenue.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
            </p>
        </div>

        {revenueData.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">ไม่พบข้อมูลรายได้</p>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">หมวดหมู่</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">รายได้รวม</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">จำนวน Orders</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">จำนวนสินค้าที่ขายได้</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {revenueData.map((cat) => (
                  <tr key={cat.category_id || cat.category_name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{cat.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-right">{cat.total_revenue?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-right">{cat.total_orders?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-right">{cat.total_items_sold?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* ในอนาคตอาจจะเพิ่ม Chart ที่นี่ */}
      </div>
    </>
  );
};

// กำหนด Layout สำหรับหน้า Admin
RevenuePage.getLayout = function getLayout(page) {
  return <AdminLayout title="Revenue Report">{page}</AdminLayout>;
};

export default RevenuePage;