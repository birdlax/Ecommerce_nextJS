// pages/admin/dashboard.js (หรือ pages/admin/reports/revenue.js)
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // ตรวจสอบ Path Alias
import AdminLayout from '@/components/Layout/AdminLayout'; // ตรวจสอบ Path Alias
import {
    adminGetDashboardSummary,
    adminGetSalesTrend,
    adminGetRecentOrders,
    // adminGetRecentProducts, // Optional
    // adminGetRecentUsers,    // Optional
} from '@/utils/adminService'; // ตรวจสอบ Path Alias

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell, // Import Cell for PieChart (ถ้าจะใช้ PieChart ที่นี่)
    PieChart, Pie      // Import PieChart และ Pie
} from 'recharts';

// --- Helper Functions & Constants ---
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
const monthOptions = [
  { value: '', label: 'ทั้งปี' }, { value: '1', label: 'มกราคม' }, { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' }, { value: '4', label: 'เมษายน' }, { value: '5', label: 'พฤษภาคม' },
  { value: '6', label: 'มิถุนายน' }, { value: '7', label: 'กรกฎาคม' }, { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' }, { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toLocaleString('th-TH');
};
const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#A3A1FB', '#5EE2A0', '#FFD700'];

// --- Components ย่อยสำหรับ Dashboard Cards ---
const StatCard = ({ title, value, icon, unit = '', colorClass = 'text-indigo-600 dark:text-indigo-400', link }) => (
  <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg transition-all hover:shadow-xl ${link ? 'hover:scale-[1.02]' : ''}`}>
    {link ? (
      <Link href={link} className="block">
        <div className="flex items-center">
          {icon && <div className={`mr-4 p-3 rounded-full bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>{icon}</div>}
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <p className={`text-xl sm:text-2xl font-bold ${colorClass}`}>{value} <span className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300">{unit}</span></p>
          </div>
        </div>
      </Link>
    ) : (
      <div className="flex items-center">
        {icon && <div className={`mr-4 p-3 rounded-full bg-opacity-10 dark:bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>{icon}</div>}
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${colorClass}`}>{value} <span className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300">{unit}</span></p>
        </div>
      </div>
    )}
  </div>
);

// --- Icons (ตัวอย่าง) ---
const CurrencyDollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const CubeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>


const AdminDashboardContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [summaryData, setSummaryData] = useState(null);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoadingDashboard(true);
    setDashboardError('');
    try {
      const [summary, trend, ordersResponse] = await Promise.all([
        adminGetDashboardSummary().catch(e => { console.error("Error fetching summary:", e); setDashboardError(prev => prev + "\nFailed to load summary."); return null; }),
        adminGetSalesTrend('daily', 30).catch(e => { console.error("Error fetching sales trend:", e); setDashboardError(prev => prev + "\nFailed to load sales trend."); return []; }),
        adminGetRecentOrders(5).catch(e => { console.error("Error fetching recent orders:", e); setDashboardError(prev => prev + "\nFailed to load recent orders."); return null; })
      ]);
      
      setSummaryData(summary);

      if (Array.isArray(trend)) {
          setSalesTrendData(trend.map(t => ({ 
            ...t, 
            // Format date for XAxis display, ensure it's a string Recharts can parse or use directly
            date: new Date(t.date).toLocaleDateString('en-CA') // YYYY-MM-DD is good for sorting
            // หรือ 'th-TH', { month: 'short', day: 'numeric' } ถ้าต้องการแบบไทย
          })));
      }
      // API /admin/orders อาจจะคืน { items: [...] } หรือ array ตรงๆ
      setRecentOrders(Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.items || [])); 

      console.log("Dashboard data fetched:", { summary, trend, orders: ordersResponse });
    } catch (err) { // Should be caught by individual catches now
      console.error("[AdminDashboard] Failed to fetch dashboard data (Promise.all level):", err);
      setDashboardError(err.message || 'Could not load all dashboard data.');
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin && !authIsLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAdmin, authIsLoading, fetchDashboardData]);


  const storeName = "ชื่อร้านของคุณ";

  if (authIsLoading || (loadingDashboard && !summaryData && !dashboardError)) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลด Dashboard...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้</div>;
  }
  // ถ้ามี error ตอนโหลดข้อมูลหลักๆ แต่ยังไม่มี summaryData
  if (dashboardError && !summaryData && !loadingDashboard) {
      return <div className="p-6 text-center text-red-500 dark:text-red-400">เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard: {dashboardError}</div>;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            ภาพรวมระบบ
        </h1>
        <button 
            onClick={fetchDashboardData} 
            disabled={loadingDashboard}
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loadingDashboard ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" /></svg>
            {loadingDashboard ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
      </div>


      {/* Summary Cards Section */}
      {summaryData && (
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <StatCard title="รายได้วันนี้" value={formatCurrency(summaryData.today_revenue)} icon={<CurrencyDollarIcon />} colorClass="text-green-600 dark:text-green-400"/>
            <StatCard title="คำสั่งซื้อวันนี้" value={formatNumber(summaryData.today_orders)} unit="รายการ" icon={<ShoppingCartIcon />} colorClass="text-blue-600 dark:text-blue-400" link="/admin/orders?filter=today"/>
            <StatCard title="รายได้เดือนนี้" value={formatCurrency(summaryData.month_revenue)} icon={<CurrencyDollarIcon />} colorClass="text-green-600 dark:text-green-400"/>
            <StatCard title="คำสั่งซื้อเดือนนี้" value={formatNumber(summaryData.month_orders)} unit="รายการ" icon={<ShoppingCartIcon />} colorClass="text-blue-600 dark:text-blue-400" link="/admin/orders?filter=this_month"/>
            <StatCard title="สินค้าทั้งหมด" value={formatNumber(summaryData.total_products)} icon={<CubeIcon />} link="/admin/products"/>
            <StatCard title="คำสั่งซื้อรอจัดการ" value={formatNumber(summaryData.pending_orders_count)} unit="รายการ" icon={<AlertTriangleIcon />} colorClass="text-yellow-500 dark:text-yellow-400" link="/admin/orders?status=pending"/>
            {/* เพิ่ม StatCards อื่นๆ ตามต้องการ */}
          </div>
        </section>
      )}
      {!summaryData && !loadingDashboard && dashboardError && (
           <p className="text-sm text-red-500 dark:text-red-400 mb-8">ไม่สามารถโหลดข้อมูลสรุปได้: {dashboardError.includes("summary") ? dashboardError : ''}</p>
      )}


      {/* Sales Trend Chart Section */}
      {salesTrendData.length > 0 && (
        <section className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b dark:border-slate-700">
                แนวโน้มยอดขายและคำสั่งซื้อ (30 วันล่าสุด)
            </h2>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={salesTrendData} margin={{ top: 5, right: 30, left: 5, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="dark:stroke-slate-700"/>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--chart-text-color, #4A5568)' }} className="dark:fill-slate-400" />
                        <YAxis yAxisId="revenue" orientation="left" name="รายได้"
                               tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
                               tick={{ fontSize: 10, fill: 'var(--chart-text-color, #4A5568)' }} className="dark:fill-slate-400"
                               stroke="#8884d8"/>
                        <YAxis yAxisId="orders" orientation="right" name="จำนวน Order"
                               tickFormatter={(value) => formatNumber(value)}
                               tick={{ fontSize: 10, fill: 'var(--chart-text-color, #4A5568)' }} className="dark:fill-slate-400"
                               stroke="#82ca9d"/>
                        <Tooltip
                            contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', darkBackgroundColor: 'rgba(30,41,59,0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0', darkBorder: '1px solid #475569'}}
                            labelStyle={{fontWeight: 'bold', color: '#334155', darkColor: '#cbd5e1'}}
                            formatter={(value, name, props) => {
                                if (props.dataKey === 'revenue') return [formatCurrency(value), "รายได้"];
                                if (props.dataKey === 'order_count') return [formatNumber(value), "จำนวน Order"];
                                return [value, name];
                        }}/>
                        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                        <Line type="monotone" dataKey="revenue" yAxisId="revenue" name="รายได้" stroke="#8884d8" strokeWidth={2} dot={{ r: 3, strokeWidth:1 }} activeDot={{ r: 6, strokeWidth:2 }} />
                        <Line type="monotone" dataKey="order_count" yAxisId="orders" name="จำนวน Order" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3, strokeWidth:1 }} activeDot={{ r: 6, strokeWidth:2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
      )}
      {salesTrendData.length === 0 && !loadingDashboard && dashboardError && (
           <p className="text-sm text-red-500 dark:text-red-400 mb-8">ไม่สามารถโหลดข้อมูลแนวโน้มยอดขายได้: {dashboardError.includes("sales trend") ? dashboardError : ''}</p>
      )}


      {/* Recent Orders Section */}
      {recentOrders.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">คำสั่งซื้อล่าสุด</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">ดูทั้งหมด</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">วันที่</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">สถานะ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ยอดรวม</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {recentOrders.map(order => (
                  <tr key={order.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/orders/edit/${order.ID}`} className="text-indigo-600 hover:underline dark:text-indigo-400">#{order.ID}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(order.CreatedAt).toLocaleDateString('th-TH', {day:'2-digit', month:'short', year:'numeric'})}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            order.status === 'pending' || order.status === 'processing' || order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            order.status === 'cancelled' || order.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-100'
                        }`}>
                            {order.status}
                        </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-right">{formatCurrency(order.total_price)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <Link href={`/admin/orders/edit/${order.ID}`} className="text-indigo-600 hover:underline dark:text-indigo-400">ดู/แก้ไข</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {recentOrders.length === 0 && !loadingDashboard && dashboardError && (
           <p className="text-sm text-red-500 dark:text-red-400 mb-8">ไม่สามารถโหลดข้อมูลคำสั่งซื้อล่าสุดได้: {dashboardError.includes("recent orders") ? dashboardError : ''}</p>
      )}

      {/* (Optional) Sections for Recent Products, Recent Users */}
    </>
  );
};

// Wrapper component และ getLayout
const AdminDashboardPage = () => {
  return <AdminDashboardContent />;
};
AdminDashboardPage.getLayout = function getLayout(page) {
  return <AdminLayout title="Admin Dashboard">{page}</AdminLayout>;
};
export default AdminDashboardPage;