// pages/new-arrivals.js
import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProductCard from '@/components/ProductCard'; // ตรวจสอบ Path Alias
import { useAuth } from '@/contexts/AuthContext'; // ถ้าต้องการ
import { fetchNewArrivalProducts } from '@/utils/productService'; // <--- ใช้ Service Function ใหม่

const PRODUCTS_PER_PAGE_NEW_ARRIVALS = 12; // จำนวนสินค้าใหม่ต่อหน้า (ถ้ามีการแบ่งหน้า)

const NewArrivalsPage = ({
    initialProductsData, // Prop จาก getStaticProps (ถ้าใช้)
    error: initialPageError
}) => {
  const router = useRouter();
  // const { isAuthenticated, isLoading: authIsLoading } = useAuth(); // อาจจะไม่จำเป็นถ้าเป็นหน้า Public

  const [products, setProducts] = useState(initialProductsData?.items || []);
  const [paginationData, setPaginationData] = useState(
    initialProductsData || { 
        currentPage: 1, totalPages: 1, totalItems: 0, perPage: PRODUCTS_PER_PAGE_NEW_ARRIVALS 
    }
  );
  const [loadingPageData, setLoadingPageData] = useState(!initialProductsData);
  const [pageError, setPageError] = useState(initialPageError || null);

  const initialLoadRef = useRef(!!initialProductsData);

  // Function to fetch new arrival products
  const fetchNewArrivals = useCallback(async (page = 1) => {
    console.log(`[NewArrivalsPage] Fetching new arrivals. Page: ${page}`);
    setLoadingPageData(true);
    setPageError(null);
    try {
      // API ของคุณสำหรับ New Arrivals ควรจะคืนค่าโครงสร้างเดียวกับ /products (มี items, pagination info)
      const data = await fetchNewArrivalProducts(page, PRODUCTS_PER_PAGE_NEW_ARRIVALS);
      
      setProducts(data?.items || []);
      setPaginationData({
        currentPage: data?.current_page || page,
        totalPages: data?.total_pages || 1,
        totalItems: data?.total_items || 0,
        perPage: data?.per_page || PRODUCTS_PER_PAGE_NEW_ARRIVALS,
      });
      console.log("[NewArrivalsPage] New arrivals fetched:", data);

    } catch (err) {
      console.error("[NewArrivalsPage] Failed to fetch new arrivals:", err);
      setPageError(err.message || 'Could not load new arrivals.');
      setProducts([]);
      setPaginationData({ currentPage: 1, totalPages: 1, totalItems: 0, perPage: PRODUCTS_PER_PAGE_NEW_ARRIVALS });
    } finally {
      setLoadingPageData(false);
    }
  }, []);


  // Effect to handle initial load and page changes from router query
  useEffect(() => {
    const pageFromQuery = parseInt(router.query.page) || 1;
    if (router.isReady) {
      if (initialLoadRef.current) {
        if (!initialProductsData?.items || (pageFromQuery !== (initialProductsData?.current_page || 1))) {
          fetchNewArrivals(pageFromQuery);
        } else {
          // ใช้ initial data
          setProducts(initialProductsData.items);
          setPaginationData({
            currentPage: initialProductsData.current_page,
            totalPages: initialProductsData.total_pages,
            totalItems: initialProductsData.total_items,
            perPage: initialProductsData.per_page,
          });
          setPageError(initialPageError);
          setLoadingPageData(false);
        }
        initialLoadRef.current = false;
      } else {
        if (pageFromQuery !== paginationData.currentPage) {
          fetchNewArrivals(pageFromQuery);
        }
      }
    }
  }, [router.query, router.isReady, fetchNewArrivals, initialProductsData, initialPageError, paginationData.currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages && newPage !== paginationData.currentPage) {
      router.push(`/new-arrivals?page=${newPage}`, undefined, { shallow: false });
    }
  };

  const storeName = "ชื่อร้านของคุณ";

  if (loadingPageData && products.length === 0 && !pageError && !initialProductsData?.items) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-slate-700 dark:text-slate-300">กำลังโหลดสินค้ามาใหม่...</p></div>;
  }
  if (initialPageError && (!products || products.length === 0)) {
      return <div className="text-center py-10 text-red-500 dark:text-red-400">เกิดข้อผิดพลาดในการโหลดข้อมูลเริ่มต้น: {initialPageError}</div>;
  }

  return (
    <>
      <Head>
        <title>สินค้ามาใหม่ - {storeName}</title>
        <meta name="description" content={`พบกับสินค้ามาใหม่ล่าสุดจาก ${storeName} อัปเดตทุกวัน`} />
      </Head>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
                สินค้ามาใหม่ล่าสุด
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                อัปเดตคอลเลคชั่นใหม่ๆ ที่คุณไม่ควรพลาด
            </p>
        </div>

        {pageError && !loadingPageData && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg text-center">
                เกิดข้อผิดพลาดในการโหลดสินค้า: {pageError}
            </div>
        )}

        {!loadingPageData && products.length === 0 && !pageError && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V7.875c0-.621.504-1.125 1.125-1.125H9.75V4.875c0-.621.504-1.125 1.125-1.125H13.5c.621 0 1.125.504 1.125 1.125V6.75z" />
            </svg>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
                ยังไม่มีสินค้ามาใหม่ในขณะนี้
            </p>
            <Link href="/products" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 mb-12">
            {products.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {paginationData && paginationData.totalPages > 1 && products.length > 0 && !pageError && (
          <nav aria-label="Pagination" className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2 text-sm">
            {/* ... (โค้ด Pagination UI เหมือนใน pages/products/index.js) ... */}
             <button onClick={() => handlePageChange(paginationData.currentPage - 1)} disabled={paginationData.currentPage <= 1 || loadingPageData} className="px-3 py-2 ...">&laquo;</button>
            {[...Array(paginationData.totalPages).keys()].map(num => { /* ... */ })}
            <button onClick={() => handlePageChange(paginationData.currentPage + 1)} disabled={paginationData.currentPage >= paginationData.totalPages || loadingPageData} className="px-3 py-2 ...">&raquo;</button>
          </nav>
        )}
      </main>
    </>
  );
};


export async function getStaticProps(context) {
  // สำหรับหน้า New Arrivals, เราจะดึงข้อมูลหน้าแรกของสินค้าใหม่มาเป็น initial props
  const initialPage = 1;
  const limit = PRODUCTS_PER_PAGE_NEW_ARRIVALS;

  let productsData = { items: [], current_page: initialPage, total_pages: 1, total_items: 0, per_page: limit };
  let error = null;

  try {
    console.log("[getStaticProps /new-arrivals] Fetching initial new arrival products (page 1)...");
    const apiResponse = await fetchNewArrivalProducts(initialPage, limit);

    if (apiResponse && Array.isArray(apiResponse.items)) {
      productsData = {
        items: apiResponse.items,
        current_page: apiResponse.current_page || initialPage,
        totalPages: apiResponse.total_pages || Math.ceil((apiResponse.total_items || apiResponse.items.length) / limit) || 1,
        totalItems: apiResponse.total_items || apiResponse.items.length,
        perPage: apiResponse.per_page || limit,
      };
    } else if (apiResponse === null && !error) { // fetchNewArrivalProducts อาจจะคืน null ถ้า API ตอบ 204
        console.warn("[getStaticProps /new-arrivals] No new arrivals found or API returned no content.");
    } else if (!apiResponse && !error) {
      console.warn("[getStaticProps /new-arrivals] Initial new arrivals data response is not in expected format or null:", apiResponse);
      error = "Unexpected format for initial new arrivals data.";
    }
  } catch (err) {
    console.error("[getStaticProps /new-arrivals] Error fetching initial data:", err);
    error = err.message || "Failed to load initial data for new arrivals page.";
  }

  return {
    props: {
      initialProductsData: productsData, // ส่ง object ทั้งก้อน
      error,
      // initialCategoriesData: [], // หน้านี้อาจจะไม่ต้องใช้ categories filter
      // initialSelectedCategoryQuery: '',
    },
    revalidate: 300, // Revalidate ทุก 5 นาที
  };
}

export default NewArrivalsPage;