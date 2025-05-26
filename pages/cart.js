// pages/cart.js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; 
import { useCart } from '../contexts/CartContext';   
import { useEffect } from 'react'; 

const CartPage = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const {
    cartItems,
    cartItemCount,
    cartTotalPrice,
    error: cartError,
    removeItem,
    incrementItem,
    decrementItem,
    isLoading: cartIsLoading, 
  } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) { 
      router.replace('/login?redirect=/cart');
    }
  }, [authIsLoading, isAuthenticated, router]);

  if (authIsLoading || cartIsLoading) { 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">กำลังโหลดข้อมูลตะกร้าสินค้า...</p>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้าของคุณ</p>
        <Link href="/login?redirect=/cart" className="mt-4 text-indigo-600 hover:underline">
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (cartError) {
    return <div className="text-center py-10 text-red-500">เกิดข้อผิดพลาด: {cartError}</div>;
  }

  return (
    <>
      <Head>
        <title>ตะกร้าสินค้าของคุณ - ชื่อร้านของคุณ</title>
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
          ตะกร้าสินค้าของคุณ ({cartItemCount} ชิ้น)
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">ตะกร้าสินค้าของคุณว่างเปล่า</p>
            <Link href="/products" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex items-start sm:items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {item.product?.image_url ? (
                    <Image src={item.product.image_url} alt={item.product.name || 'Product Image'} layout="fill" objectFit="cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{item.product?.name || 'Unknown Product'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ราคา: {item.product?.price ? item.product.price.toLocaleString() : 'N/A'} บาท
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    ราคารวม: {(item.product?.price && item.quantity) ? (item.product.price * item.quantity).toLocaleString() : 'N/A'} บาท
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ml-auto">
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded">
                    <button
                      onClick={() => {
                        // เพิ่ม Log ตรงนี้
                        console.log('[CartPage] Attempting to decrement/remove item with product_id:', item.product_id, 'Current quantity:', item.quantity);
                        decrementItem(item.product_id);
                      }}

                      disabled={cartIsLoading || item.quantity === 0} 
                      className="px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3 text-slate-800 dark:text-slate-100">{item.quantity}</span>
                    <button onClick={() => incrementItem(item.product_id)} disabled={cartIsLoading}
                      className="px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} disabled={cartIsLoading}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50">
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-xl font-semibold text-slate-800 dark:text-slate-100">
                <span>ราคารวมทั้งหมด:</span>
                <span>{cartTotalPrice.toLocaleString()} บาท</span>
              </div>
              <Link href="/order" className="mt-6 w-full block text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors shadow-md">
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