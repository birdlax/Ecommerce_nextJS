// pages/payment/[orderId].js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderDetails, markOrderAsPaid, cancelUserOrder } from '@/utils/orderService';

// --- Icons ---
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-16 h-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const NotFoundIcon = () => (
  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const PlaceholderImageIcon = () => (
  <svg className="w-full h-full text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
// ---------------

const LoadingSpinnerPage = () => (
  <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="flex items-center">
      <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="ml-3 text-lg text-slate-700 dark:text-slate-300">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
    </div>
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">กรุณารอสักครู่</p>
  </div>
);

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

  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;
  const placeholderImageUrl = '/images/placeholder-product-square.png';

  const fetchOrder = useCallback(async (idToFetch) => {
    if (!isAuthenticated) return;
    
    if (!idToFetch || typeof idToFetch !== 'string' || idToFetch.trim() === '' || idToFetch === 'undefined') {
      if (router.isReady) {
        setError("Order ID ไม่ถูกต้อง หรือไม่ได้ระบุใน URL");
      }
      setLoadingOrder(false);
      return;
    }
    
    setLoadingOrder(true); 
    setError(null); 
    setPaymentError(''); 
    setCancelError('');
    
    try {
      const data = await getOrderDetails(idToFetch);
      setOrder(data);
      if (!data) {
        setError(`ไม่พบคำสั่งซื้อสำหรับ ID: ${idToFetch}`);
      }
    } catch (err) {
      setError(err.message || `Could not load details for order #${idToFetch}.`);
    } finally {
      setLoadingOrder(false);
    }
  }, [isAuthenticated, router.isReady]);

  useEffect(() => {
    const currentOrderIdForRedirect = Array.isArray(router.query.orderId) ? router.query.orderId[0] : router.query.orderId;
    if (!authIsLoading && !isAuthenticated) {
      const redirectPath = currentOrderIdForRedirect && currentOrderIdForRedirect !== 'undefined'
        ? `/login?redirect=/orders/${currentOrderIdForRedirect}`
        : '/login?redirect=/orders';
      router.replace(redirectPath);
    }
  }, [authIsLoading, isAuthenticated, router, router.query.orderId]);

  useEffect(() => {
    const currentOrderId = Array.isArray(router.query.orderId) ? router.query.orderId[0] : router.query.orderId;
    if (!authIsLoading && isAuthenticated && router.isReady) {
      if (currentOrderId && typeof currentOrderId === 'string' && currentOrderId !== 'undefined') {
        fetchOrder(currentOrderId);
      } else if (router.isReady && !currentOrderId) {
        setError("URL ของคำสั่งซื้อไม่ถูกต้อง: ไม่พบ Order ID");
        setLoadingOrder(false);
      }
    }
  }, [authIsLoading, isAuthenticated, router.isReady, router.query.orderId, fetchOrder]);

  const handlePayment = async () => {
    if (!order || !order.ID) return;
    setPaymentProcessing(true); 
    setPaymentError('');
    
    try {
      const paymentData = {};
      await markOrderAsPaid(String(order.ID), paymentData);
      alert('การชำระเงิน (จำลอง) สำเร็จ! สถานะคำสั่งซื้อมีการเปลี่ยนแปลง');
      if (order.ID) await fetchOrder(String(order.ID));
    } catch (err) {
      setPaymentError(err.message || "เกิดข้อผิดพลาดในการดำเนินการชำระเงิน");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !order.ID) return;
    if (!window.confirm(`คุณต้องการยกเลิกคำสั่งซื้อ #${order.ID} ใช่หรือไม่?`)) return;
    
    setIsCancelling(true); 
    setCancelError('');
    
    try {
      await cancelUserOrder(String(order.ID));
      alert(`คำสั่งซื้อ #${order.ID} ถูกยกเลิกแล้ว!`);
      if (order.ID) await fetchOrder(String(order.ID));
    } catch (err) {
      setCancelError(err.message || "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ");
    } finally {
      setIsCancelling(false);
    }
  };

  if (authIsLoading || !router.isReady || (loadingOrder && !order && !error && orderIdFromQuery)) {
    return <LoadingSpinnerPage />;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <p className="text-lg text-slate-700 dark:text-slate-300">กรุณาเข้าสู่ระบบเพื่อดูหน้านี้</p>
          <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            ไปหน้าล็อกอิน
          </Link>
        </div>
      </div>
    );
  }
  
  if (error && !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Head><title>เกิดข้อผิดพลาด - ชื่อร้านของคุณ</title></Head>
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center">
          <div className="flex justify-center">
            <ErrorIcon />
          </div>
          <h1 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-4">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-700 dark:text-slate-300 mt-2 mb-6">{error}</p>
          <Link 
            href="/orders" 
            className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeftIcon />
            กลับไปหน้ารายการคำสั่งซื้อ
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order && !loadingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Head><title>ไม่พบคำสั่งซื้อ - ชื่อร้านของคุณ</title></Head>
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center">
          <div className="flex justify-center">
            <NotFoundIcon />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">404 - ไม่พบคำสั่งซื้อ</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">
            ขออภัย ไม่พบคำสั่งซื้อที่คุณกำลังค้นหา (ID: {orderIdFromQuery || "ไม่ระบุ"})
          </p>
          <Link 
            href="/orders" 
            className="inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeftIcon />
            กลับไปหน้ารายการคำสั่งซื้อ
          </Link>
        </div>
      </div>
    );
  }

  const storeName = "ชื่อร้านของคุณ";
  const canPay = order?.status === 'pending_payment' || order?.status === 'pending';
  const canCancel = ['pending', 'processing', 'pending_payment'].includes(order?.status);
  
  const firstOrderItemProductImage = order?.order_items?.[0]?.product?.images?.[0]?.path;
  const ogImageUrl = firstOrderItemProductImage ? `${baseApiUrl}/${firstOrderItemProductImage.replace(/^\.\//, '')}` : null;

  const getStatusIcon = () => {
    switch(order?.status) {
      case 'completed':
      case 'paid':
        return <CheckCircleIcon />;
      case 'cancelled':
      case 'failed':
        return <XCircleIcon />;
      case 'shipped':
        return <TruckIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const getStatusColor = () => {
    switch(order?.status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending_payment':
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100';
    }
  };

  return (
    <>
      <Head>
        <title>{`รายละเอียดคำสั่งซื้อ #${order?.ID || orderIdFromQuery} - ${storeName}`}</title>
        <meta name="description" content={`รายละเอียดสำหรับคำสั่งซื้อ #${order?.ID || orderIdFromQuery}`} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      </Head>
      
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            href="/orders" 
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors"
          >
            <ArrowLeftIcon />
            <span>กลับไปหน้ารายการคำสั่งซื้อ</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                คำสั่งซื้อ <span className="text-indigo-600 dark:text-indigo-400">#{order?.ID}</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                วันที่: {order?.CreatedAt ? new Date(order.CreatedAt).toLocaleString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : 'N/A'}
              </p>
            </div>
            
            <div className={`mt-3 sm:mt-0 px-3 py-1.5 rounded-full shadow-sm inline-flex items-center ${getStatusColor()}`}>
              <span className="mr-2">
                {getStatusIcon()}
              </span>
              <span>
                {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              รายการสินค้า
            </h2>
            
            <div className="space-y-4">
              {order?.order_items && order.order_items.length > 0 ? (
                order.order_items.map(item => {
                  const itemSubtotal = (item.price || 0) * (item.quantity || 0);
                  const primaryImageObject = item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null;
                  const imageUrl = primaryImageObject ? `${baseApiUrl}/${primaryImageObject.path.replace(/^\.\//, '')}` : placeholderImageUrl;
                  const productName = item.product?.name || 'Unknown Product';

                  return (
                    <div 
                      key={item.ID} 
                      className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-600">
                        {imageUrl === placeholderImageUrl ? (
                          <PlaceholderImageIcon />
                        ) : (
                          <Image 
                            src={imageUrl} 
                            alt={productName}
                            fill 
                            className="object-cover"
                            sizes="(max-width: 640px) 20vw, 96px"
                            onError={(e) => {
                              if (e.target.src !== placeholderImageUrl) {
                                e.target.srcset = placeholderImageUrl;
                                e.target.src = placeholderImageUrl;
                              }
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <Link 
                          href={`/products/${item.product_id || item.product?.ID}`} 
                          className="hover:underline"
                        >
                          <h3 
                            className="font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2" 
                            title={productName}
                          >
                            {productName}
                          </h3>
                        </Link>
                        
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          ราคา: {item.price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })} × {item.quantity}
                        </p>
                      </div>
                      
                      <p className="text-md font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {itemSubtotal.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-slate-500 dark:text-slate-400">ไม่พบรายการสินค้าในคำสั่งซื้อนี้</p>
                </div>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          {order?.Address && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                ที่อยู่จัดส่ง
              </h2>
              
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <address className="not-italic text-sm text-slate-600 dark:text-slate-300 space-y-2">
                  <p className="flex items-start">
                    <span className="font-semibold min-w-[80px]">ผู้รับ:</span>
                    <span>{order.Address.full_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold min-w-[80px]">ที่อยู่:</span>
                    <span>
                      {order.Address.addressLine1 || ''} {order.Address.addressLine2 || ''}
                      <br />
                      {order.Address.city || ''}, {order.Address.province || ''} {order.Address.zip_code && ` ${order.Address.zip_code}`}
                      <br />
                      {order.Address.country || ''}
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="font-semibold min-w-[80px]">โทรศัพท์:</span>
                    <span>{order.Address.phone || 'N/A'}</span>
                  </p>
                </address>
              </div>
            </section>
          )}
          
          {/* Order Summary */}
          <section className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              สรุปยอดชำระเงิน
            </h2>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between py-1">
                <span>ยอดรวมสินค้า:</span>
                <span>
                  {order?.total_price ? (order.total_price - (order.shipping_fee || 0)).toLocaleString('th-TH', { 
                    style: 'currency', 
                    currency: 'THB' 
                  }) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between py-1">
                <span>ค่าจัดส่ง:</span>
                <span>
                  {order?.shipping_fee ? order.shipping_fee.toLocaleString('th-TH', { 
                    style: 'currency', 
                    currency: 'THB' 
                  }) : 'ฟรี'}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-50 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <span>ยอดชำระทั้งสิ้น:</span>
                <span>
                  {order?.total_price ? order.total_price.toLocaleString('th-TH', { 
                    style: 'currency', 
                    currency: 'THB' 
                  }) : 'N/A'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              วิธีการชำระเงิน: {order?.payment_method || 'N/A'}
            </p>
          </section>

          {/* Error Messages */}
          {paymentError && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md text-sm text-center">
              {paymentError}
            </div>
          )}
          
          {cancelError && (
            <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md text-sm text-center">
              {cancelError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            {canPay && (
              <button 
                onClick={handlePayment} 
                disabled={paymentProcessing || isCancelling}
                className="flex-1 min-w-[200px] px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentProcessing ? (
                  <>
                    <LoadingSpinner />
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ยืนยันการชำระเงิน
                  </>
                )}
              </button>
            )}
            
            {canCancel && (
              <button 
                onClick={handleCancelOrder} 
                disabled={isCancelling || paymentProcessing}
                className="flex-1 min-w-[200px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <LoadingSpinner />
                    กำลังยกเลิก...
                  </>
                ) : (
                  <>
                    <XCircleIcon />
                    ยกเลิกคำสั่งซื้อ
                  </>
                )}
              </button>
            )}
            
            <Link 
              href="/orders" 
              className="flex-1 min-w-[200px] px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-md shadow-sm transition-colors text-center"
            >
              กลับไปหน้ารายการคำสั่งซื้อ
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps(context) {
  const { params } = context;
  const orderId = params?.orderId;
  let order = null;
  let error = null;

  if (!orderId || isNaN(parseInt(String(orderId)))) {
    error = "Order ID ไม่ถูกต้อง";
  } else {
    try {
      console.log(`[getStaticProps /orders/${orderId}] Fetching order details...`);
      order = await getOrderDetails(String(orderId)); 
      if (!order) {
        error = `ไม่พบคำสั่งซื้อสำหรับ ID: ${orderId}`;
        console.warn(`[getStaticProps /orders/${orderId}] Order not found from API.`);
      } else {
        console.log(`[getStaticProps /orders/${orderId}] Order fetched successfully.`);
      }
    } catch (e) {
      console.error(`[getStaticProps /orders/${orderId}] Error fetching order:`, e);
      error = e.message || "Could not load order details.";
    }
  }
  
  if (!order && !error && orderId) {
     console.log(`[getStaticProps /orders/${orderId}] Product not found, returning notFound: true.`);
     return { notFound: true };
  }

  return {
    props: {
      order, 
      error,
    },
    revalidate: 60,
  };
}

export default OrderDetailPage;