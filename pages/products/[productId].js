// pages/products/[productId].js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { fetchProductById, fetchAllProducts } from '@/utils/productService';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';


// --- Icons ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const CartPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /><path fillRule="evenodd" d="M14 7a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const LoadingSpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PlaceholderImageIcon = () => <svg className="w-20 h-20 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
// ---------------
// Beautiful Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="w-full h-80 md:h-[500px] bg-slate-300 dark:bg-slate-700"></div>
      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="h-4 w-1/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="h-8 w-3/4 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="h-6 w-1/5 bg-slate-300 dark:bg-slate-600 rounded"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-slate-300 dark:bg-slate-600 rounded"></div>
          ))}
        </div>
        <div className="h-12 w-full bg-slate-300 dark:bg-slate-600 rounded mt-8"></div>
      </div>
    </div>
  </div>
);

// ProductDetailCard Component with Enhanced UI
const ProductDetailCard = ({ product }) => {
  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // State for the currently displayed main image
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;

  // Determine image URLs
  const images = product?.images || [];
  const mainImageUrl = images.length > 0 
                       ? `${baseApiUrl}/${images[currentImageIndex].path.replace(/^\.\//, '')}` 
                       : '/images/placeholder-product-large.png'; // Main placeholder

  useEffect(() => {
    // Reset currentImageIndex if product changes or images array changes
    setCurrentImageIndex(0);
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า');
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (product && product.ID) {
      addItem(product.ID, 1);
    }
  };

  if (!product) return null;

  const PriceDisplay = ({ price }) => (
    <div className="flex items-center">
      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 my-2">
        {price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
      </p>
      {product.discount > 0 && (
        <span className="ml-3 px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium rounded-full">
          ลด {product.discount}%
        </span>
      )}
    </div>
  );

  const StockStatus = ({ quantity }) => {
    if (quantity > 10) {
      return (
        <div className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          มีสินค้า ({quantity} ชิ้น)
        </div>
      );
    } else if (quantity > 0) {
      return (
        <div className="inline-flex items-center text-sm text-yellow-600 dark:text-yellow-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          สินค้าใกล้หมด (เหลือ {quantity} ชิ้น)
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          สินค้าหมด
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2"> {/* เปลี่ยนเป็น 2 คอลัมน์เท่ากัน */}
        {/* Product Image Gallery (Left Column) */}
        <div className="md:col-span-1 p-4 sm:p-6 md:sticky md:top-24 self-start"> {/* sticky สำหรับ image column */}
          <div className="relative w-full aspect-[4/5] sm:aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shadow-inner group">
            <Image
              src={mainImageUrl}
              alt={product.name || 'Product Image'}
              fill
              style={{objectFit:"cover"}}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => { 
                // Fallback to placeholder if currentImage fails to load
                if(e.target.src !== '/images/placeholder-product-large.png') {
                    e.target.src = '/images/placeholder-product-large.png';
                    e.target.srcset = ""; // Prevent srcset loop
                }
              }}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Thumbnails (if multiple images) */}
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((img, index) => {
                const thumbnailUrl = `${baseApiUrl}/${img.path.replace(/^\.\//, '')}`;
                return (
                  <button
                    key={img.ID}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-150 relative
                                ${index === currentImageIndex
                                    ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-800 scale-105' 
                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                                }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image src={thumbnailUrl} alt={`Thumbnail ${index + 1}`} fill style={{objectFit:"cover"}} sizes="80px"/>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info (Right Column) */}
        <div className="md:col-span-1 p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="flex-grow"> {/* ให้ส่วนนี้ขยายเพื่อดันปุ่ม Add to Cart ลงล่าง */}
            {product.category && (
              <Link href={`/products?category=${product.category.ID}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider hover:underline transition-colors">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mt-2 mb-3 leading-tight">
              {product.name || 'Untitled Product'}
            </h1>
            <div className="mb-5 flex items-center space-x-4">
              <StockStatus quantity={product.quantity} />
              {/* อาจจะมี SKU หรือ Brand ที่นี่ */}
            </div>
            <PriceDisplay price={product.price} />
            
            <div className="mt-6 mb-8 border-t dark:border-slate-700 pt-6">
                 <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">รายละเอียดสินค้า:</h2>
                <div className="prose prose-sm sm:prose-base dark:prose-invert text-slate-600 dark:text-slate-300 max-w-none leading-relaxed">
                    {/* ถ้า product.description เป็น HTML, คุณอาจจะต้องใช้ dangerouslySetInnerHTML (แต่ต้องระวัง XSS) */}
                    {/* ถ้าเป็น plain text: */}
                    {product.description ? (
                        product.description.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                        <p>ไม่มีคำอธิบายสำหรับสินค้านี้</p>
                    )}
                </div>
            </div>
            {/* (Optional) Specifications section (เหมือนเดิม) */}
          </div>

          {/* Add to Cart and other actions at the bottom */}
          <div className="mt-auto pt-6 border-t border-slate-700 space-y-4">
            {/* อาจจะมีส่วนเลือกจำนวนสินค้า (Quantity Selector) ที่นี่ก่อนปุ่ม Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.quantity === 0}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                          ${cartLoading || product.quantity === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {cartLoading ? ( <LoadingSpinnerIcon /> ) : ( <CartPlusIcon /> )}
              <span>{product.quantity === 0 ? 'สินค้าหมด' : (cartLoading ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า')}</span>
            </button>
             <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                จัดส่งฟรีเมื่อสั่งซื้อครบ 500 บาท
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = ({ product, error }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md w-full">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-slate-700 dark:text-slate-300 mb-6">{error}</p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
              </svg>
              กลับไปหน้าสินค้าทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <Head>
          <title>ไม่พบสินค้า - ชื่อร้านของคุณ</title>
        </Head>
        <div className="max-w-md w-full">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full">
              <svg className="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">404 - ไม่พบสินค้า</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">ขออภัย ไม่พบสินค้าที่คุณกำลังค้นหา</p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              กลับไปหน้าสินค้าทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeName = "ชื่อร้านของคุณ";

  return (
    <>
      <Head>
        <title>{`${product?.name || 'รายละเอียดสินค้า'} - ${storeName}`}</title>
        <meta name="description" content={product?.description || `รายละเอียดสินค้า ${product?.name}`} />
        {/* ... (OG Tags เหมือนเดิม, ตรวจสอบว่า product?.images[0]?.path ถูกใช้ถ้าต้องการรูปแรก) ... */}
        {product?.images && product.images.length > 0 && 
            <meta property="og:image" content={`${process.env.NEXT_PUBLIC_GOLANG_API_URL  }/${product.images[0].path.replace(/^\.\//, '')}`} />
        }
      </Head>

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 group transition-colors duration-150">
                <ArrowLeftIcon />
                <span>กลับไปหน้าสินค้าทั้งหมด</span>
            </Link>
        </div>
        
        {product ? <ProductDetailCard product={product} /> : <p className="text-center text-slate-500">ไม่พบข้อมูลสินค้า</p>}

        {/* (Optional) Related Products Section */}
      </main>
    </>
  );
};

export async function getStaticPaths() {
  let paths = [];
  try {
    const productData = await fetchAllProducts(1, 10);
    if (productData && Array.isArray(productData.items)) {
      paths = productData.items.map((product) => ({
        params: { productId: String(product.ID) },
      }));
    }
  } catch (error) {
    console.error("Error fetching paths for product pages:", error);
  }

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps(context) {
  const { params } = context;
  const productId = params?.productId;
  let product = null;
  let error = null;

  if (!productId || isNaN(parseInt(productId))) {
    error = "Product ID ไม่ถูกต้อง";
  } else {
    try {
      product = await fetchProductById(productId);
      if (!product) {
        error = `ไม่พบสินค้าสำหรับ ID: ${productId}`;
        console.warn(`[getStaticProps /products/${productId}] Product not found.`);
      }
    } catch (e) {
      console.error(`[getStaticProps /products/${productId}] Error fetching product:`, e);
      error = e.message || "Could not load product details.";
    }
  }
  
  if (!product && !error && productId) {
    return { notFound: true };
  }

  return {
    props: {
      product,
      error,
    },
    revalidate: 60,
  };
}

export default ProductDetailPage;