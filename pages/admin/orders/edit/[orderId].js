// pages/admin/orders/edit/[orderId].js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { adminGetOrderById, adminUpdateOrder } from '@/utils/adminService';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LoadingSpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const LoadingSpinnerPage = () => (
  <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="flex items-center">
      <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="ml-3 text-lg text-slate-700 dark:text-slate-300">กำลังโหลด...</p>
    </div>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">กรุณารอสักครู่</p>
  </div>
);

const EditOrderPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin, user: adminUser } = useAuth();
  const router = useRouter();
  const { orderId } = router.query;

  const [order, setOrder] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;
  const placeholderImageUrl = '/images/placeholder-product-square.png';

  // Handler for image load error
  const handleImageLoadError = (itemId) => {
    setImageLoadErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const fetchOrderDetails = useCallback(async (id) => {
    if (!isAuthenticated || !isAdmin || !id || typeof id !== 'string' || id.trim() === '') {
      if (isAuthenticated && isAdmin && router.isReady && (!id || id.trim() === '')) {
        setPageError("Order ID ไม่ถูกต้อง หรือไม่ได้ระบุใน URL");
      }
      setLoadingPage(false);
      return;
    }

    setLoadingPage(true);
    setPageError('');
    setSuccessMessage('');
    setFormError('');

    try {
      console.log(`[AdminEditOrder] Fetching order details for ID: ${id}`);
      const data = await adminGetOrderById(id);
      if (data) {
        setOrder(data);
        setNewStatus(data.status || '');
        console.log("[AdminEditOrder] Order details fetched:", data);
      } else {
        setPageError(`ไม่พบข้อมูลคำสั่งซื้อสำหรับ ID: ${id}`);
      }
    } catch (err) {
      console.error("Admin: Failed to fetch order details:", err);
      setPageError(err.message || 'Could not load order details.');
    } finally {
      setLoadingPage(false);
    }
  }, [isAuthenticated, isAdmin, router.isReady]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        const redirectPath = isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`;
        router.replace(redirectPath);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (router.isReady && orderId && typeof orderId === 'string' && orderId.trim() !== '') {
      if (isAuthenticated && isAdmin && !authIsLoading) {
        fetchOrderDetails(orderId);
      }
    } else if (router.isReady && (!orderId || String(orderId).trim() === '') && isAuthenticated && isAdmin && !authIsLoading) {
      setPageError("ไม่พบ Order ID ใน URL หรือ User ID ไม่ถูกต้อง");
      setLoadingPage(false);
    }
  }, [router.isReady, orderId, isAuthenticated, isAdmin, authIsLoading, fetchOrderDetails]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!order || !order.ID || !newStatus) {
      setFormError("กรุณาเลือกสถานะใหม่ หรือข้อมูลคำสั่งซื้อไม่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      await adminUpdateOrder(String(order.ID), { status: newStatus });
      setSuccessMessage(`อัปเดตสถานะคำสั่งซื้อ #${order.ID} เป็น "${newStatus}" สำเร็จแล้ว`);
      fetchOrderDetails(String(order.ID));
    } catch (err) {
      console.error("Admin: Failed to update order status:", err);
      setFormError(err.message || 'ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";
  const possibleStatuses = ["pending", "pending_payment", "processing", "shipped", "completed", "cancelled", "failed"];
  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5";
  const buttonBaseClasses = "inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors duration-150 disabled:opacity-60";
  const primaryButtonClasses = `${buttonBaseClasses} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`;
  const secondaryButtonClasses = `${buttonBaseClasses} bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 focus:ring-slate-400`;

  // Loading states
  if (authIsLoading || (!router.isReady && !pageError)) {
    return <LoadingSpinnerPage />;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400">
        {pageError || "คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้"}
      </div>
    );
  }

  if (router.isReady && loadingPage && !pageError) {
    return <LoadingSpinnerPage />;
  }

  if (pageError && !order) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{pageError}</p>
        <Link href="/admin/orders" className={secondaryButtonClasses}>
          <ArrowLeftIcon /> กลับไปหน้ารายการคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  if (!loadingPage && !order && router.isReady) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">ไม่พบข้อมูลคำสั่งซื้อ</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">ไม่พบคำสั่งซื้อสำหรับ ID: {orderId || "N/A"}</p>
        <Link href="/admin/orders" className={secondaryButtonClasses}>
          <ArrowLeftIcon /> กลับไปหน้ารายการคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  if (!order) {
    return <LoadingSpinnerPage />;
  }

  return (
    <>
      <Head>
        <title>แก้ไขคำสั่งซื้อ #{order?.ID} - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors">
          <ArrowLeftIcon />
          <span>กลับไปหน้ารายการคำสั่งซื้อ</span>
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        รายละเอียดคำสั่งซื้อ: <span className="text-indigo-600 dark:text-indigo-400">#{order?.ID}</span>
      </h1>
      
      {successMessage && (
        <div className="mb-6 p-4 text-sm text-center text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30 rounded-lg shadow">
          {successMessage}
        </div>
      )}

      {formError && (
        <div className="mb-6 p-4 text-sm text-center text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg shadow">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details Column (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-3">
              รายการสินค้า
            </h2>
            <div className="space-y-4">
              {order?.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, idx) => {
                  const itemSubtotal = (item.price || 0) * (item.quantity || 0);
                  const primaryImageObject = item.product?.images && item.product.images.length > 0 
                                           ? item.product.images[0]
                                           : null;
                  const imageUrl = primaryImageObject 
                                 ? `${baseApiUrl}/${primaryImageObject.path.replace(/^\.\//, '')}` 
                                 : placeholderImageUrl;
                  const productName = item.product?.name || 'Unknown Product';

                  return (
                    <div key={item.ID} className="flex items-start gap-4 py-3 border-b dark:border-slate-700 last:border-b-0">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        {imageLoadErrors[item.ID] || imageUrl === placeholderImageUrl ? (
                          <Image 
                            src={placeholderImageUrl} 
                            alt="Placeholder" 
                            fill 
                            className="object-contain p-1" 
                          />
                        ) : (
                          <Image 
                            src={imageUrl} 
                            alt={productName}
                            fill 
                            className="object-cover"
                            sizes="(max-width: 640px) 20vw, 80px"
                            onError={() => handleImageLoadError(item.ID)}
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-slate-800 dark:text-slate-100" title={productName}>
                          {productName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          ราคา: {item.price?.toLocaleString('th-TH')} บาท x {item.quantity}
                        </p>
                      </div>
                      <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {itemSubtotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 dark:text-slate-400">ไม่พบรายการสินค้า</p>
              )}
            </div>
          </section>

          {order.Address && (
            <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">ที่อยู่จัดส่ง</h3>
              <address className="not-italic text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p><strong>ผู้รับ:</strong> {order.Address.full_name}</p>
                <p>{order.Address.addressLine1}</p>
                {order.Address.addressLine2 && <p>{order.Address.addressLine2}</p>}
                <p>{order.Address.city}, {order.Address.province} {order.Address.zip_code}</p>
                <p>{order.Address.country}</p>
                <p><strong>โทร:</strong> {order.Address.phone}</p>
              </address>
            </section>
          )}
        </div>

        {/* Order Status & Actions Column (Right) */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-3">
              สรุปคำสั่งซื้อ
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>User ID:</span> 
                <span className="font-medium text-slate-700 dark:text-slate-200">{order.user_id}</span>
              </p>
              <p className="flex justify-between">
                <span>วันที่สั่งซื้อ:</span> 
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {new Date(order.CreatedAt).toLocaleDateString('th-TH')}
                </span>
              </p>
              <p className="flex justify-between">
                <span>ยอดรวม:</span> 
                <strong className="text-lg text-indigo-600 dark:text-indigo-400">
                  {order.total_price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                </strong>
              </p>
              <p className="flex justify-between">
                <span>สถานะปัจจุบัน:</span> 
                <strong className="capitalize">{order.status}</strong>
              </p>
              {order.PaidAt && (
                <p className="flex justify-between">
                  <span>วันที่ชำระเงิน:</span> 
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {new Date(order.PaidAt).toLocaleDateString('th-TH')}
                  </span>
                </p>
              )}
              {order.payment_method && (
                <p className="flex justify-between">
                  <span>วิธีชำระเงิน:</span> 
                  <span className="font-medium text-slate-700 dark:text-slate-200">{order.payment_method}</span>
                </p>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">อัปเดตสถานะคำสั่งซื้อ</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label htmlFor="status" className={labelClass}>เลือกสถานะใหม่:</label>
                <select 
                  id="status" 
                  name="status" 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isSubmitting}
                  className={`${inputClass} cursor-pointer`}
                >
                  {possibleStatuses.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {formError && (
                <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting || newStatus === order.status} 
                className={`${primaryButtonClasses} w-full`}
              >
                {isSubmitting ? <LoadingSpinnerIcon /> : null}
                {isSubmitting ? 'กำลังอัปเดต...' : 'อัปเดตสถานะ'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

const AdminOrderDetailPage = () => {
  return <EditOrderPageContent />;
};

AdminOrderDetailPage.getLayout = function getLayout(page) {
  return <AdminLayout title="รายละเอียดและแก้ไขคำสั่งซื้อ">{page}</AdminLayout>;
};

export default AdminOrderDetailPage;