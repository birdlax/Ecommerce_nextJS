// pages/products/index.js
import Head from 'next/head';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard'; // ปรับ path ให้ถูกต้อง
import { fetchAllProducts } from '../../utils/productService'; // ปรับ path ให้ถูกต้อง
import { useState, useEffect } from 'react'; // Import useState และ useEffect

export async function getStaticProps() {
  const { products, error: productsError } = await fetchAllProducts();

  let categories = [];
  if (products && products.length > 0) {
    // สร้าง list ของ categories ที่ไม่ซ้ำกันจากข้อมูล products
    const categoryMap = new Map();
    products.forEach(product => {
      if (product.category && product.category.ID && product.category.name) {
        if (!categoryMap.has(product.category.ID)) {
          categoryMap.set(product.category.ID, {
            id: product.category.ID, // หรือใช้ ID ก็ได้ถ้า backend ส่งมาเป็นตัวใหญ่
            name: product.category.name,
          });
        }
      }
    });
    categories = Array.from(categoryMap.values());
    // เรียงตามชื่อหมวดหมู่ (optional)
    categories.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (productsError) {
    return {
      props: {
        allProducts: [], // ส่ง products ไปในชื่อ allProducts เพื่อไม่ให้สับสนกับ filteredProducts
        categories: [],
        error: `Could not load products: ${productsError}`,
      },
      revalidate: 60,
    };
  }

  return {
    props: {
      allProducts: products || [],
      categories: categories,
      error: null,
    },
    revalidate: 300,
  };
}
export default function AllProductsPage({ allProducts, categories, error }) {
  const storeName = "ชื่อร้านของคุณ";
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // null หมายถึง "สินค้าทั้งหมด"
  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  // Effect นี้จะทำงานเมื่อ allProducts (จาก props) หรือ selectedCategoryId (จาก state) เปลี่ยนแปลง
  useEffect(() => {
    if (selectedCategoryId === null) {
      setFilteredProducts(allProducts); // แสดงสินค้าทั้งหมด
    } else {
      setFilteredProducts(
        allProducts.filter(product => product.category && product.category.ID === selectedCategoryId)
      );
    }
  }, [selectedCategoryId, allProducts]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  if (error) {
    // ... (ส่วนจัดการ error เหมือนเดิม) ...
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Head>
          <title>Error - {storeName}</title>
        </Head>
        <h1 className="text-2xl font-bold text-red-600 mb-3">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <Link href="/" legacyBehavior>
          <a className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            กลับหน้าแรก
          </a>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`สินค้าทั้งหมด - ${storeName}`}</title>
        <meta name="description" content={`เลือกซื้อสินค้าทั้งหมดจาก ${storeName} คุณภาพดี ราคาพิเศษ`} />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 ">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            สินค้าทั้งหมด
          </h1>
          <p className="mt-4 text-xl text-slate-900 dark:text-slate-1000">
            พบกับสินค้าหลากหลายรายการที่เราคัดสรรมาเพื่อคุณ
          </p>
        </div>

        {/* ส่วนแสดงปุ่ม Category */}
        {categories && categories.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCategoryClick(null)} // null สำหรับ "สินค้าทั้งหมด"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedCategoryId === null
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
            >
              สินค้าทั้งหมด
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedCategoryId === category.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* ส่วนแสดงสินค้า (ใช้ filteredProducts แทน allProducts) */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.ID} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-slate-500 dark:text-slate-400">
              {selectedCategoryId ? 'ไม่พบสินค้าในหมวดหมู่นี้' : 'ยังไม่มีสินค้าในร้านขณะนี้'}
            </p>
            {selectedCategoryId && (
                <button
                    onClick={() => handleCategoryClick(null)}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    แสดงสินค้าทั้งหมด
                </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}