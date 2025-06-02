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

// components/ProductCard.js
// import Image from 'next/image';
// import Link from 'next/link';
// import { useCart } from '../contexts/CartContext'; // ตรวจสอบ Path Alias
// import { useAuth } from '../contexts/AuthContext';   // ตรวจสอบ Path Alias
// import { useRouter } from 'next/router';

// const ProductCard = ({ product }) => {
//   const router = useRouter();

//   if (!product) {
//     return (
//       <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex flex-col h-full p-4 items-center justify-center animate-pulse">
//         <div className="w-full aspect-square bg-slate-300 dark:bg-slate-600 rounded-md mb-4"></div>
//         <div className="w-3/4 h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
//         <div className="w-1/2 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
//       </div>
//     );
//   }

//   const { addItem, isLoading: cartLoading } = useCart();
//   const { isAuthenticated } = useAuth();

//   const handleAddToCart = (e) => {
//     e.preventDefault(); // ป้องกัน Link จากการทำงานเมื่อคลิกปุ่ม Add to Cart โดยตรง
//     e.stopPropagation(); // ป้องกัน event bubbling ไปยัง Link ครอบ

//     if (!isAuthenticated) {
//       alert("กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า");
//       // router.asPath จะได้ path ปัจจุบัน (รวม query params)
//       router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
//       return;
//     }
//     if (product && product.ID && product.quantity > 0) { // เช็ค quantity > 0 ด้วย
//       addItem(product.ID, 1);
//       // **แนะนำ:** เปลี่ยน alert เป็น UI Notification ที่สวยงามกว่า
//       alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
//     } else if (product.quantity <= 0) {
//       alert(`ขออภัย, "${product.name}" สินค้าหมดสต็อกแล้ว`);
//     }
//   };

//   // --- การจัดการรูปภาพจาก "images" array ---
//   const primaryImage = product.images && product.images.length > 0 
//                        ? product.images[0] // เอารูปแรกเป็นรูปหลัก
//                        : null;
  
//   const imageUrl = primaryImage 
//                    ? `${process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:3000'}/${primaryImage.path.replace(/^\.\//, '')}` 
//                    : '/images/placeholder-product.png'; // Placeholder ของคุณ

//   const productName = product.name || 'Untitled Product';
//   const productPrice = product.price; // API ของคุณส่ง price เป็น number โดยตรง

//   return (
//     <div className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
//       <Link href={`/products/${product.ID}`} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-t-xl">
//         <div className="relative w-full aspect-w-1 aspect-h-1 bg-slate-100 dark:bg-slate-700 overflow-hidden"> {/* aspect-w-1 aspect-h-1 สำหรับสัดส่วน 1:1 */}
//           <Image
//             src={imageUrl}
//             alt={productName}
//             fill
//             className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
//             sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 250px" // ปรับ sizes ให้เหมาะสม
//             priority={product.ID <= 4} // Optional: ให้โหลดรูปแรกๆ ก่อน
//           />
//           {/* Stock Status Badge */}
//           <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
//             product.quantity > 0 
//               ? (product.quantity > 10 ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100')
//               : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
//           }`}>
//             {product.quantity > 10 ? 'มีสินค้า' : (product.quantity > 0 ? 'สินค้าใกล้หมด' : 'สินค้าหมด')}
//           </div>
//         </div>
//       </Link>

//       <div className="p-4 flex flex-col flex-grow"> {/* flex-grow ทำให้ส่วนนี้ขยายเต็มพื้นที่ที่เหลือ */}
//         {product.category && (
//             <Link href={`/products?category=${product.category.ID}`} className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider mb-1 font-medium transition-colors">
//                 {product.category.name}
//             </Link>
//         )}
//         <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-50 line-clamp-2 mb-1 h-12 sm:h-14 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"> 
//           <Link 
//             href={`/products/${product.ID}`} 
//             title={productName} // เพิ่ม title attribute
//           >
//             {productName}
//           </Link>
//         </h3>
        
//         <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3 h-8"> {/* h-8 สำหรับ 2 บรรทัด */}
//           {product.description || ''} {/* ถ้าไม่มี description ให้เป็น string ว่าง */}
//         </p>
        
//         {/* ส่วน Price และปุ่ม Add to Cart จะอยู่ด้านล่างเสมอ */}
//         <div className="mt-auto pt-3"> 
//           <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">
//             {productPrice?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) || 'N/A'}
//           </p>
          
//           <button 
//             onClick={handleAddToCart}
//             className={`w-full py-2.5 px-4 rounded-md transition-all duration-150 ease-in-out text-sm font-semibold flex items-center justify-center gap-2 ${
//               product.quantity > 0 
//                 ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800' 
//                 : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
//             }`}
//             disabled={product.quantity <= 0 || cartLoading}
//             aria-label={`เพิ่ม ${productName} ลงตะกร้า`}
//           >
//             {cartLoading && product.quantity > 0 ? (
//               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//                 product.quantity > 0 && // แสดง icon ตะกร้าถ้ามีของ
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                     <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
//                 </svg>
//             )}
//             <span>{product.quantity > 0 ? (cartLoading ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า') : 'สินค้าหมด'}</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductCard; 