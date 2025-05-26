// pages/products/[id].js
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchProductById } from "../../utils/productService";

// 1. getStaticPaths: จะไม่ pre-render paths ใดๆ ล่วงหน้า
export async function getStaticPaths() {
  return {
    paths: [], //  <--- ส่ง array ว่างไป หมายถึงไม่ pre-render หน้าไหนเลยตอน build
    fallback: "blocking", // <--- สำคัญมาก!
    // 'blocking': เมื่อมี request มาที่ path ที่ยังไม่เคยสร้าง,
    //             Next.js จะ Server-Side Render (SSR) หน้านั้นๆ ใน request แรก
    //             แล้วจะ cache ผลลัพธ์ไว้เป็น static file สำหรับ request ต่อๆ ไป
    //             ผู้ใช้จะรอจนกว่าหน้าจะ generate เสร็จ (ไม่มี loading state ให้เห็น)
    // 'true':   คล้าย 'blocking' แต่ผู้ใช้จะเห็น fallback UI (ถ้า router.isFallback เป็น true)
    //             ขณะที่ Next.js generate หน้าเบื้องหลัง
  };
}

// 2. getStaticProps: ยังคงทำงานเหมือนเดิม เพื่อดึงข้อมูลสำหรับ page ที่กำลังถูก request/generate
export async function getStaticProps(context) {
  const { id } = context.params;
  const { product, error } = await fetchProductById(id);

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    // คุณอาจจะต้องการ log error นี้ไปยังระบบ monitoring ของคุณ
    // การ return notFound: true อาจจะดีกว่าการส่ง error prop ถ้าเป็น server error
    // หรือถ้าเป็น error ที่คาดว่าจะเกิดขึ้นได้ (เช่น API rate limit) ก็อาจจะส่ง error prop
    return {
      props: { product: null, error: `Could not load product data: ${error}` },
    };
  }

  if (!product) {
    // ถ้า API คืนค่าว่าไม่พบสินค้า (เช่น fetchProductById คืน product เป็น null)
    return {
      notFound: true, // แสดงหน้า 404 มาตรฐานของ Next.js
    };
  }

  return {
    props: {
      product,
      error: null,
    },
    revalidate: 300, // Optional: สร้างหน้านี้ใหม่ทุกๆ 5 นาที (ISR)
    // ทำให้ข้อมูลสินค้ายังคง update ได้ แม้จะ generate on-demand ไปแล้ว
  };
}

// 3. Page Component: สำหรับแสดงผลรายละเอียดสินค้า (เหมือนเดิม)
export default function ProductDetailPage({ product, error }) {
  const router = useRouter();

  // router.isFallback จะเป็น true เฉพาะเมื่อใช้ fallback: 'true' ใน getStaticPaths
  // และ Next.js กำลัง generate หน้าเบื้องหลัง
  // ถ้าใช้ fallback: 'blocking', ส่วนนี้จะไม่ค่อยเห็นผล เพราะผู้ใช้จะรอจนหน้าเสร็จ
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">กำลังโหลดข้อมูลสินค้า...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">เกิดข้อผิดพลาด</h1>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button
          onClick={() => router.reload()} // เพิ่มปุ่มให้ลองโหลดใหม่
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  if (!product) {
    // ส่วนนี้ควรจะถูกจัดการโดย notFound: true ใน getStaticProps แล้ว
    // แต่ใส่ไว้เผื่อกรณีที่ product เป็น null ด้วยเหตุผลอื่น
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">
          ไม่พบสินค้า
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ขออภัย ไม่พบสินค้าที่คุณกำลังค้นหา
        </p>
        <Link href="/products" legacyBehavior>
          <a className="mt-4 text-blue-500 hover:underline">
            กลับไปหน้ารวมสินค้า
          </a>
        </Link>
      </div>
    );
  }

  // (ส่วนแสดงผลสินค้าเหมือนเดิม)
  return (
    <>
      <Head>
        <title>{`${product.name} - ชื่อร้านของคุณ`}</title>{" "}
        {/* อย่าลืมเปลี่ยน "ชื่อร้านของคุณ" */}
        <meta
          name="description"
          content={
            product.description
              ? product.description.substring(0, 150)
              : `${product.name} - available at ชื่อร้านของคุณ`
          }
        />
        {product.image_url && (
          <meta property="og:image" content={product.image_url} />
        )}
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={
            product.description
              ? product.description.substring(0, 150)
              : `${product.name} - available at ชื่อร้านของคุณ`
          }
        />
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover" // Tailwind class สำหรับ object-fit: cover
                priority // ให้โหลดรูปนี้ก่อนเพราะเป็น LCP (Largest Contentful Paint)
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center space-y-6 py-4">
            <div>
              <h1 className="text-2xl font-medium">{product.name}</h1>
              <p className="text-gray-500 mt-2">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="border-t border-b border-gray-100 py-4">
              <p className="text-xl font-medium">
                {product.price
                  ? product.price.toLocaleString("th-TH", {
                      style: "currency",
                      currency: "THB",
                    })
                  : "N/A"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  product.quantity > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full bg-opacity-10 ${
                    product.quantity > 0
                      ? "bg-green-500 text-green-700 dark:bg-green-700 dark:text-green-100"
                      : "bg-red-500 text-red-700 dark:bg-red-700 dark:text-red-100"
                  }`}
                >
                  {product.quantity > 0
                    ? `คงเหลือ ${product.quantity} ชิ้น`
                    : "สินค้าหมด"}
                </span>
              </p>
            </div>

            <button
              type="button"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!product.quantity || product.quantity === 0}
            >
              {product.quantity > 0 ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
            </button>
          </div>
        </div>
        {/* Suggested Products or other sections can go here */}
      </main>
    </>
  );
}
