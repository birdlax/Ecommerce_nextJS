// pages/cart.js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; 
import { useCart } from '../contexts/CartContext';   
import { useEffect } from 'react'; 

// Icon สำหรับตะกร้าว่าง (สามารถเก็บไว้หรือลบถ้าไม่ใช้)
const EmptyCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const CartPage = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const {
    cartItems, // นี่ควรจะเป็น array ของ items ในตะกร้า
    cartItemCount,
    cartTotalPrice,
    error: cartError,
    removeItem,
    incrementItem,
    decrementItem,
    isLoading: cartIsLoading, 
  } = useCart();
  const router = useRouter();

  // --- Base URL สำหรับรูปภาพ และ Placeholder ---
  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;
  const placeholderImageUrl = '/uploads/placeholder-product-square.png'; // สร้างไฟล์นี้ใน public/images

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) { 
      router.replace('/login?redirect=/cart');
    }
  }, [authIsLoading, isAuthenticated, router]);

  if (authIsLoading || (isAuthenticated && cartIsLoading)) { // โหลดตะกร้าเฉพาะเมื่อ Login แล้วและตะกร้ากำลังโหลด
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-slate-600 dark:text-slate-300">กำลังโหลดข้อมูลตะกร้าสินค้า...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
            <p className="text-lg text-slate-700 dark:text-slate-200">กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ</p>
            <Link href="/login?redirect=/cart" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              ไปหน้าเข้าสู่ระบบ
            </Link>
        </div>
      </div>
    );
  }

  if (cartError) {
    return <div className="text-center py-10 text-red-500 dark:text-red-400">เกิดข้อผิดพลาดในการโหลดตะกร้าสินค้า: {cartError}</div>;
  }

  return (
    <>
      <Head>
        <title>ตะกร้าสินค้าของคุณ - ชื่อร้านของคุณ</title>
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
          ตะกร้าสินค้าของคุณ ({cartItemCount || 0} ชิ้น)
        </h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-12">
            <EmptyCartIcon />
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">ตะกร้าสินค้าของคุณว่างเปล่า</p>
            <Link href="/products" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => {
              // --- VVVVVV การจัดการรูปภาพสำหรับ Cart Item (แก้ไขแล้ว) VVVVVV ---
              const primaryImageObject = item.product?.images && item.product.images.length > 0
                                       ? item.product.images[0] // เอารูปแรกจาก product.images array
                                       : null;
              
              const imageUrl = primaryImageObject
                               ? `${baseApiUrl}/${primaryImageObject.path.replace(/^\.\//, '')}`
                               : placeholderImageUrl; // ใช้ Placeholder ถ้าไม่มีรูป
              // --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ---
              
              const productName = item.product?.name || 'Unknown Product';
              const productPrice = item.product?.price || 0;
              const itemTotalPrice = productPrice * item.quantity;

              return (
                <div 
                    key={item.product_id || item.id} // ใช้ product_id หรือ id ของ cart item
                    className="flex items-start sm:items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <Image 
                        src={imageUrl} // <--- ใช้ imageUrl ที่สร้างขึ้น
                        alt={productName} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 640px) 20vw, 96px" // ปรับ sizes ให้เหมาะสม
                        onError={(e) => { 
                            // Fallback ถ้าโหลดรูปภาพไม่ได้
                            if (e.target.src !== placeholderImageUrl) {
                                e.target.srcset = placeholderImageUrl; 
                                e.target.src = placeholderImageUrl;
                            }
                        }}
                    />
                  </div>
                  <div className="flex-grow">
                    <Link href={`/products/${item.product_id || item.product?.ID}`} className="hover:underline"> {/* เพิ่ม fallback item.product?.ID */}
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {productName}
                        </h3>
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      ราคา: {productPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                      ราคารวม: {itemTotalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ml-auto">
                    <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md">
                      <button
                        onClick={() => {
                          console.log('[CartPage] Decrement item:', item.product_id, 'Current qty:', item.quantity);
                          decrementItem(item.product_id);
                        }}
                        disabled={cartIsLoading || item.quantity <= 1} // Disable ถ้าจำนวนเป็น 1 (การลดจะกลายเป็นการลบ)
                        className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
                        aria-label={`ลดจำนวน ${productName}`}
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-slate-800 dark:text-slate-100 border-x border-slate-300 dark:border-slate-600 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => incrementItem(item.product_id)} 
                        disabled={cartIsLoading}
                        className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 rounded-r-md"
                        aria-label={`เพิ่มจำนวน ${productName}`}
                      >
                        +
                      </button>
                    </div>
                    <button 
                        onClick={() => removeItem(item.product_id)} 
                        disabled={cartIsLoading}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 hover:underline disabled:opacity-50"
                        aria-label={`ลบ ${productName} ออกจากตะกร้า`}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-xl font-semibold text-slate-800 dark:text-slate-100">
                <span>ราคารวมทั้งหมด:</span>
                <span>{cartTotalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
              </div>
              <Link 
                href="/checkout" // เปลี่ยนเป็น /checkout หรือ path ที่ถูกต้องสำหรับหน้าดำเนินการสั่งซื้อ
                className="mt-6 w-full block text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-md"
              >
                ดำเนินการสั่งซื้อ 
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CartPage;