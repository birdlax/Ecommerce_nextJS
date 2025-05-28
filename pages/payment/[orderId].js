// pages/orders/[orderId].js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; 
import { getOrderDetails, markOrderAsPaid, cancelUserOrder } from '@/utils/orderService';
import Link from 'next/link';
import Image from 'next/image';

const OrderDetailPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth(); 
  const router = useRouter();

  const orderIdFromQuery = Array.isArray(router.query.orderId) ? router.query.orderId[0] : router.query.orderId;

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const fetchOrder = useCallback(async (idToFetch) => {
    if (!isAuthenticated) {
      console.warn(`[OrderDetailPage] fetchOrder SKIPPED. Not authenticated. AuthLoading: ${authIsLoading}`);
      return;
    }
    if (!idToFetch || typeof idToFetch !== 'string' || idToFetch === 'undefined' || idToFetch.trim() === '') {
      console.warn(`[OrderDetailPage] fetchOrder SKIPPED. Invalid or missing idToFetch: '${idToFetch}'.`);
      // Set error และหยุด loading ถ้า ID ไม่ถูกต้องจริงๆ หลังจาก router.isReady
      if (router.isReady) { // เช็ค router.isReady ก่อน set error เรื่อง ID
          setError("Order ID ไม่ถูกต้อง หรือไม่ได้ระบุใน URL");
      }
      setLoadingOrder(false);
      return;
    }

    console.log(`[OrderDetailPage] fetchOrder: Attempting to fetch for ID: ${idToFetch}`);
    setLoadingOrder(true);
    setError(null);
    setPaymentError('');
    setCancelError('');
    try {
      const data = await getOrderDetails(idToFetch);
      setOrder(data);
      console.log("[OrderDetailPage] fetchOrder: Order Details Fetched:", data);
      if (!data) {
        setError(`ไม่พบคำสั่งซื้อสำหรับ ID: ${idToFetch}`);
      }
    } catch (err) {
      console.error(`[OrderDetailPage] fetchOrder: Failed for ID ${idToFetch}:`, err);
      setError(err.message || `Could not load details for order #${idToFetch}.`);
    } finally {
      setLoadingOrder(false);
    }
  }, [isAuthenticated, router, authIsLoading]); 

  // Effect 1: Redirect ถ้ายังไม่ได้ Login (เมื่อ auth state พร้อม)
  useEffect(() => {
    // ดึง orderId จาก router.query ภายใน useEffect เพื่อให้ได้ค่าล่าสุด
    const currentOrderIdForRedirect = Array.isArray(router.query.orderId) ? router.query.orderId[0] : router.query.orderId;
    if (!authIsLoading && !isAuthenticated) {
      console.log(`[OrderDetailPage] Auth Effect: Not authenticated. Redirecting. orderIdForRedirect: ${currentOrderIdForRedirect}`);
      const redirectPath = currentOrderIdForRedirect && currentOrderIdForRedirect !== 'undefined'
        ? `/login?redirect=/orders/${currentOrderIdForRedirect}`
        : '/login?redirect=/orders';
      router.replace(redirectPath);
    }
  }, [authIsLoading, isAuthenticated, router, router.query.orderId]); 

  // Effect 2: เรียก fetchOrder เมื่อ Dependencies พร้อม
  useEffect(() => {
    const currentOrderId = Array.isArray(router.query.orderId) ? router.query.orderId[0] : router.query.orderId;
    console.log('[OrderDetailPage] Data Fetch Effect Triggered. Conditions:', { authIsLoading, isAuthenticated, isReady: router.isReady, currentOrderId });

    if (!authIsLoading && isAuthenticated && router.isReady) {
      if (currentOrderId && typeof currentOrderId === 'string' && currentOrderId !== 'undefined') {
        fetchOrder(currentOrderId); 
      } else {
        console.error("[OrderDetailPage] Data Fetch Effect: Router is ready, authenticated, but orderId is invalid or missing from query:", currentOrderId);
        setError("URL ของคำสั่งซื้อไม่ถูกต้อง: ไม่พบ Order ID ที่ถูกต้องใน URL");
        setLoadingOrder(false); 
      }
    }
  }, [authIsLoading, isAuthenticated, router.isReady, router.query.orderId, fetchOrder]);


  const handlePayment = async () => {
    if (!order || !order.ID) { 
        console.error("[OrderDetailPage] handlePayment: Order or order.ID is missing.");
        return;
    }
    setPaymentProcessing(true);
    setPaymentError('');
    try {
      const paymentData = { /* ข้อมูลการชำระเงิน (ถ้ามี) */ };
      await markOrderAsPaid(order.ID, paymentData); 
      alert('การชำระเงิน (จำลอง) สำเร็จ! กำลังอัปเดตสถานะคำสั่งซื้อ...');
      if (order.ID) {
          await fetchOrder(String(order.ID)); 
      }
    } catch (err) {
      console.error("[OrderDetailPage] Payment processing error:", err);
      setPaymentError(err.message || "เกิดข้อผิดพลาดในการดำเนินการชำระเงิน");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !order.ID) { 
        console.error("[OrderDetailPage] handleCancelOrder: Order or order.ID is missing.");
        return;
    }
    if (!window.confirm(`คุณต้องการยกเลิกคำสั่งซื้อ #${order.ID} ใช่หรือไม่?`)) return; 

    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelUserOrder(order.ID); 
      alert(`คำสั่งซื้อ #${order.ID} ถูกยกเลิกแล้ว!`);
      if (order.ID) {
          await fetchOrder(String(order.ID)); 
      }
    } catch (err) {
      console.error("[OrderDetailPage] Cancel order error:", err);
      setCancelError(err.message || "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ");
    } finally {
      setIsCancelling(false);
    }
  };

  // --- ส่วนแสดงผล UI ---

  // 1. Loading state หลัก (รอ Auth หรือ รอ router.isReady หรือ orderId ยังไม่พร้อม)
  if (authIsLoading || !router.isReady || (router.isReady && !orderIdFromQuery && !error) ) {
    // console.log('[OrderDetailPage] Render: Showing initial loading screen.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-lg text-slate-700 dark:text-slate-300">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }
  
  // 2. ถ้ายังไม่ได้ Login (useEffect ด้านบนควรจะ redirect ไปแล้ว)
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <p className="text-lg text-slate-700 dark:text-slate-300">กรุณาเข้าสู่ระบบเพื่อดูหน้านี้</p>
        </div>
    );
  }

  // 3. ถ้ากำลังโหลดข้อมูล Order โดยเฉพาะ (หลังจาก Auth และ Router พร้อมแล้ว และมี orderId แล้ว)
  if (loadingOrder && !error) { 

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-lg text-slate-700 dark:text-slate-300">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
      </div>
    );
  }
  
  // 4. แสดง Error (ถ้ามี)
  if (error) {
    // console.log('[OrderDetailPage] Render: Showing error message:', error);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <Head><title>เกิดข้อผิดพลาด - ชื่อร้านของคุณ</title></Head>
            <h1 className="text-2xl font-bold text-red-600 mb-3">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <Link href="/orders" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                กลับไปหน้ารายการคำสั่งซื้อ
            </Link>
        </div>
    );
  }

  // 5. ถ้าไม่มีข้อมูล Order (หลังจาก Loading เสร็จและไม่มี Error)
  if (!order) {
    // console.log('[OrderDetailPage] Render: Order not found. orderIdFromQuery:', orderIdFromQuery);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Head><title>ไม่พบคำสั่งซื้อ - ชื่อร้านของคุณ</title></Head>
        <h1 className="text-2xl font-bold mb-3">ไม่พบคำสั่งซื้อ</h1>
        <p className="text-gray-600 dark:text-gray-400">ขออภัย ไม่พบคำสั่งซื้อที่คุณกำลังค้นหา (ID: {orderIdFromQuery || "ไม่ระบุ"})</p>
        <Link href="/orders" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            กลับไปหน้ารายการคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  // 6. ถ้าทุกอย่างพร้อม แสดงรายละเอียด Order
  // console.log('[OrderDetailPage] Render: Displaying order details for order ID:', order.ID);
  const storeName = "ชื่อร้านของคุณ";
  // **สำคัญ: ปรับ order.status ให้ตรงกับ key ที่ API ของคุณส่งมาสำหรับสถานะ Order**
  const canPay = order.status === 'pending_payment' || order.status === 'pending'; 
  const canCancel = order.status === 'pending' || order.status === 'processing' || order.status === 'pending_payment';

  return (
    <>
      <Head>
        <title>{`รายละเอียดคำสั่งซื้อ #${order.ID} - ${storeName}`}</title> {/* ใช้ order.ID (ตัวใหญ่) */}
        <meta name="description" content={order.product?.description || `รายละเอียดคำสั่งซื้อ #${order.ID}`} />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl">
          {/* Header Section (Order ID, Date, Status) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b dark:border-slate-700">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                คำสั่งซื้อ #{order.ID} {/* ใช้ order.ID */}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                วันที่: {order.CreatedAt ? new Date(order.CreatedAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}
              </p>
            </div>
            <span className={`mt-3 sm:mt-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
              order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
              order.status === 'pending_payment' || order.status === 'pending' || order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
              order.status === 'cancelled' || order.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
              'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
            }`}>
              สถานะ: {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
            </span>
          </div>

          {/* ===== Order Items Section (แก้ไขตามโครงสร้าง JSON ที่คุณให้มา) ===== */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">รายการสินค้าในคำสั่งซื้อ</h2>
            <div className="space-y-4">
              {/* ตรวจสอบ order.order_items ก่อน map */}
              {order.order_items && order.order_items.length > 0 ? order.order_items.map(item => {
                // คำนวณราคารวมของสินค้ารายการนี้ (ราคาต่อหน่วย ณ ตอนสั่งซื้อ * จำนวน)
                const itemSubtotal = (item.price || 0) * (item.quantity || 0);
                return (
                  // ใช้ item.ID (ID ของ order_item) เป็น key ซึ่งควรจะ unique ภายใน order นั้นๆ
                  <div key={item.ID} className="flex items-start sm:items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-600">
                      {/* เข้าถึง URL รูปภาพจาก item.product.image_url */}
                      {item.product?.image_url ? (
                          <Image 
                            src={item.product.image_url} 
                            alt={item.product?.name || "ภาพสินค้า"} // เพิ่ม alt text ที่ดีขึ้น
                            fill 
                            style={{objectFit: 'cover'}}
                            sizes="(max-width: 640px) 25vw, 100px" // ปรับ sizes ให้เหมาะสม
                           />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      {/* เข้าถึงชื่อสินค้าจาก item.product.name */}
                      <p className="font-medium text-slate-800 dark:text-slate-100 line-clamp-2" title={item.product?.name}>
                        {item.product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {/* เข้าถึงราคาต่อหน่วยจาก item.price (ราคาตอนสั่ง) และจำนวนจาก item.quantity */}
                        {item.price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {/* แสดง subtotal ที่คำนวณได้ */}
                      {itemSubtotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                  </div>
                );
              }) : (
                <p className="text-slate-500 dark:text-slate-400">ไม่พบรายการสินค้าในคำสั่งซื้อนี้</p>
              )}
            </div>
          </section>
          {/* ===== สิ้นสุด Order Items Section ===== */}

          {/* Shipping Address Section (ตรวจสอบ field name ให้ตรงกับ API) */}
          {order.shipping_address && ( // สมมติว่า API คืน shipping_address มากับ Order object หลัก
            <section className="mb-8">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">ที่อยู่จัดส่ง</h3>
                <address className="not-italic text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <p>{order.shipping_address.fullName || `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim() || 'N/A'}</p>
                    <p>{order.shipping_address.addressLine1 || 'N/A'}</p>
                    <p>
                        {order.shipping_address.city || 'N/A'}, 
                        {order.shipping_address.postalCode || 'N/A'}
                    </p>
                    <p>{order.shipping_address.country || 'N/A'}</p>
                    <p>โทร: {order.shipping_address.phone || 'N/A'}</p>
                </address>
                </div>
            </section>
          )}

          {/* Payment Summary Section */}
          <section className="border-t dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">สรุปยอดชำระเงิน</h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {/* สมมติ API อาจจะไม่มี subtotal_amount, shipping_fee ให้คำนวณจาก total_price ถ้าจำเป็น */}
                <div className="flex justify-between">
                    <span>ยอดรวมสินค้า (ก่อนค่าส่ง ถ้ามี):</span>
                    {/* ถ้า API ไม่มี subtotal_amount อาจจะต้องคำนวณจาก order.total_price - (order.shipping_fee || 0) */}
                    <span>{order.total_price ? (order.total_price - (order.shipping_fee || 0)).toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span>ค่าจัดส่ง:</span>
                    <span>{order.shipping_fee ? order.shipping_fee.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : 'ฟรี'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-slate-50 mt-2 pt-2 border-t-2 border-slate-200 dark:border-slate-600">
                    <span>ยอดชำระทั้งสิ้น:</span>
                    {/* ใช้ order.total_price จาก API (ตัวพิมพ์เล็กตาม JSON ที่คุณให้) */}
                    <span>{order.total_price ? order.total_price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : 'N/A'}</span>
                </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                วิธีการชำระเงิน: {order.payment_method || 'N/A'} {/* สมมติ API มี order.payment_method */}
            </p>
          </section>

          {paymentError && (
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center">{paymentError}</p>
          )}
           {cancelError && ( // แสดง error จากการยกเลิก
            <p className="mt-4 text-sm text-red-500 dark:text-red-400 text-center">{cancelError}</p>
          )}

           <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4"> {/* เพิ่ม flex-wrap */}
            {canPay && (
                <button
                    onClick={handlePayment}
                    disabled={paymentProcessing || isCancelling}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-60"
                >
                  {paymentProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                </button>
            )}
            {canCancel && (
                 <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling || paymentProcessing}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-60"
                >
                  {isCancelling ? 'กำลังยกเลิก...' : 'ยกเลิกคำสั่งซื้อ'}
                </button>
            )}
            <Link href="/orders" className="w-full sm:w-auto text-center px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 font-medium rounded-md transition-colors">
                กลับไปหน้ารายการคำสั่งซื้อ
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default OrderDetailPage;