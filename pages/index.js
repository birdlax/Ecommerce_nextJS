// pages/index.js
import Head from 'next/head';
// สมมติว่าคุณมี Component สำหรับแสดง Product Card และฟังก์ชันสำหรับดึงข้อมูลสินค้า
import ProductCard from '../components/ProductCard'; // หรือ Path ที่ถูกต้อง
import { fetchAllProducts } from '../utils/productService'; // หรือ Path ที่ถูกต้อง

// getStaticProps เพื่อดึงข้อมูลสินค้ามาแสดงในหน้าแรก
export async function getStaticProps() {
  let products = [];
  let error = null;

  try {
    const fetchedData = await fetchAllProducts(); // เรียกใช้ helper function ที่คุณสร้าง
    products = fetchedData.products || []; // ให้ default เป็น array ว่าง
    error = fetchedData.error || null;
  } catch (e) {
    console.error("Error in getStaticProps for index page:", e);
    error = "Could not load products for the homepage.";
  }

  return {
    props: {
      products,
      error,
    },
    revalidate: 300, // Optional: สร้างหน้าใหม่ทุกๆ 5 นาที (300 วินาที)
  };
}

export default function HomePage({ products, error }) {
  return (
    <>
      <Head>
        <title>{`ยินดีต้อนรับสู่ My store - สินค้าคุณภาพ`}</title>
        <meta name="description" content="เลือกซื้อสินค้าหลากหลายประเภท คุณภาพดี ราคาพิเศษ ที่นี่ที่เดียว" />
        {/* สามารถเพิ่ม Open Graph tags สำหรับ Social Media sharing ได้ที่นี่ */}
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* ส่วน Hero Banner (ตัวอย่าง) */}
        <section className="bg-indigo-600 text-white py-12 px-6 rounded-lg shadow-lg mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">เปิดประสบการณ์ช้อปปิ้งออนไลน์ที่ดีที่สุด!</h1>
          <p className="text-lg mb-6">สินค้าคุณภาพ โปรโมชั่นสุดคุ้ม รอคุณอยู่ที่นี่</p>
          <a
            href="/products" // หรือใช้ <Link> component
            className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-md hover:bg-indigo-100 transition-colors"
          >
            เลือกซื้อสินค้าเลย
          </a>
        </section>

        {/* ส่วนแสดงสินค้า */}
        <section>
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-8 text-center">
            สินค้าของเรา
          </h2>
          {error && (
            <p className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</p>
          )}
          {!error && products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.ID} product={product} />
              ))}
            </div>
          ) : (
            !error && <p className="text-center text-slate-500">ยังไม่มีสินค้าในขณะนี้</p>
          )}
        </section>

        {/* ส่วนอื่นๆ ที่คุณต้องการเพิ่ม เช่น Categories, Testimonials ฯลฯ */}

      </main>
    </>
  );
}