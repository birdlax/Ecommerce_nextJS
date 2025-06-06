// pages/admin/products/index.js
import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext'; // ตรวจสอบ Path Alias
import AdminLayout from '@/components/Layout/AdminLayout'; // ตรวจสอบ Path Alias
import {
    adminGetAllProducts,
    adminDeleteProduct,
    adminGetAllCategories,
    adminGetProductsByCategory
} from '@/utils/adminProductService'; // ตรวจสอบ Path Alias

const PRODUCTS_PER_PAGE_ADMIN = 10; // หรือจำนวนที่คุณต้องการสำหรับ Admin Panel

// --- Icons (ตัวอย่าง) ---
const RefreshIcon = ({isLoading = false}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" />
    </svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);
const PlaceholderImageIcon = () => ( // Icon สำหรับ Placeholder
    <svg className="w-full h-full text-slate-400 dark:text-slate-500 p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
// --------------------------

const ProductRow = ({ product, onDelete, currentAdminId }) => {
    // --- VVVVVV การจัดการรูปภาพ VVVVVV ---
    const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;
    const placeholderProductImage = '/images/placeholder-product-thumb.png'; // สร้างไฟล์นี้ใน public/images

    const primaryImageObject = product.images && product.images.length > 0
                               ? product.images[0] // เอารูปแรก
                               : null;
    const imageUrl = primaryImageObject
                     ? `${baseApiUrl}/${primaryImageObject.path.replace(/^\.\//, '')}`
                     : placeholderProductImage; // ใช้ Placeholder ถ้าไม่มีรูป
    // --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ---

    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
        <td className="px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">{product.ID}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex items-center justify-center">
              {/* --- VVVVVV แสดงรูปภาพโดยใช้ imageUrl ที่สร้างขึ้น VVVVVV --- */}
              <Image 
                src={imageUrl} 
                alt={product.name || 'Product Image'} 
                width={40} 
                height={40} 
                className="object-cover"
                onError={(e) => { // Fallback ถ้าโหลดรูปไม่ได้
                    if (e.target.src !== placeholderProductImage) {
                        e.target.srcset = placeholderProductImage;
                        e.target.src = placeholderProductImage;
                    }
                }}
              />
              {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-200 font-medium truncate max-w-[150px] sm:max-w-xs" title={product.name}>
              {product.name || 'N/A'}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {product.category?.name || 'N/A'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-right">
          {product.price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) || 'N/A'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-center">{product.quantity ?? 'N/A'}</td>
        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-3">
          <Link href={`/admin/products/edit/${product.ID}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            แก้ไข
          </Link>
          <button onClick={() => onDelete(product.ID, product.name)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">ลบ</button>
        </td>
      </tr>
    );
};

const ManageProductsPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin, user: adminUser } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: PRODUCTS_PER_PAGE_ADMIN,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(router.query.category || '');

  const [loadingData, setLoadingData] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const initialLoadPerformed = useRef(false);

  const fetchAdminCategories = useCallback(async () => {
    if (isAuthenticated && isAdmin) {
      try {
        const cats = await adminGetAllCategories(); // API: GET /admin/categories/
        setCategories(Array.isArray(cats) ? cats : []);
        console.log("[AdminProductsPage] Categories Fetched:", cats);
        return true;
      } catch (err) {
        console.error("[AdminProductsPage] Failed to fetch categories:", err);
        setPageError(prev => prev ? `${prev}\nCould not load categories.` : 'Could not load categories.');
        return false;
      }
    }
    return false;
  }, [isAuthenticated, isAdmin]);

  const fetchAdminProducts = useCallback(async (page = 1, categoryId = '') => {
    if (isAuthenticated && isAdmin) {
      setLoadingData(true);
      setPageError(null);
      try {
        let data;
        if (categoryId && String(categoryId).trim() !== '') {
          data = await adminGetProductsByCategory(categoryId, page, PRODUCTS_PER_PAGE_ADMIN); // API: GET /admin/categories/filter/:id
        } else {
          data = await adminGetAllProducts(page, PRODUCTS_PER_PAGE_ADMIN); // API: GET /admin/products
        }
        setProducts(data?.items || []);
        setPaginationData({
          currentPage: data?.current_page || page,
          totalPages: data?.total_pages || 1,
          totalItems: data?.total_items || 0,
          perPage: data?.per_page || PRODUCTS_PER_PAGE_ADMIN,
        });
        console.log("[AdminProductsPage] Products Fetched:", data);
      } catch (err) {
        console.error("[AdminProductsPage] Failed to fetch products:", err);
        setPageError(err.message || 'Could not load products list.');
        setProducts([]);
        setPaginationData(prev => ({ ...prev, currentPage: page, totalPages: 1, totalItems: 0 }));
      } finally {
        setLoadingData(false);
      }
    } else {
      setProducts([]);
      setLoadingData(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      } else if (!initialLoadPerformed.current) {
        setLoadingData(true);
        Promise.all([fetchAdminCategories(), fetchAdminProducts(parseInt(router.query.page) || 1, router.query.category || '')])
          .then(() => { initialLoadPerformed.current = true; })
          .catch(err => console.error("[AdminProductsPage] Error during initial data load:", err))
          // setLoadingData(false) is handled in fetchAdminProducts
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router, fetchAdminCategories, fetchAdminProducts]);

  useEffect(() => {
    const pageFromQuery = parseInt(router.query.page) || 1;
    const categoryFromQuery = (Array.isArray(router.query.category) ? router.query.category[0] : router.query.category) || '';

    if (router.isReady && initialLoadPerformed.current && (!authIsLoading && isAuthenticated && isAdmin)) {
      if (pageFromQuery !== paginationData.currentPage || categoryFromQuery !== selectedCategoryId) {
        fetchAdminProducts(pageFromQuery, categoryFromQuery);
      }
      if (categoryFromQuery !== selectedCategoryId) {
        setSelectedCategoryId(categoryFromQuery);
      }
    }
  }, [router.query, router.isReady, authIsLoading, isAuthenticated, isAdmin, fetchAdminProducts, selectedCategoryId, paginationData.currentPage]);

  const handleCategoryChange = (event) => {
    const newCategoryId = event.target.value;
    router.push(`/admin/products?page=1${newCategoryId ? `&category=${newCategoryId}` : ''}`, undefined, { shallow: false });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages && newPage !== paginationData.currentPage) {
      router.push(`/admin/products?page=${newPage}${selectedCategoryId ? `&category=${selectedCategoryId}` : ''}`, undefined, { shallow: false });
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!productId) {
        console.error("Delete Error: Product ID is missing.");
        setActionMessage({ type: 'error', text: 'Product ID ไม่ถูกต้อง ไม่สามารถลบได้' });
        return;
    }
    if (!window.confirm(`คุณต้องการลบสินค้า "${productName || 'Product'}" (ID: ${productId}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
        return;
    }

    setActionMessage({ type: '', text: '' }); // เคลียร์ message เก่า
    setLoadingData(true); // หรือจะใช้ isDeleting state แยกต่างหาก
    try {
        console.log(`[AdminProductsPage] Attempting to delete product ID: ${productId}`);
        await adminDeleteProduct(String(productId)); // เรียก service function
        setActionMessage({ type: 'success', text: `สินค้า "${productName || 'Product'}" (ID: ${productId}) ถูกลบเรียบร้อยแล้ว` });
        
        // Refresh รายการสินค้าหลังจากลบสำเร็จ (อาจจะอยู่ที่หน้าปัจจุบัน หรือไปหน้าแรก)
        // ถ้าต้องการให้ refresh หน้าปัจจุบัน และ pagination อาจจะเปลี่ยน (เช่น ลบ item สุดท้ายของหน้า)
        // อาจจะต้องมี logic คำนวณหน้าใหม่ที่จะไป
        let newPageToFetch = paginationData.currentPage;
        if (products.length === 1 && paginationData.currentPage > 1) { // ถ้าเป็น item สุดท้ายของหน้าที่ไม่ใช่หน้าแรก
            newPageToFetch = paginationData.currentPage - 1;
        }
        
        // ถ้ามีการ filter category อยู่ ให้ส่ง category id ไปด้วย
        const currentCategoryFilter = router.query.category || ''; 
        await fetchAdminProducts(newPageToFetch, String(currentCategoryFilter)); 

        // อัปเดต URL ถ้าหน้าเปลี่ยน
        if (newPageToFetch !== paginationData.currentPage) {
            router.push(`/admin/products?page=${newPageToFetch}${currentCategoryFilter ? `&category=${currentCategoryFilter}` : ''}`, undefined, { shallow: true });
        }

    } catch (err) {
        console.error(`[AdminProductsPage] Failed to delete product ID ${productId}:`, err);
        setActionMessage({ type: 'error', text: err.message || `เกิดข้อผิดพลาดในการลบสินค้า "${productName || 'Product'}"` });
        setLoadingData(false); // หยุด loading ถ้า error
    }
    // setLoadingData(false) จะถูกเรียกใน finally ของ fetchAdminProducts ถ้าสำเร็จ
  };

  const storeName = "ชื่อร้านของคุณ";

  if (authIsLoading || (loadingData && !initialLoadPerformed.current)) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError || "คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้"}</div>;
  }
  if (pageError && products.length === 0 && categories.length === 0 && !loadingData) {
      return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError}</div>;
  }

  return (
    <>
      <Head>
        <title>จัดการสินค้า - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          {selectedCategoryId && categories.find(c => String(c.ID) === selectedCategoryId)
              ? `สินค้าในหมวดหมู่: ${categories.find(c => String(c.ID) === selectedCategoryId).name}`
              : "รายการสินค้าทั้งหมด"
          }
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex-grow sm:flex-grow-0 sm:w-56">
                <label htmlFor="categoryFilter" className="sr-only">กรองตามหมวดหมู่</label>
                <select
                    id="categoryFilter"
                    name="categoryFilter"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    disabled={categories.length === 0 || loadingData}
                    className="block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer h-full transition-colors"
                >
                    <option value="">ทุกหมวดหมู่</option>
                    {categories.map(cat => (
                        <option key={cat.ID} value={String(cat.ID)}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <button
                onClick={() => fetchAdminProducts(paginationData.currentPage, selectedCategoryId)}
                disabled={loadingData}
                title="Refresh"
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
                <RefreshIcon isLoading={loadingData} />
                {loadingData && products.length > 0 ? 'กำลังรีเฟรช...' : (loadingData ? 'กำลังโหลด...' : 'รีเฟรช')}
            </button>
            <Link href="/admin/products/new" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors">
                <PlusIcon />
                เพิ่มสินค้าใหม่
            </Link>
        </div>
      </div>

      {pageError && (!loadingData || products.length === 0) && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg">{pageError}</div>}
      {actionMessage.text && <div className={`mb-4 p-4 text-sm rounded-lg ${actionMessage.type === 'success' ? 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30' : 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30'}`}>{actionMessage.text}</div>}

      {!loadingData && products.length === 0 && !pageError && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <p className="text-slate-500 dark:text-slate-400">
                {selectedCategoryId ? 'ไม่พบสินค้าในหมวดหมู่นี้' : 'ไม่พบสินค้าในระบบ'}
            </p>
            {selectedCategoryId && (
                <button onClick={() => handleCategoryChange({ target: { value: '' }})} className="mt-4 text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                    แสดงสินค้าทั้งหมด
                </button>
            )}
        </div>
      )}

      {products.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">สินค้า</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">หมวดหมู่</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider text-right">ราคา</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider text-center">จำนวน</th>
                <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {products.map((p) => (
                <ProductRow key={p.ID} product={p} onDelete={handleDeleteProduct} currentUser={adminUser} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination UI (ปรับปรุงให้ใช้ paginationData) */}
      {paginationData && paginationData.totalPages > 1 && products.length > 0 && !pageError && (
        <nav aria-label="Pagination" className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2 text-sm">
          <button
            onClick={() => handlePageChange(paginationData.currentPage - 1)}
            disabled={paginationData.currentPage <= 1 || loadingData}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>&laquo;
          </button>
          {[...Array(paginationData.totalPages).keys()].map(num => {
              const pageNum = num + 1;
              const isCurrent = paginationData.currentPage === pageNum;
              const showPage = paginationData.totalPages <= 7 || pageNum === 1 || pageNum === paginationData.totalPages || (pageNum >= paginationData.currentPage - 1 && pageNum <= paginationData.currentPage + 1) || (paginationData.currentPage <= 3 && pageNum <= 4) || (paginationData.currentPage >= paginationData.totalPages - 2 && pageNum >= paginationData.totalPages - 3);
              const showEllipsisBefore = paginationData.totalPages > 7 && pageNum === paginationData.currentPage - 2 && paginationData.currentPage > 3;
              const showEllipsisAfter = paginationData.totalPages > 7 && pageNum === paginationData.currentPage + 2 && paginationData.currentPage < paginationData.totalPages - 2;
              if (showPage) {
                  return ( <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={loadingData || isCurrent} aria-current={isCurrent ? "page" : undefined} className={`px-3 py-2 border rounded-md transition-colors min-w-[36px] ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 cursor-default' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50'}`}> {pageNum} </button> );
              }
              if(showEllipsisBefore || showEllipsisAfter) { return <span key={`ellipsis-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
              return null;
          })}
          <button
            onClick={() => handlePageChange(paginationData.currentPage + 1)}
            disabled={paginationData.currentPage >= paginationData.totalPages || loadingData}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>&raquo;
          </button>
        </nav>
      )}
    </>
  );
};

// --- Page Component หลัก และ getLayout ---
// ใช้ ManageProductsPageContent เป็น default export โดยตรง หรือจะ wrap ก็ได้
// เพื่อความง่าย ผมจะ export ManageProductsPageContent โดยตรง และใส่ getLayout ให้มัน
ManageProductsPageContent.getLayout = function getLayout(page) {
  return <AdminLayout title="จัดการสินค้า">{page}</AdminLayout>;
};

export default ManageProductsPageContent; // Export content component โดยตรง