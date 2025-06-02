// pages/admin/orders/index.js
import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // ตรวจสอบ Path Alias
import AdminLayout from '@/components/Layout/AdminLayout'; // ตรวจสอบ Path Alias
import { adminGetAllOrders, adminDeleteOrder } from '@/utils/adminService'; // ตรวจสอบ Path Alias

const ORDERS_PER_PAGE_ADMIN = 10;

// --- Icons ---
const RefreshIcon = ({ isLoading = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" />
    </svg>
);
const SortAscIcon = () => <svg className="w-3 h-3 ml-1 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>;
const SortDescIcon = () => <svg className="w-3 h-3 ml-1 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>;
// ---------------

const OrderRow = ({ order }) => {
    const orderDate = order.CreatedAt ? new Date(order.CreatedAt) : null;
    const customerName = order.Address?.full_name || `User ID: ${order.user_id}`;
    const totalPrice = order.total_price;
    const status = order.status || 'N/A';

    let statusColorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-200';
    if (status === 'completed' || status === 'paid') {
        statusColorClass = 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100';
    } else if (status === 'pending' || status === 'processing' || status === 'pending_payment') {
        statusColorClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100';
    } else if (status === 'cancelled' || status === 'failed') {
        statusColorClass = 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100';
    }

    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
            <Link href={`/admin/orders/edit/${order.ID}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                #{order.ID}
            </Link>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300" title={`User ID: ${order.user_id}`}>
          {customerName}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {orderDate ? orderDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 text-right">
          {totalPrice?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) || 'N/A'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
          <Link href={`/admin/orders/edit/${order.ID}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            ดู/แก้ไข
          </Link>
          {/* Optional: ปุ่มลบ Order (ถ้าต้องการ)
          <button 
            onClick={() => onDelete(order.ID, `#${order.ID}`)} // onDelete ต้องถูกส่งมาจาก ManageOrdersPage
            className="ml-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            ลบ
          </button> 
          */}
        </td>
      </tr>
    );
};

// --- Component หลักของหน้า ---
const ManageOrdersPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0, perPage: ORDERS_PER_PAGE_ADMIN,
  });
  const [sortField, setSortField] = useState('CreatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loadingPageData, setLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const initialLoadPerformed = useRef(false);

  const fetchAdminOrders = useCallback(async (page = 1, sField = 'CreatedAt', sOrder = 'desc') => {
    if (isAuthenticated && isAdmin) {
      console.log(`[AdminOrdersPage] Fetching orders. Page: ${page}, Sort: ${sField} ${sOrder}, Limit: ${ORDERS_PER_PAGE_ADMIN}`);
      setLoadingPageData(true);
      setPageError(null);
      try {
        const data = await adminGetAllOrders(page, ORDERS_PER_PAGE_ADMIN, sField, sOrder);
        setOrders(data?.items || []);
        setPaginationData({
          currentPage: data?.current_page || page,
          totalPages: data?.total_pages || 1,
          totalItems: data?.total_items || 0,
          perPage: data?.per_page || ORDERS_PER_PAGE_ADMIN,
        });
        console.log("[AdminOrdersPage] Orders Fetched:", data);
      } catch (err) {
        console.error("[AdminOrdersPage] Failed to fetch orders:", err);
        setPageError(err.message || 'Could not load orders list.');
        setOrders([]);
        setPaginationData(prev => ({ ...prev, currentPage: page, totalPages: 1, totalItems: 0 }));
      } finally {
        setLoadingPageData(false);
      }
    } else {
      setOrders([]); 
      setLoadingPageData(false);
    }
  }, [isAuthenticated, isAdmin]);


  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (!initialLoadPerformed.current) {
        const pageFromQuery = parseInt(String(router.query.page)) || 1; // Ensure string for parseInt
        const sortFieldFromQuery = String(router.query.sort || 'CreatedAt');
        const sortOrderFromQuery = String(router.query.order || 'desc');
        
        if(sortFieldFromQuery !== sortField) setSortField(sortFieldFromQuery);
        if(sortOrderFromQuery !== sortOrder) setSortOrder(sortOrderFromQuery);

        console.log(`[AdminOrdersPage] Performing initial data load. Page: ${pageFromQuery}, Sort: ${sortFieldFromQuery} ${sortOrderFromQuery}`);
        fetchAdminOrders(pageFromQuery, sortFieldFromQuery, sortOrderFromQuery);
        initialLoadPerformed.current = true;
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router, fetchAdminOrders, sortField, sortOrder]); // Removed router.asPath to prevent excessive re-runs if only hash changes

  useEffect(() => {
    const pageFromQuery = parseInt(String(router.query.page)) || 1;
    const sortFieldFromQuery = String(router.query.sort || 'CreatedAt');
    const sortOrderFromQuery = String(router.query.order || 'desc');

    if (router.isReady && initialLoadPerformed.current && (!authIsLoading && isAuthenticated && isAdmin)) {
      if (pageFromQuery !== paginationData.currentPage || 
          sortFieldFromQuery !== sortField || 
          sortOrderFromQuery !== sortOrder) {
        console.log(`[AdminOrdersPage] Query changed. Page: ${pageFromQuery}, Sort: ${sortFieldFromQuery} ${sortOrderFromQuery}. Refetching orders.`);
        
        if (sortFieldFromQuery !== sortField) setSortField(sortFieldFromQuery);
        if (sortOrderFromQuery !== sortOrder) setSortOrder(sortOrderFromQuery);
        
        fetchAdminOrders(pageFromQuery, sortFieldFromQuery, sortOrderFromQuery);
      }
    }
  }, [router.query, router.isReady, authIsLoading, isAuthenticated, isAdmin, fetchAdminOrders, paginationData.currentPage, sortField, sortOrder]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages && newPage !== paginationData.currentPage) {
      router.push(`/admin/orders?page=${newPage}&sort=${sortField}&order=${sortOrder}`, undefined, { shallow: false });
    }
  };

  const handleSort = (newSortField) => {
    const newSortOrder = (sortField === newSortField && sortOrder === 'asc') ? 'desc' : 'asc';
    router.push(`/admin/orders?page=1&sort=${newSortField}&order=${newSortOrder}`, undefined, { shallow: false });
  };
  
  const handleDeleteOrder = async (orderId, orderIdentifier) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ "${orderIdentifier || `ID: ${orderId}`}"? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
    
    setActionMessage({ type: '', text: ''});
    // setLoadingPageData(true); // อาจจะใช้ state แยก
    try {
        // await adminDeleteOrder(orderId); // <--- Uncomment และ import ถ้าต้องการใช้จริง
        // setActionMessage({ type: 'success', text: `คำสั่งซื้อ "${orderIdentifier}" ถูกลบแล้ว` });
        alert(`(Mock) การลบ Order "${orderIdentifier}" ยังไม่ได้ Implement Service Call`);
        // fetchAdminOrders(paginationData.currentPage, sortField, sortOrder);
    } catch (err) {
        console.error("Admin: Failed to delete order:", err);
        setActionMessage({ type: 'error', text: err.message || `ไม่สามารถลบคำสั่งซื้อ "${orderIdentifier}" ได้` });
    } finally {
        // setLoadingPageData(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";
  const headerCellClass = "px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors select-none";

  if (authIsLoading || (loadingPageData && !initialLoadPerformed.current)) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError || "คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้"}</div>;
  }
  if (pageError && orders.length === 0 && !loadingPageData) {
      return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError}</div>;
  }

  return (
    <>
      <Head>
        <title>จัดการคำสั่งซื้อ - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          รายการคำสั่งซื้อทั้งหมด ({paginationData.totalItems || 0})
        </h1>
        <button 
            onClick={() => fetchAdminOrders(paginationData.currentPage, sortField, sortOrder)} 
            disabled={loadingPageData} 
            className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
            <RefreshIcon isLoading={loadingPageData} />
            {loadingPageData && orders.length > 0 ? 'กำลังรีเฟรช...' : (loadingPageData ? 'กำลังโหลด...' : 'รีเฟรช')}
        </button>
      </div>

      {actionMessage.text && (
        <div className={`mb-4 p-4 text-sm rounded-lg ${
            actionMessage.type === 'success' ? 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30' 
                                           : 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30'
        }`}>{actionMessage.text}</div>
      )}
      {pageError && !loadingPageData && orders.length === 0 && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg">{pageError}</div>}

      {orders.length === 0 && !pageError && !loadingPageData && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <p className="text-slate-500 dark:text-slate-400">ไม่พบคำสั่งซื้อในระบบ</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className={headerCellClass} onClick={() => handleSort('ID')}>ID {sortField === 'ID' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}</th>
                <th className={headerCellClass}>ผู้สั่งซื้อ</th>
                <th className={headerCellClass} onClick={() => handleSort('CreatedAt')}>วันที่สั่งซื้อ {sortField === 'CreatedAt' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}</th>
                <th className={`${headerCellClass} text-right`} onClick={() => handleSort('total_price')}>ยอดรวม {sortField === 'total_price' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}</th>
                <th className={`${headerCellClass} text-center`} onClick={() => handleSort('status')}>สถานะ {sortField === 'status' && (sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />)}</th>
                <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {orders.map((order) => (
                <OrderRow key={order.ID} order={order} /* onDelete={handleDeleteOrder} */ />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination UI */}
      {paginationData && paginationData.totalPages > 1 && orders.length > 0 && !pageError && (
        <nav aria-label="Pagination" className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2 text-sm">
          <button onClick={() => handlePageChange(paginationData.currentPage - 1)} disabled={paginationData.currentPage <= 1 || loadingPageData} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">&laquo;</button>
          {[...Array(paginationData.totalPages).keys()].map(num => {
              const pageNum = num + 1;
              const isCurrent = paginationData.currentPage === pageNum;
              // ปรับปรุง Logic การแสดง Page Numbers ให้กระชับขึ้น
              const showPage = paginationData.totalPages <= 7 || // show all if 7 or less
                               pageNum === 1 || 
                               pageNum === paginationData.totalPages || 
                               (Math.abs(pageNum - paginationData.currentPage) <= 1) || // current and +-1
                               (paginationData.currentPage <= 3 && pageNum <= 4) || // near beginning
                               (paginationData.currentPage >= paginationData.totalPages - 2 && pageNum >= paginationData.totalPages - 3); // near end

              const showEllipsisStart = paginationData.totalPages > 7 && pageNum === 2 && paginationData.currentPage > 4;
              const showEllipsisEnd = paginationData.totalPages > 7 && pageNum === paginationData.totalPages - 1 && paginationData.currentPage < paginationData.totalPages - 3;
              
              if (showPage) { return ( <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={loadingPageData || isCurrent} aria-current={isCurrent ? "page" : undefined} className={`px-3 py-2 border rounded-md transition-colors min-w-[38px] ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 cursor-default' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50'}`}> {pageNum} </button> ); }
              if(showEllipsisStart && pageNum < paginationData.currentPage) { return <span key={`ellipsis-start-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
              if(showEllipsisEnd && pageNum > paginationData.currentPage) { return <span key={`ellipsis-end-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
              return null;
          })}
          <button onClick={() => handlePageChange(paginationData.currentPage + 1)} disabled={paginationData.currentPage >= paginationData.totalPages || loadingPageData} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">&raquo;</button>
        </nav>
      )}
    </>
  );
};

// กำหนด getLayout ให้กับ ManageOrdersPage component โดยตรง
ManageOrdersPage.getLayout = function getLayout(page){
    return <AdminLayout title="จัดการคำสั่งซื้อ">{page}</AdminLayout>;
}

export default ManageOrdersPage; // Export Component หลัก