// pages/products/index.js
import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image'; // ถ้า ProductCard ใช้
import ProductCard from '@/components/ProductCard'; // ตรวจสอบ Path Alias
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import {
    fetchAllProducts,
    getAllCategories, // ฟังก์ชันสำหรับดึง Public Categories
    getProductsByCategory
} from '@/utils/productService'; // ตรวจสอบ Path Alias

const PRODUCTS_PER_PAGE = 12;

// --- Helper Components ---
const FilterSidebar = ({
    categories,
    selectedCategoryId,
    onCategoryChange,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    onApplyFilters,
    isLoading
}) => {
    const handleMinPriceChange = (e) => setMinPrice(e.target.value);
    const handleMaxPriceChange = (e) => setMaxPrice(e.target.value);
    const inputClass = "block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 transition-colors";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5";
    const buttonClass = "w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60";

    return (
        <aside className="w-full md:w-64 lg:w-72 p-4 md:p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl mb-6 md:mb-0 md:mr-8 self-start sticky top-24 md:top-28">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-3 dark:border-slate-700">หมวดหมู่สินค้า</h3>
            <select
                value={selectedCategoryId}
                onChange={onCategoryChange}
                disabled={isLoading || !categories || categories.length === 0}
                className={`${inputClass} mb-6 cursor-pointer`}
            >
                <option value="">ทุกหมวดหมู่</option>
                {categories?.map(cat => (
                    <option key={cat.ID} value={String(cat.ID)}>{cat.name}</option>
                ))}
            </select>

            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-3 dark:border-slate-700">กรองตามราคา</h3>
            <div className="space-y-4 mb-6">
                <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">ราคาต่ำสุด (บาท)</label>
                    <input type="number" id="minPrice" value={minPrice} onChange={handleMinPriceChange} placeholder="เช่น 0" min="0"
                           className={`mt-1 ${inputClass.replace('cursor-pointer', '')}`} />
                </div>
                <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">ราคาสูงสุด (บาท)</label>
                    <input type="number" id="maxPrice" value={maxPrice} onChange={handleMaxPriceChange} placeholder="เช่น 5000" min="0"
                           className={`mt-1 ${inputClass.replace('cursor-pointer', '')}`} />
                </div>
            </div>
            <button
                onClick={onApplyFilters}
                disabled={isLoading}
                className={buttonClass}
            >
                ใช้ตัวกรอง
            </button>
        </aside>
    );
};

const SortDropdown = ({ currentSortValue, onSortChange, isLoading }) => {
    const sortOptions = [
        { value: 'CreatedAt_desc', label: 'ใหม่ล่าสุด' },
        { value: 'price_asc', label: 'ราคา: น้อยไปมาก' },
        { value: 'price_desc', label: 'ราคา: มากไปน้อย' },
        { value: 'name_asc', label: 'ชื่อ: A-Z' },
        { value: 'name_desc', label: 'ชื่อ: Z-A' },
    ];
    return (
        <div className="relative md:w-60">
            <label htmlFor="sortOptions" className="sr-only">เรียงตาม</label>
            <select
                id="sortOptions"
                value={currentSortValue}
                onChange={onSortChange}
                disabled={isLoading}
                className="block w-full appearance-none px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer h-full"
            >
                {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};

const RefreshIcon = ({ isLoading = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" />
    </svg>
);
// ---------------

const ProductsListPage = ({
  initialProducts,
  initialPagination,
  initialCategories,
  initialSelectedCategory,
  error: ssgError // Error จาก getStaticProps (ถ้ามี)
}) => {
  // VVVVVV ดึง authIsLoading จาก useAuth() VVVVVV
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const router = useRouter();

  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [paginationData, setPaginationData] = useState(
    initialPagination || { currentPage: 1, totalPages: 1, totalItems: 0, perPage: PRODUCTS_PER_PAGE }
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialSelectedCategory || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortField, setSortField] = useState('CreatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loadingData, setLoadingData] = useState(!initialProducts && !ssgError);
  const [pageError, setPageError] = useState(ssgError || null);

  const isMounted = useRef(false);

  const fetchProducts = useCallback(async (page, categoryId, sField, sOrder, minP, maxP) => {
    console.log(`[ProductsPage] Fetching products. Page: ${page}, Cat: '${categoryId || 'ALL'}', Sort: ${sField} ${sOrder}, Price: ${minP}-${maxP}, Limit: ${PRODUCTS_PER_PAGE}`);
    setLoadingData(true);
    setPageError(null);
    try {
      let data;
      if (categoryId) {
        data = await getProductsByCategory(categoryId, page, PRODUCTS_PER_PAGE, sField, sOrder, minP, maxP);
      } else {
        data = await fetchAllProducts(page, PRODUCTS_PER_PAGE, sField, sOrder, minP, maxP);
      }
      setProducts(data?.items || []);
      setPaginationData({
        currentPage: data?.current_page || page,
        totalPages: data?.total_pages || 1,
        totalItems: data?.total_items || 0,
        perPage: data?.per_page || PRODUCTS_PER_PAGE,
      });
      console.log("[ProductsPage] Client: Products and Pagination Data Fetched:", data);
    } catch (err) {
      console.error("[ProductsPage] Client: Failed to fetch products:", err);
      setPageError(err.message || 'Could not load products.');
      setProducts([]);
      setPaginationData(prev => ({ ...prev, totalPages: 1, totalItems: 0, currentPage: page }));
    } finally {
      setLoadingData(false);
    }
  }, []); // Dependencies ว่างเปล่า, params จะถูกส่งเข้ามา

  useEffect(() => {
    const loadCategories = async () => {
      if ((!categories || categories.length === 0) && (!initialCategories || initialCategories.length === 0)) {
        // ไม่ต้อง set loadingData ที่นี่ เพราะการโหลดหลักคือ products
        try {
          const cats = await getAllCategories();
          setCategories(Array.isArray(cats) ? cats : []);
        } catch (err) { console.error("Client: Failed to load categories:", err); }
      }
    };
    // เรียก loadCategories เมื่อ component mount หรือเมื่อ initialCategories เปลี่ยน (แต่ไม่ควรเปลี่ยนบ่อย)
    if (isMounted.current || (!initialCategories || initialCategories.length === 0)) {
        loadCategories();
    }
  }, [initialCategories, categories]);

  // ปรับปรุง useEffect หลักเพื่อแก้ปัญหา sort และ pagination
  useEffect(() => {
    if (!router.isReady) return;

    const queryPage = parseInt(String(router.query.page)) || 1;
    const queryCategory = String(router.query.category || '');
    const queryMinPrice = String(router.query.min_price || '');
    const queryMaxPrice = String(router.query.max_price || '');
    const querySortField = String(router.query.sort || 'CreatedAt');
    const querySortOrder = String(router.query.order || 'desc');

    // อัพเดท state ให้ตรงกับ URL query ทันที (เพื่อให้ UI แสดงถูกต้อง)
    setSelectedCategoryId(queryCategory);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
    setSortField(querySortField);
    setSortOrder(querySortOrder);
    
    if (isMounted.current) {
        console.log("[ProductsPage] Client-side navigation/filter change - Fetching data.");
        fetchProducts(queryPage, queryCategory, querySortField, querySortOrder, queryMinPrice, queryMaxPrice);
    } else {
      // Initial client-side render
      if (ssgError || !initialProducts || initialProducts.length === 0 ||
          queryPage !== (initialPagination?.currentPage || 1) ||
          queryCategory !== (initialSelectedCategory || '') ||
          queryMinPrice !== '' || queryMaxPrice !== '' ||
          querySortField !== 'CreatedAt' || querySortOrder !== 'desc'
      ) {
        if (!ssgError) { // Only fetch if there was no SSG error
             console.log("[ProductsPage] Initial client render, conditions not met by SSG props or query params differ. Fetching.");
             fetchProducts(queryPage, queryCategory, querySortField, querySortOrder, queryMinPrice, queryMaxPrice);
        } else {
            setLoadingData(false); // SSG had an error, don't keep loading
        }
      } else {
         console.log("[ProductsPage] Using data from getStaticProps for initial render.");
         setLoadingData(false); // SSG data is already there
      }
      isMounted.current = true;
    }
  }, [router.query, router.isReady, fetchProducts]); // Main effect depends on query and fetcher

  // ปรับปรุง updateRouterQuery ให้ใช้ shallow routing
  const updateRouterQuery = (newParams = {}, resetPage = true) => {
    const currentRouterQuery = { ...router.query };
    let queryToUpdate = {};

    if (resetPage) {
      queryToUpdate.page = '1';
    } else if (currentRouterQuery.page) {
      queryToUpdate.page = currentRouterQuery.page;
    }

    // Preserve existing or use new, using current state as a base before newParams override
    queryToUpdate.category = newParams.category !== undefined ? newParams.category : selectedCategoryId;
    queryToUpdate.min_price = newParams.min_price !== undefined ? newParams.min_price : minPrice;
    queryToUpdate.max_price = newParams.max_price !== undefined ? newParams.max_price : maxPrice;
    queryToUpdate.sort = newParams.sort !== undefined ? newParams.sort : sortField;
    queryToUpdate.order = newParams.order !== undefined ? newParams.order : sortOrder;
    
    queryToUpdate = { ...queryToUpdate, ...newParams };
        
    Object.keys(queryToUpdate).forEach(key => 
        (queryToUpdate[key] === null || queryToUpdate[key] === undefined || queryToUpdate[key] === '') && delete queryToUpdate[key]
    );
    
    // ใช้ shallow routing เพื่อป้องกันการ re-mount component
    router.push({ pathname: '/products', query: queryToUpdate }, undefined, { shallow: true });
  };

  const handleApplyFilters = () => {
    updateRouterQuery({ 
        category: selectedCategoryId, 
        min_price: minPrice, 
        max_price: maxPrice,
        // Sort will be picked up from current sort state by updateRouterQuery
    }, true);
  };
  
  const handleCategoryChange = (event) => {
    setSelectedCategoryId(event.target.value);
    // We will rely on the "Apply Filters" button to trigger the URL update and fetch
  };

  // ปรับปรุง handleSortChange เพื่อแก้ปัญหาการไม่เปลี่ยน sort
  const handleSortChange = (event) => {
    const [field, orderValue] = event.target.value.split('_');
    console.log(`[ProductsPage] Sort changed to: ${field}_${orderValue}`);
    
    // อัพเดท state ทันที
    setSortField(field);
    setSortOrder(orderValue);
    
    // จากนั้นอัพเดท URL ซึ่งจะ trigger useEffect
    updateRouterQuery({ sort: field, order: orderValue }, true); // reset page เมื่อเปลี่ยน sort
  };

  const handlePageChange = (newPage) => {
    console.log(`[ProductsPage] Page change requested: ${newPage}, current: ${paginationData.currentPage}`);
    if (newPage >= 1 && newPage <= paginationData.totalPages && newPage !== paginationData.currentPage) {
        updateRouterQuery({ page: String(newPage) }, false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";

  // ----- UI Rendering Logic -----
  if (authIsLoading && !initialProducts) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-slate-700 dark:text-slate-300">กำลังเตรียมหน้าสินค้า...</p></div>;
  }
  if (ssgError && (!products || products.length === 0)) {
      return <div className="min-h-screen flex items-center justify-center text-red-500 dark:text-red-400">เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น: {ssgError}</div>;
  }
  if (loadingData && products.length === 0 && !pageError) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-slate-700 dark:text-slate-300">กำลังโหลดรายการสินค้า...</p></div>;
  }

  return (
    <>
      <Head>
        <title>สินค้าทั้งหมด - {storeName}</title>
        <meta name="description" content={`เลือกซื้อสินค้าทั้งหมดคุณภาพดีจาก ${storeName}`} />
      </Head>
      <main className="container mx-auto px-2 sm:px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <FilterSidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onApplyFilters={handleApplyFilters}
            isLoading={loadingData}
          />
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 self-start sm:self-center">
                {selectedCategoryId && categories.find(c => String(c.ID) === selectedCategoryId)
                    ? `สินค้าใน: ${categories.find(c => String(c.ID) === selectedCategoryId).name}`
                    : "สินค้าทั้งหมด"
                } 
                <span className="text-base font-normal text-slate-500 dark:text-slate-400 ml-2">({paginationData.totalItems} รายการ)</span>
              </h1>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SortDropdown 
                    currentSortValue={`${sortField}_${sortOrder}`}
                    onSortChange={handleSortChange}
                    isLoading={loadingData}
                />
                <button
                    onClick={() => fetchProducts(paginationData.currentPage, selectedCategoryId, sortField, sortOrder, minPrice, maxPrice)}
                    disabled={loadingData}
                    title="Refresh"
                    className="p-2.5 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                >
                    <RefreshIcon isLoading={loadingData} />
                </button>
              </div>
            </div>

            {pageError && !loadingData && (
              <div className="w-full text-center text-red-600 dark:text-red-400 my-8 p-4 bg-red-50 dark:bg-red-900/30 rounded-md shadow">
                <p className="font-semibold">เกิดข้อผิดพลาด:</p>
                <p>{pageError}</p>
              </div>
            )}
            {!loadingData && products.length === 0 && !pageError && (
              <div className="w-full text-center text-slate-500 dark:text-slate-300 my-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
                ไม่พบสินค้าที่ตรงกับเงื่อนไข
                {(selectedCategoryId || minPrice || maxPrice) && (
                    <button 
                        onClick={() => {
                            updateRouterQuery({category:'', min_price:'', max_price:''}, true);
                        }} 
                        className="block mx-auto mt-4 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        ล้างตัวกรองทั้งหมด
                    </button>
                )}
              </div>
            )}

            {products.length > 0 && (
              <div className="grid grid-cols-1 gap-y-8 gap-x-6 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:gap-x-6 mb-12">
                {products.map((product) => (
                  <ProductCard key={product.ID} product={product} />
                ))}
              </div>
            )}

            {paginationData && paginationData.totalPages > 1 && products.length > 0 && !pageError && (
              <nav aria-label="Pagination" className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2 text-sm">
                <button onClick={() => handlePageChange(paginationData.currentPage - 1)} disabled={paginationData.currentPage <= 1 || loadingData} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">&laquo;</button>
                {[...Array(paginationData.totalPages).keys()].map(num => {
                    const pageNum = num + 1;
                    const isCurrent = paginationData.currentPage === pageNum;
                    const showPage = paginationData.totalPages <= 7 || pageNum === 1 || pageNum === paginationData.totalPages || (Math.abs(pageNum - paginationData.currentPage) <= 1) || (paginationData.currentPage <= 3 && pageNum <= 4) || (paginationData.currentPage >= paginationData.totalPages - 2 && pageNum >= paginationData.totalPages - 3);
                    const showEllipsisStart = paginationData.totalPages > 7 && pageNum === 2 && paginationData.currentPage > 4 && !(Math.abs(1 - paginationData.currentPage) <= 2);
                    const showEllipsisEnd = paginationData.totalPages > 7 && pageNum === paginationData.totalPages - 1 && paginationData.currentPage < paginationData.totalPages - 3 && !(Math.abs(paginationData.totalPages - paginationData.currentPage) <= 2) ;
                    
                    if (showPage) { return ( <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={loadingData || isCurrent} aria-current={isCurrent ? "page" : undefined} className={`px-3 py-2 border rounded-md transition-colors min-w-[38px] ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 cursor-default' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50'}`}> {pageNum} </button> ); }
                    if(showEllipsisStart && pageNum < paginationData.currentPage) { return <span key={`ellipsis-start-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
                    if(showEllipsisEnd && pageNum > paginationData.currentPage) { return <span key={`ellipsis-end-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
                    return null;
                })}
                <button onClick={() => handlePageChange(paginationData.currentPage + 1)} disabled={paginationData.currentPage >= paginationData.totalPages || loadingData} className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">&raquo;</button>
              </nav>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

// --- getStaticProps (เหมือนเดิม) ---
export async function getStaticProps(context) {
  const initialPage = 1;
  const initialLimit = PRODUCTS_PER_PAGE;
  const initialSortField = 'CreatedAt';
  const initialSortOrder = 'desc';
  const initialMinPrice = '';
  const initialMaxPrice = '';
  const initialCategoryIdFromStatic = '';

  let productsApiResponse = { items: [], current_page: initialPage, total_pages: 1, total_items: 0, per_page: initialLimit };
  let categoriesApiResponse = [];
  let error = null;

  try {
    const [categoriesResult, productsResult] = await Promise.all([
        getAllCategories().catch(e => { console.error("GSP Error fetching categories:", e); return []; }),
        fetchAllProducts(initialPage, initialLimit, initialSortField, initialSortOrder, initialMinPrice, initialMaxPrice)
            .catch(e => { console.error("GSP Error fetching products:", e); return null; })
    ]);
    categoriesApiResponse = Array.isArray(categoriesResult) ? categoriesResult : [];
    if (productsResult && Array.isArray(productsResult.items)) {
      productsApiResponse = productsResult;
    } else {
      error = productsResult === null ? "Failed to load initial products." : "Unexpected product data format.";
      productsApiResponse = { items: [], current_page: 1, total_pages: 1, total_items: 0, per_page: initialLimit };
    }
  } catch (err) {
    error = err.message || "Failed to load data.";
  }

  return {
    props: {
      initialProducts: productsApiResponse.items,
      initialPagination: {
        currentPage: productsApiResponse.current_page,
        totalPages: productsApiResponse.total_pages,
        totalItems: productsApiResponse.total_items,
        perPage: productsApiResponse.per_page,
      },
      initialCategories: categoriesApiResponse,
      initialSelectedCategory: initialCategoryIdFromStatic,
      error,
    },
    revalidate: 300,
  };
}

export default ProductsListPage;