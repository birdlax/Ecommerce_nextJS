// components/ProductCard.js
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext'; 
import { useAuth } from '../contexts/AuthContext';   
import { useRouter } from 'next/router'; 

export default function ProductCard({ product }) {
  const router = useRouter(); 

  if (!product) { 
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col h-full p-4 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">ข้อมูลสินค้าไม่พร้อมใช้งาน</p>
      </div>
    );
  }

  const { addItem, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth(); 

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า");
      router.push('/login?redirect=' + router.asPath);
      return;
    }
    if (product && product.ID) {
      addItem(product.ID, 1); 
      alert(`${product.name} ถูกเพิ่มลงในตะกร้าแล้ว!`); 
    }
  };

  return (
    <div className="group border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300">
      <Link href={`/products/${product.ID}`} className="block">
        <div className="relative aspect-square bg-slate-50 dark:bg-slate-700 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name || 'Product image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
              priority={product.ID <= 4} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
              No Image
            </div>
          )}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
            product.quantity > 0 
              ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
          }`}>
            {product.quantity > 0 ? 'In Stock' : 'Sold Out'}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base text-slate-900 dark:text-slate-50 line-clamp-2 mb-1 h-12"> 
          <Link 
            href={`/products/${product.ID}`} 
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={product.name}
          >
            {product.name || 'Untitled Product'}
          </Link>
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3 h-8">
          {product.description || 'No description available.'}
        </p>
        
        <div className="mt-auto"> 
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
            {product.price ? product.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) : 'N/A'}
          </p>
          
          <button 
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-4 rounded-md transition-colors text-sm font-semibold ${
              product.quantity > 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            }`}
            disabled={product.quantity <= 0 || cartLoading}
          >
            {cartLoading && product.quantity > 0 ? (
              <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (product.quantity > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด')}
          </button>
        </div>
      </div>
    </div>
  );
}