// components/ProductCard.js
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext'; // ตรวจสอบ Path Alias
import { useAuth } from '../contexts/AuthContext';   // ตรวจสอบ Path Alias
import { useRouter } from 'next/router';

// ตัวอย่าง Icon (ถ้าจะใช้ในปุ่ม Add to Cart)
const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);
const LoadingSpinnerSmall = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default function ProductCard({ product, priorityIndex }) {
  const router = useRouter();

  if (!product || !product.ID) {
    return (
      <div className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col h-full p-4 animate-pulse shadow-md">
        <div className="relative w-full aspect-square bg-slate-300 dark:bg-slate-600 rounded-md mb-3"></div>
        <div className="w-3/4 h-5 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
        <div className="w-1/2 h-4 bg-slate-300 dark:bg-slate-600 rounded mb-3"></div>
        <div className="w-full h-10 bg-slate-300 dark:bg-slate-600 rounded-md mt-auto"></div>
      </div>
    );
  }

  // VVVVVV เอา getItemQuantity ออกจาก destructuring VVVVVV
  const { addItem, isLoading: cartLoading } = useCart();
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า");
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (product.quantity > 0) {
      addItem(product.ID, 1);
      alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
    } else {
      alert(`ขออภัย, "${product.name}" สินค้าหมดสต็อกแล้ว`);
    }
  };

  const primaryImageObject = product.images && product.images.length > 0
                           ? product.images[0]
                           : null;
  
  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;
  
  const imageUrl = primaryImageObject
                   ? `${baseApiUrl}/${primaryImageObject.path.replace(/^\.\//, '')}`
                   : '/uploads/placeholder-product.png';

  const productName = product.name || 'Untitled Product';
  const productPrice = product.price;

  const stockStatus = product.quantity > 10 ? 'มีสินค้า' : (product.quantity > 0 ? `เหลือ ${product.quantity}` : 'สินค้าหมด');
  const stockColorClass = product.quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                        : product.quantity > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';

  return (
    <div className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col h-full shadow-md hover:shadow-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-800 transition-all duration-300 ease-in-out">
      <Link href={`/products/${product.ID}`} className="block focus:outline-none rounded-t-xl">
        <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 230px"
            priority={priorityIndex !== undefined && priorityIndex < 4}
            onError={(e) => { 
                if (e.target.src !== '/images/placeholder-product.png') {
                    e.target.srcset = '/images/placeholder-product.png';
                    e.target.src = '/images/placeholder-product.png';
                }
            }}
          />
          {product.quantity !== undefined && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${stockColorClass}`}>
              {stockStatus}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
            <Link href={`/products?category=${product.category.ID}`} className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider mb-1 font-medium transition-colors">
                {product.category.name}
            </Link>
        )}
        <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-50 line-clamp-2 mb-1 h-12 sm:h-14 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={productName}>
          <Link href={`/products/${product.ID}`}>
            {productName}
          </Link>
        </h3>
        
        <div className="mt-auto pt-2">
          <p className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">
            {productPrice?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) || 'N/A'}
          </p>
          
          <button 
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-4 rounded-md transition-all duration-150 ease-in-out text-sm font-semibold flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                        ${product.quantity > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow hover:shadow-md' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
            disabled={product.quantity <= 0 || cartLoading}
            aria-label={`เพิ่ม ${productName} ลงตะกร้า`}
          >
            {/* VVVVVV เอาการเช็ค itemInCartQuantity ออก (ถ้าเคยมี) VVVVVV */}
            {cartLoading && product.quantity > 0 ? (
              <LoadingSpinnerSmall />
            ) : (
                product.quantity > 0 && <CartIcon />
            )}
            {/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */}
            <span>{product.quantity > 0 ? (cartLoading ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า') : 'สินค้าหมด'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}