// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard'; // ตรวจสอบ Path Alias ให้ถูกต้อง
import { fetchAllProducts } from '@/utils/productService'; // ตรวจสอบ Path Alias

const PRODUCTS_ON_HOMEPAGE = 8; // กำหนดจำนวนสินค้าที่จะแสดงในหน้าแรก

export async function getStaticProps() {
  let products = [];
  let error = null;
  let homepageProductsData = null; // ใช้ตัวแปรใหม่เพื่อเก็บ object ทั้งหมด

  try {
    // ดึงสินค้าหน้าแรก จำนวนจำกัด (เช่น 8 รายการ)
    // API ของคุณคือ GET /products?page=1&limit=X
    // และคืนค่า object ที่มี items, current_page, total_pages, total_items, per_page
    homepageProductsData = await fetchAllProducts(1, PRODUCTS_ON_HOMEPAGE);
    
    if (homepageProductsData && Array.isArray(homepageProductsData.items)) {
        products = homepageProductsData.items;
    } else {
        // ถ้า API ไม่ได้คืนค่าตามที่คาดหวัง (เช่น คืน array มาตรงๆ หรือโครงสร้างอื่น)
        // คุณอาจจะต้องปรับส่วนนี้ให้เข้ากับ response จริงของ API /products?page=1&limit=X
        console.warn("[getStaticProps /index] Unexpected data structure from fetchAllProducts for homepage:", homepageProductsData);
        // ลองตรวจสอบว่า homepageProductsData เป็น array โดยตรงหรือไม่
        if (Array.isArray(homepageProductsData)) {
            products = homepageProductsData.slice(0, PRODUCTS_ON_HOMEPAGE); // ถ้าเป็น array ตรงๆ ก็ slice เอา
        } else {
            products = []; // ถ้าไม่ ก็ให้เป็น array ว่าง
            error = "Could not retrieve products in the expected format.";
        }
    }
  } catch (e) {
    console.error("Error in getStaticProps for index page:", e);
    error = e.message || "Could not load products for the homepage.";
    products = []; // เผื่อกรณี error
  }

  return {
    props: {
      // ส่งเฉพาะ array สินค้าไปให้ component
      // ข้อมูล pagination อาจจะไม่จำเป็นสำหรับหน้าแรก ถ้าแสดงแค่ชุดเดียว
      products, 
      error,
    },
    revalidate: 300, // สร้างหน้าใหม่ทุกๆ 5 นาที (ISR)
  };
}

export default function HomePage({ products, error }) {
  const storeName = "ชื่อร้านของคุณ"; // หรือดึงมาจาก config/env หรือ context

  return (
    <>
      <Head>
        <title>{`ยินดีต้อนรับสู่ ${storeName} - สินค้าคุณภาพ`}</title>
        <meta name="description" content="เลือกซื้อสินค้าหลากหลายประเภท คุณภาพดี ราคาพิเศษ ที่ Luxe Collections" />
        {/* สามารถเพิ่ม Open Graph tags สำหรับ Social Media sharing ได้ที่นี่ */}
        <meta property="og:title" content={`ยินดีต้อนรับสู่ ${storeName}`} />
        <meta property="og:description" content="เลือกซื้อสินค้าหลากหลายประเภท คุณภาพดี ราคาพิเศษ ที่ Luxe Collections" />
        {/* <meta property="og:image" content="/images/og-homepage.jpg" />  ตัวอย่าง OG Image */}
        {/* <meta property="og:url" content="URL ของเว็บไซต์คุณ" /> */}
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white py-16 sm:py-20 px-6 rounded-xl shadow-2xl mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            เปิดประสบการณ์ช้อปปิ้งสุดพิเศษ!
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-indigo-100 dark:text-purple-200">
            สินค้าคุณภาพเยี่ยม โปรโมชั่นสุดคุ้ม และบริการที่ประทับใจ รอคุณอยู่ที่นี่
          </p>
          <Link href="/products" className="inline-block bg-white text-indigo-700 dark:bg-slate-100 dark:text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-opacity-90 dark:hover:bg-slate-200 transition-all duration-300 transform hover:scale-105 text-lg">
              เลือกซื้อสินค้าเลย
          </Link>
        </section>

        {/* Featured Products Section */}
        <section>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              สินค้าแนะนำสำหรับคุณ
            </h2>
            <p className="mt-2 text-md text-slate-600 dark:text-slate-400">
              คัดสรรมาเพื่อตอบโจทย์ทุกไลฟ์สไตล์
            </p>
          </div>
          
          {error && (
            <div className="text-center py-10">
                <p className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-md">เกิดข้อผิดพลาด: {error}</p>
            </div>
          )}

          {!error && products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
              {products.map((product) => (
                <ProductCard key={product.ID} product={product} />
              ))}
            </div>
          ) : (
            !error && <p className="text-center text-slate-500 dark:text-slate-400 py-10">ยังไม่มีสินค้าแนะนำในขณะนี้ กรุณาตรวจสอบอีกครั้งภายหลัง</p>
          )}

           {/* ปุ่มไปยังหน้าสินค้าทั้งหมด (ถ้ามีสินค้าแสดง) */}
           {!error && products && products.length > 0 && products.length >= PRODUCTS_ON_HOMEPAGE && ( // แสดงปุ่มถ้าดึงสินค้ามาเต็ม limit
             <div className="mt-12 text-center">
                <Link href="/products" className="px-8 py-3 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-base">
                    ดูสินค้าทั้งหมด &rarr;
                </Link>
             </div>
           )}
        </section>

        {/* คุณสามารถเพิ่ม Section อื่นๆ ที่นี่ได้ เช่น: */}
        {/* <section className="mt-16 py-12 bg-slate-50 dark:bg-slate-800 rounded-lg"> */}
        {/* <h2 className="text-2xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-8">หมวดหมู่ยอดนิยม</h2> */}
        {/* {/* ... UI แสดงหมวดหมู่ ... */}
        {/* </section> */}

        {/* <section className="mt-16 py-12"> */}
        {/* <h2 className="text-2xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-8">ทำไมต้องเลือกเรา?</h2> */}
        {/* {/* ... UI แสดงจุดเด่นของร้าน ... */}
        {/* </section> */}

      </main>
    </>
  );
}