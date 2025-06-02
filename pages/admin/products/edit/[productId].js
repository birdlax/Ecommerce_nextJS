// pages/admin/products/edit/[productId].js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import ProductForm from '@/components/forms/ProductForm'; // Import ProductForm ที่เราสร้างไว้
import {
    adminGetProductById,
    adminUpdateProduct,
    adminGetAllCategories
} from '@/utils/adminProductService'; // ตรวจสอบ Path Alias

// --- Icons (Optional, for UI consistency) ---
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);
// ------------------------------------

const EditProductPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { productId } = router.query; // productId จาก URL

  // initialProductData จะเก็บข้อมูลสินค้าเดิมที่ดึงมาเพื่อ pre-fill
  const [initialProductData, setInitialProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true); // สำหรับโหลดข้อมูลสินค้าและ categories ครั้งแรก
  const [isSubmitting, setIsSubmitting] = useState(false); // สำหรับตอน submit form
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Function to fetch product details and categories
  const fetchProductAndCategories = useCallback(async (id) => {
    if (isAuthenticated && isAdmin && id && typeof id === 'string' && id.trim() !== '') {
      setLoadingPage(true);
      setFormError('');
      setSuccessMessage('');
      try {
        console.log(`[AdminEditProduct] Fetching product (ID: ${id}) and categories.`);
        const [productDataResponse, categoriesDataResponse] = await Promise.all([
          adminGetProductById(id), // API: GET /admin/product/:id
          adminGetAllCategories()    // API: GET /admin/categories/
        ]);

        if (productDataResponse) {
          // แปลง category_id ที่ได้จาก productData (ถ้าเป็น number) ให้เป็น string
          // เพื่อให้ <select> ใน ProductForm สามารถ pre-select ค่าได้ถูกต้อง
          const productWithStrCategoryId = {
              ...productDataResponse,
              category_id: productDataResponse.category_id ? String(productDataResponse.category_id) : ''
          };
          setInitialProductData(productWithStrCategoryId);
          console.log("[AdminEditProduct] Product details fetched for edit:", productWithStrCategoryId);
        } else {
          setFormError(`ไม่พบข้อมูลสินค้าสำหรับ ID: ${id}`);
        }
        setCategories(Array.isArray(categoriesDataResponse) ? categoriesDataResponse : []);
        console.log("[AdminEditProduct] Categories fetched:", categoriesDataResponse);
        
      } catch (err) {
        console.error("Admin: Failed to fetch product/categories for edit:", err);
        setFormError(err.message || 'ไม่สามารถโหลดข้อมูลสินค้าหรือหมวดหมู่ได้');
      } finally {
        setLoadingPage(false);
      }
    } else {
        if (isAuthenticated && isAdmin && router.isReady && (!id || id.trim() === '')) {
            setFormError("Product ID ไม่ถูกต้องหรือไม่พบใน URL");
        }
        setLoadingPage(false); // หยุด loading ถ้าเงื่อนไขไม่พร้อม
    }
  }, [isAuthenticated, isAdmin, router.isReady]); // router.isReady สำคัญเพื่อให้แน่ใจว่า query params พร้อม

  // Effect 1: Route Protection
  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        const redirectPath = isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`;
        router.replace(redirectPath);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  // Effect 2: Fetch data when productId is available and auth is ready
  useEffect(() => {
    // ตรวจสอบ router.isReady เพื่อให้แน่ใจว่า router.query (ที่มี productId) มีค่าแล้ว
    if (router.isReady && productId && typeof productId === 'string' && productId.trim() !== '') {
      if (isAuthenticated && isAdmin && !authIsLoading) { // ตรวจสอบ auth state ด้วย
        fetchProductAndCategories(productId);
      }
    } else if (router.isReady && (!productId || productId.trim() === '') && isAuthenticated && isAdmin && !authIsLoading) {
        // ถ้า router พร้อม, admin login อยู่ แต่ไม่มี productId หรือ productId ว่างเปล่า
        setFormError("ไม่พบ Product ID ใน URL หรือ Product ID ไม่ถูกต้อง");
        setLoadingPage(false);
    }
  }, [router.isReady, productId, isAuthenticated, isAdmin, authIsLoading, fetchProductAndCategories]);


  const handleUpdateProduct = async (formData) => {
    if (!productId) {
        setFormError("Product ID ไม่ถูกต้อง ไม่สามารถอัปเดตได้");
        return;
    }
    setIsSubmitting(true);
    setFormError('');
    setSuccessMessage('');
    try {
      // formData ที่มาจาก ProductForm ควรจะมีการแปลงค่า price, quantity, category_id เป็น number แล้ว
      // ถ้า ProductForm ไม่ได้แปลง, คุณจะต้องแปลงที่นี่ก่อนส่ง dataToUpdate
      const dataToUpdate = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity, 10) || 0,
        image_url: formData.image_url,
        category_id: parseInt(formData.category_id, 10),
      };
      console.log(`[AdminEditProduct] Submitting update for product ID ${productId}:`, dataToUpdate);
      await adminUpdateProduct(productId, dataToUpdate); // API: PUT /admin/product/:id
      setSuccessMessage('อัปเดตข้อมูลสินค้าสำเร็จ!');
      // Optional: อาจจะ fetch ข้อมูลใหม่เพื่อให้ฟอร์มแสดงข้อมูลล่าสุดจริงๆ
      // หรือ redirect กลับไปหน้ารายการสินค้าเพื่อให้เห็นผลการอัปเดต
      // fetchProductAndCategories(productId); 
      // router.push('/admin/products'); // ตัวอย่างการ redirect
    } catch (err) {
      console.error("Admin: Failed to update product:", err);
      setFormError(err.message || 'ไม่สามารถอัปเดตสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----- UI Rendering Logic -----
  const storeName = "ชื่อร้านของคุณ"; // หรือดึงมาจาก config

  if (authIsLoading || (!router.isReady && !formError && !initialProductData) ) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{formError || "คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้"}</div>;
  }
  // แสดง loading ถ้ากำลัง fetch ข้อมูลสินค้าและยังไม่มี initialProductData หรือยังไม่มี error
  if (loadingPage && !initialProductData && !formError) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลสินค้า...</div>;
  }
  // ถ้ามี pageError (จากการโหลดข้อมูลครั้งแรก) และยังไม่มี initialProductData
  if (formError && !initialProductData && !loadingPage) {
      return (
        <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">เกิดข้อผิดพลาด</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">{formError}</p>
            <Link href="/admin/products" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                กลับไปหน้ารายการสินค้า
            </Link>
        </div>
      );
  }
  // ถ้าโหลดเสร็จแล้ว แต่ API คืนค่า productData เป็น null/undefined (เช่น ID ผิด) และ formError ถูกตั้งจาก fetch
  if (!loadingPage && !initialProductData && formError) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">{formError} (ID: {productId || "N/A"}) <Link href="/admin/products" className="text-indigo-600">กลับ</Link></div>;
  }


  return (
    <>
      <Head>
        <title>แก้ไขสินค้า #{productId} - Admin Panel - {storeName}</title>
      </Head>
      <div className="mb-6">
        <Link href="/admin/products" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors">
            <ArrowLeftIcon />
            <span>กลับไปหน้ารายการสินค้า</span>
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        แก้ไขข้อมูลสินค้า (ID: <span className="text-indigo-500 dark:text-indigo-400">{productId}</span>)
      </h1>
      
      {successMessage && <p className="mb-6 p-4 text-sm text-center text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30 rounded-lg">{successMessage}</p>}
      
      {/* แสดง ProductForm เมื่อมี initialProductData และ categories พร้อมแล้ว */}
      {initialProductData && categories.length >= 0 && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl max-w-3xl mx-auto"> {/* เพิ่ม max-w-3xl */}
            <ProductForm 
                initialData={initialProductData}
                onSubmit={handleUpdateProduct} 
                isLoading={isSubmitting}
                error={formError} // ส่ง formError (error จากการ submit) ไปให้ ProductForm
                categories={categories}
                submitButtonText="บันทึกการเปลี่ยนแปลง"
                cancelLink="/admin/products"
            />
        </div>
      )}
      {/* แสดง loading หรือ error message ถ้า initialProductData หรือ categories ยังไม่พร้อม */}
      {!initialProductData && !loadingPage && !formError && (
          <p className="text-center text-slate-500 dark:text-slate-400">ไม่พบข้อมูลสินค้าที่จะแก้ไข หรือกำลังโหลดหมวดหมู่</p>
      )}
    </>
  );
};

// --- Page Component หลัก และ getLayout ---
const EditProductPageWrapper = () => {
  // ส่วนนี้สามารถใช้สำหรับ Logic เพิ่มเติมที่อยู่นอก Page Content ได้ถ้าต้องการ
  // แต่ในกรณีนี้ เราให้ EditUserPageContent เป็นตัวจัดการหลัก
  return <EditProductPageContent />;
}

EditProductPageWrapper.getLayout = function getLayout(page) {
  return <AdminLayout title="แก้ไขสินค้า">{page}</AdminLayout>;
};

export default EditProductPageWrapper;