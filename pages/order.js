// pages/order.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { processCheckout } from '@/utils/orderService'; // <--- ใช้ processCheckout

const CheckoutPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const { cart, cartItems, cartTotalPrice, isLoading: cartIsLoading, fetchCart } = useCart();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    phone: '',
    country: 'Thailand',
  });

  // ตั้งค่า fullName จาก user context เมื่อ user โหลดเสร็จ
  useEffect(() => {
    if (user && !authIsLoading) { // เช็ค user และ authIsLoading
      setShippingAddress(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || prev.fullName
      }));
    }
  }, [user, authIsLoading]);


  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/order');
    }
    if (!authIsLoading && !cartIsLoading && isAuthenticated && (!cartItems || cartItems.length === 0)) {
      if(router.pathname === '/order') { // เช็คว่ายังอยู่ที่หน้านี้ก่อน redirect
        alert('ตะกร้าสินค้าของคุณว่างเปล่า ไม่สามารถดำเนินการสั่งซื้อได้');
        router.replace('/products');
      }
    }
  }, [authIsLoading, isAuthenticated, cartIsLoading, cartItems, router]);

  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [shippingAddress, billingSameAsShipping]);

  const handleShippingChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBillingAddress({ ...billingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    const finalBillingAddress = billingSameAsShipping ? shippingAddress : billingAddress;

    const orderData = {
      shipping_address: shippingAddress,
      billing_address: finalBillingAddress,
      payment_method: paymentMethod,
      // Backend ควรจะดึง cart items และ total price จาก session/cookie ของ user เอง
      // ไม่จำเป็นต้องส่ง cartItems หรือ cartTotalPrice จาก frontend อีกครั้งถ้า backend จัดการได้
    };

    try {
      const result = await processCheckout(orderData); // เรียก API POST /cart/checkout
      console.log('Checkout successful:', result);
      alert('สั่งซื้อสินค้าสำเร็จ!');

      await fetchCart(); // สั่งให้ CartContext refresh ตะกร้า (ควรจะว่างเปล่า)
      
      // Redirect ไปยังหน้ารายละเอียด Order ที่เพิ่งสร้าง หรือหน้ารวม Orders
      if (result && (result.order_id || result.id)) { // สมมติ API คืน order_id หรือ id ของ order ที่สร้างใหม่
        router.push(`/orders/${result.order_id || result.id}`);
      } else {
        router.push('/orders'); // ถ้าไม่มียอดสั่งซื้อ ให้ไปหน้ารวมคำสั่งซื้อ
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setFormError(err.message || 'เกิดข้อผิดพลาดในการสั่งซื้อสินค้า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (authIsLoading || cartIsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg">กำลังโหลดข้อมูล...</p></div>;
  }
  if (!isAuthenticated || !cartItems || cartItems.length === 0) {
    // useEffect ด้านบนควรจะจัดการ redirect ไปแล้ว ส่วนนี้เป็น fallback
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg">กำลังนำคุณไปยังหน้าที่เหมาะสม...</p></div>;
  }

  return (
    <>
      <Head>
        <title>ดำเนินการสั่งซื้อ - ชื่อร้านของคุณ</title>
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8"> {/* ปรับ max-w */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-10 text-center">
          ดำเนินการสั่งซื้อ
        </h1>

        <form onSubmit={handleSubmitOrder} className="space-y-10">
          {/* Shipping Address Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">1. ข้อมูลที่อยู่จัดส่ง</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อ-นามสกุลผู้รับ</label>
                <input type="text" name="fullName" id="fullName" required value={shippingAddress.fullName} onChange={handleShippingChange} disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:bg-slate-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                <input type="tel" name="phone" id="phone" required value={shippingAddress.phone} onChange={handleShippingChange} disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:bg-slate-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="addressLine1" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ที่อยู่ (บ้านเลขที่, ถนน, ตำบล/แขวง)</label>
                <textarea name="addressLine1" id="addressLine1" rows="3" required value={shippingAddress.addressLine1} onChange={handleShippingChange} disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:bg-slate-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">อำเภอ/เขต</label>
                <input type="text" name="city" id="city" required value={shippingAddress.city} onChange={handleShippingChange} disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:bg-slate-50 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รหัสไปรษณีย์</label>
                <input type="text" name="postalCode" id="postalCode" pattern="[0-9]{5}" title="กรุณากรอกรหัสไปรษณีย์ 5 หลัก" required value={shippingAddress.postalCode} onChange={handleShippingChange} disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:bg-slate-50 dark:disabled:bg-slate-700/50" />
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">2. วิธีการชำระเงิน</h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-md dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 dark:has-[:checked]:border-indigo-500">
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={submitLoading}
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">ชำระเงินปลายทาง (COD)</span>
              </label>
              <label className="flex items-center p-3 border rounded-md dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 dark:has-[:checked]:border-indigo-500">
                <input type="radio" name="paymentMethod" value="mock_transfer" checked={paymentMethod === 'mock_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={submitLoading}
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">โอนเงินผ่านธนาคาร (Mock)</span>
              </label>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">การชำระเงินจริงจะถูกดำเนินการผ่านช่องทางที่ปลอดภัย (ตัวอย่างนี้เป็นเพียง Mockup)</p>
          </section>

          {/* Order Summary Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">3. สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {cartItems.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="truncate w-3/4">{item.product?.name || 'Unknown Product'} (x{item.quantity})</span>
                      <span>{(item.product?.price * item.quantity).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                  </div>
              ))}
              <div className="flex justify-between pt-2">
                <span>ค่าจัดส่ง:</span>
                <span>ฟรี</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-50 pt-3 border-t-2 border-slate-200 dark:border-slate-600 mt-2">
                <span>ยอดชำระทั้งสิ้น:</span>
                <span>{cartTotalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
              </div>
            </div>
          </section>

          {formError && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center py-3 bg-red-50 dark:bg-red-900/30 rounded-md">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitLoading || !cartItems || cartItems.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-lg text-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900"
          >
            {submitLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อและชำระเงิน'}
          </button>
        </form>
      </main>
    </>
  );
};

export default CheckoutPage;