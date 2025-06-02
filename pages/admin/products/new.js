// pages/admin/products/new.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import ProductForm from '@/components/forms/ProductForm';
import { adminCreateProductWithImages, adminGetAllCategories } from '@/utils/adminProductService';

// --- Icons ---
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform">
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);
const LoadingSpinnerPage = () => (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);
// ---------------

const AddProductPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pageLoadError, setPageLoadError] = useState('');

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  const fetchAdminCategories = useCallback(async () => {
    if (isAuthenticated && isAdmin) {
      setLoadingCategories(true);
      setPageLoadError('');
      try {
        const cats = await adminGetAllCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setPageLoadError("ไม่สามารถโหลดหมวดหมู่สินค้าได้: " + err.message);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authIsLoading && isAuthenticated && isAdmin) {
      fetchAdminCategories();
    }
  }, [authIsLoading, isAuthenticated, isAdmin, fetchAdminCategories]);

  const handleAddProduct = async (productDataObject, imageFileObjects) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      await adminCreateProductWithImages(productDataObject, imageFileObjects);
      alert('เพิ่มสินค้าใหม่สำเร็จ!');
      router.push('/admin/products');
    } catch (err) {
      setFormError(err.message || 'ไม่สามารถเพิ่มสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";

  if (authIsLoading) { return <LoadingSpinnerPage />; }
  if (!isAuthenticated || !isAdmin) { return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageLoadError || "คุณไม่ได้รับอนุญาต"}</div>; }
  if (loadingCategories && !pageLoadError) { return <LoadingSpinnerPage />; }
  if (pageLoadError && categories.length === 0) {
    return (
      <div className="p-6 text-center bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{pageLoadError}</p>
        <button 
            onClick={fetchAdminCategories} 
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors"
            disabled={loadingCategories}
        >
          {loadingCategories ? 'กำลังโหลด...' : 'ลองโหลดหมวดหมู่ใหม่'}
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>เพิ่มสินค้าใหม่ - Admin Panel - {storeName}</title>
      </Head>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors">
            <ArrowLeftIcon />
            <span>กลับไปหน้ารายการสินค้า</span>
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        เพิ่มสินค้าใหม่เข้าระบบ
      </h1>
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl max-w-3xl mx-auto">
        <ProductForm 
            onSubmit={handleAddProduct}
            isLoading={isSubmitting}
            error={formError}
            categories={categories}
            loadingCategoriesForm={loadingCategories} // ส่งสถานะการโหลด Categories
            submitButtonText="เพิ่มสินค้า"
            cancelLink="/admin/products"
            initialData={{}} // ส่ง initialData เป็น object ว่างสำหรับ Add New mode
        />
      </div>
    </>
  );
};

const AddProductPage = () => {
  return <AddProductPageContent />;
}
AddProductPage.getLayout = function getLayout(page) {
  return <AdminLayout title="เพิ่มสินค้าใหม่">{page}</AdminLayout>;
};
export default AddProductPage;