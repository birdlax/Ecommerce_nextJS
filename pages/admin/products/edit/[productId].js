// pages/admin/products/edit/[productId].js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import ProductForm from '@/components/forms/ProductForm';
import {
    adminGetProductById,
    adminUpdateProduct,
    adminGetAllCategories
} from '@/utils/adminProductService';

// --- Icons ---
const ArrowLeftIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg> );
const LoadingSpinnerPage = () => ( <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="flex items-center"><svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="ml-3 text-lg text-slate-700 dark:text-slate-300">กำลังโหลด...</p></div><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">กรุณารอสักครู่</p></div> );
const ErrorIconMessage = ({ message }) => ( <div className="p-6 text-center bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md mx-auto"><div className="flex justify-center mb-4"><svg className="w-16 h-16 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">เกิดข้อผิดพลาด</h2><p className="text-slate-700 dark:text-slate-300 mb-6">{message}</p><Link href="/admin/products" className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"><ArrowLeftIcon /> กลับไปหน้ารายการสินค้า</Link></div> );
// ---------------

const EditProductPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { productId } = router.query;

  const [initialProductData, setInitialProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pageLoadError, setPageLoadError] = useState('');

  const fetchProductAndCategories = useCallback(async (id) => {
    if (!isAuthenticated || !isAdmin || !id || typeof id !== 'string' || id.trim() === '') {
      if (isAuthenticated && isAdmin && router.isReady && (!id || id.trim() === '')) {
        setPageLoadError("Product ID ไม่ถูกต้อง หรือไม่ได้ระบุใน URL");
      }
      setLoadingPage(false); return;
    }
    setLoadingPage(true); setPageLoadError(''); setSuccessMessage(''); setFormError('');
    try {
      const [productDataResponse, categoriesDataResponse] = await Promise.all([
        adminGetProductById(id),
        adminGetAllCategories()
      ]);

      if (productDataResponse) {
        setInitialProductData({
            ...productDataResponse,
            category_id: productDataResponse.category_id ? String(productDataResponse.category_id) : '',
            images: productDataResponse.images || []
        });
        console.log("[AdminEditProduct] Product for edit:", productDataResponse);
      } else {
        setPageLoadError(`ไม่พบข้อมูลสินค้าสำหรับ ID: ${id}`);
      }
      setCategories(Array.isArray(categoriesDataResponse) ? categoriesDataResponse : []);
    } catch (err) {
      setPageLoadError(err.message || 'ไม่สามารถโหลดข้อมูลสินค้าหรือหมวดหมู่ได้');
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
    if (router.isReady && productId && typeof productId === 'string' && productId.trim() !== '') {
      if (isAuthenticated && isAdmin && !authIsLoading) {
        fetchProductAndCategories(productId);
      }
    } else if (router.isReady && !productId && isAuthenticated && isAdmin && !authIsLoading) {
      setPageLoadError("ไม่พบ Product ID ใน URL");
      setLoadingPage(false);
    }
  }, [router.isReady, productId, isAuthenticated, isAdmin, authIsLoading, fetchProductAndCategories]);

  const handleUpdateProduct = async (productDataObject, newImageFileObjects, pathsOfKeptExistingImages) => {
    if (!productId) { setFormError("Product ID ไม่ถูกต้อง"); return; }
    setIsSubmitting(true); setFormError(''); setSuccessMessage('');
    try {
      console.log(`[AdminEditProduct] Updating product ID ${productId}.`);
      console.log("Data:", productDataObject);
      if (newImageFileObjects?.length > 0) console.log("New Images to Upload:", newImageFileObjects.length);
      if (pathsOfKeptExistingImages?.length > 0) console.log("Paths of Kept Existing Images:", pathsOfKeptExistingImages);
      
      // API PUT /admin/product/:id รับ FormData
      // โดยมี field 'images' (สำหรับไฟล์ใหม่) และ 'keep_images' (array of paths ของรูปเดิมที่เก็บไว้)
      await adminUpdateProduct(productId, productDataObject, newImageFileObjects, pathsOfKeptExistingImages);
      
      setSuccessMessage('อัปเดตข้อมูลสินค้าสำเร็จ!');
      // alert('อัปเดตข้อมูลสินค้าสำเร็จ!');
      // fetchProductAndCategories(productId); // Optional: Re-fetch
      router.push('/admin/products'); 
    } catch (err) {
      setFormError(err.message || 'ไม่สามารถอัปเดตสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";

  if (authIsLoading || (!router.isReady && !pageLoadError && !initialProductData)) { return <LoadingSpinnerPage />; }
  if (!isAuthenticated || !isAdmin) { return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageLoadError || "คุณไม่ได้รับอนุญาต"}</div>; }
  if (loadingPage && !initialProductData && !pageLoadError) { return <LoadingSpinnerPage />; }
  if (pageLoadError && !initialProductData && !loadingPage) { return <ErrorIconMessage message={pageLoadError} />; }
  if (!loadingPage && !initialProductData && router.isReady && !pageLoadError) {
    return <ErrorIconMessage message={`ไม่พบข้อมูลสินค้าสำหรับ ID: ${productId || "N/A"}. อาจจะถูกลบไปแล้ว`} />;
  }
  
  return (
    <>
      <Head>
        <title>แก้ไขสินค้า #{productId} - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors">
            <ArrowLeftIcon /><span>กลับไปหน้ารายการสินค้า</span>
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        แก้ไขข้อมูลสินค้า (ID: <span className="text-indigo-500 dark:text-indigo-400">{productId}</span>)
      </h1>
      
      {successMessage && (
        <div className="mb-6 p-4 text-sm text-center text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30 rounded-lg shadow">
          {successMessage}
        </div>
      )}
      
      {initialProductData && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl max-w-3xl mx-auto">
            <ProductForm 
                initialData={initialProductData}
                onSubmit={handleUpdateProduct}
                isLoading={isSubmitting}
                error={formError}
                categories={categories}
                loadingCategoriesForm={loadingPage} // ส่ง loadingPage ไปให้ form คุม disable select
                isEditMode={true}
                submitButtonText="บันทึกการเปลี่ยนแปลง"
                cancelLink="/admin/products"
            />
        </div>
      )}
    </>
  );
};

const EditProductPage = () => <EditProductPageContent />;
EditProductPage.getLayout = function getLayout(page) { return <AdminLayout title="แก้ไขสินค้า">{page}</AdminLayout>; };
export default EditProductPage;