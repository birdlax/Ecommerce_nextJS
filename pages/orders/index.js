// pages/orders/index.js
import { useEffect, useState, useCallback } from 'react'; // เพิ่ม useCallback ถ้าจะ memoize fetchUserOrders
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/utils/orderService';

const OrdersPage = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  // Memoize fetchUserOrders ด้วย useCallback
  const fetchUserOrders = useCallback(async () => {
    if (isAuthenticated) {
      setLoadingOrders(true);
      setError(null);
      try {
        const data = await getUserOrders(); // API: GET /order
        // API คืน array ของ orders โดยตรง (ตาม JSON ที่คุณให้มา)
        setOrders(Array.isArray(data) ? data : []); // ถ้า data ไม่ใช่ array ให้เป็น array ว่าง
        console.log("User Orders Fetched:", data);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setError(err.message || 'Could not load your orders.');
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    } else {
      setOrders([]); // เคลียร์ orders ถ้ายังไม่ได้ login
      setLoadingOrders(false);
    }
  }, [isAuthenticated]); // Dependency คือ isAuthenticated

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/orders');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authIsLoading && isAuthenticated) { // รอให้ auth check เสร็จ และ login อยู่
      fetchUserOrders();
    }
  }, [isAuthenticated, authIsLoading, fetchUserOrders]); // เพิ่ม fetchUserOrders ใน dependency

  if (authIsLoading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-slate-700 dark:text-slate-300">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // useEffect ด้านบนควรจะ redirect ไปแล้ว, นี่เป็น fallback UI
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-lg text-slate-700 dark:text-slate-300">กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อ</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <Head><title>เกิดข้อผิดพลาด - ชื่อร้านของคุณ</title></Head>
            <h1 className="text-2xl font-bold text-red-600 mb-3">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <Link href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                กลับหน้าแรก
            </Link>
        </div>
    );
  }

  const storeName = "ชื่อร้านของคุณ";

  return (
    <>
      <Head>
        <title>คำสั่งซื้อของฉัน - {storeName}</title>
        <meta name="description" content={`ดูรายการคำสั่งซื้อทั้งหมดของคุณที่ ${storeName}`} />
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            คำสั่งซื้อของฉัน
            </h1>
            {/* Optional: ปุ่มสำหรับ Refresh ข้อมูล */}
            <button
                onClick={fetchUserOrders}
                disabled={loadingOrders}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50"
            >
                {loadingOrders ? 'กำลังโหลด...' : 'รีเฟรช'}
            </button>
        </div>


        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">คุณยังไม่มีคำสั่งซื้อ</p>
            <Link href="/products" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              เลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              // ใช้ order.ID (ตัวใหญ่) ตาม JSON ที่คุณให้มา
              <div key={order.ID} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div>
                    <Link href={`/orders/${order.ID}`} className="hover:underline">
                        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                        Order #{order.ID} {/* ใช้ order.ID */}
                        </h2>
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {/* ใช้ order.CreatedAt สำหรับวันที่สั่งซื้อ */}
                      วันที่สั่งซื้อ: {order.CreatedAt ? new Date(order.CreatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </p>
                  </div>
                  <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                    order.status === 'pending' || order.status === 'processing' || order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : // เพิ่ม pending_payment
                    order.status === 'cancelled' || order.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  }`}>
                    {/* ใช้ order.status */}
                    สถานะ: {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
                  </span>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-200 mb-2 sm:mb-4">
                  {/* ใช้ order.total_price (ตัวพิมพ์เล็ก) ตาม JSON */}
                  ยอดรวม: {order.total_price ? order.total_price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : 'N/A'}
                </p>
                {/* ถ้าต้องการแสดงรายการสินค้าบางส่วนในหน้านี้ (Optional) */}
                {/* <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 mt-2 border-t dark:border-slate-700 pt-2">
                  {order.order_items && order.order_items.slice(0, 2).map(item => (
                    <p key={item.ID}>- {item.product?.name || 'Product'} (x{item.quantity})</p>
                  ))}
                  {order.order_items && order.order_items.length > 2 && <p>...และอีก {order.order_items.length - 2} รายการ</p>}
                </div> */}
                <div className="mt-4 flex justify-end">
                  <Link href={`/orders/${order.ID}`} className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-colors">
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default OrdersPage;