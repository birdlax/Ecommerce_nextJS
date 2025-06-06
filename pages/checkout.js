// pages/checkout.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { processCheckout } from '@/utils/orderService';
import { getUserAddresses } from '@/utils/addressService';

const CheckoutPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const { cartItems, cartTotalPrice, isLoading: cartIsLoading, fetchCart } = useCart();
  const router = useRouter();

  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // shippingAddress state จะใช้เก็บ "ข้อมูลของที่อยู่ที่ถูกเลือก" เพื่อแสดงผล
  const [shippingAddressDisplay, setShippingAddressDisplay] = useState(null);

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState('');
  const [billingAddressDisplay, setBillingAddressDisplay] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  // VVVVVV ประกาศตัวแปร class ที่นี่ VVVVVV

  // ^^^^^^ สิ้นสุดการประกาศตัวแปร class ^^^^^^
  // Effect 1: Redirect (เหมือนเดิม)

  // Effect 2: ดึงรายการที่อยู่ทั้งหมด และตั้งค่า default/selected address
  useEffect(() => {
    const fetchAddressesAndSetDefault = async () => {
      if (isAuthenticated) {
        setLoadingAddresses(true);
        try {
          const addressesData = await getUserAddresses();
          const validAddresses = Array.isArray(addressesData) ? addressesData : [];
          setUserAddresses(validAddresses);
          console.log("[CheckoutPage] User addresses fetched:", validAddresses);

          const defaultAddr = validAddresses.find(addr => addr.is_default === true);
          if (defaultAddr) {
            setSelectedAddressId(String(defaultAddr.id));
            // setShippingAddressDisplay(defaultAddr); // Effect 3 จะจัดการเรื่องนี้
          } else if (validAddresses.length > 0) {
            // ถ้าไม่มี default แต่มีที่อยู่อื่น อาจจะเลือกอันแรกให้ หรือไม่เลือกเลย
            // setSelectedAddressId(String(validAddresses[0].id));
            console.log("[CheckoutPage] No default address, but other addresses exist.");
          } else {
            console.log("[CheckoutPage] No saved addresses found.");
          }
        } catch (err) { console.error("Failed to fetch user addresses for checkout:", err); }
        finally { setLoadingAddresses(false); }
      } else { setUserAddresses([]); setLoadingAddresses(false); }
    };
    if (!authIsLoading && isAuthenticated) { fetchAddressesAndSetDefault(); }
  }, [isAuthenticated, authIsLoading]);

  // Effect 3: อัปเดต shippingAddressDisplay เมื่อ selectedAddressId หรือ userAddresses เปลี่ยน
  useEffect(() => {
    if (selectedAddressId && userAddresses.length > 0) {
      const selected = userAddresses.find(addr => String(addr.id) === selectedAddressId);
      setShippingAddressDisplay(selected || null);
    } else {
      setShippingAddressDisplay(null); // ถ้าไม่มีการเลือก หรือไม่มีใน list
    }
  }, [selectedAddressId, userAddresses]);

  // Effect 4: อัปเดต billingAddressDisplay
  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddressDisplay(shippingAddressDisplay);
      setSelectedBillingAddressId(selectedAddressId); // ID ของ billing ก็ควรจะเหมือน shipping
    } else {
      // ถ้า billing address ไม่เหมือน shipping และมีการเลือก billing address แยก
      if (selectedBillingAddressId && userAddresses.length > 0) {
        const selectedBillAddr = userAddresses.find(addr => String(addr.id) === selectedBillingAddressId);
        setBillingAddressDisplay(selectedBillAddr || null);
      } else {
        setBillingAddressDisplay(null); // หรือแสดงข้อความให้เลือก/เพิ่มที่อยู่ใบเสร็จ
      }
    }
  }, [shippingAddressDisplay, billingSameAsShipping, selectedBillingAddressId, userAddresses, selectedAddressId]);


  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedAddressId) {
      setFormError('กรุณาเลือกที่อยู่จัดส่ง');
      return;
    }
    if (!billingSameAsShipping && !selectedBillingAddressId) {
      setFormError('กรุณาเลือกที่อยู่ใบเสร็จ');
      return;
    }

    setSubmitLoading(true);
    const orderData = {
      shipping_address_id: parseInt(selectedAddressId),
      billing_address_id: billingSameAsShipping ? parseInt(selectedAddressId) : parseInt(selectedBillingAddressId),
      payment_method: paymentMethod,
    };
    console.log('[CheckoutPage] Submitting orderData (with IDs):', JSON.stringify(orderData, null, 2));
    try {
      const result = await processCheckout(orderData);
      console.log('Checkout successful:', result);
      alert('สั่งซื้อสินค้าสำเร็จ!');
      await fetchCart();
      if (result && (result.order_id || result.id || result.ID)) {
        const orderId = result.order_id || result.id || result.ID;
        router.push(`/payment/${orderId}`);
      }

    } catch (err) { /* ... (เหมือนเดิม) ... */ }
    finally { setSubmitLoading(false); }
  };

  // --- UI Rendering Logic ---
  if (authIsLoading || cartIsLoading || loadingAddresses) { /* ... Loading UI ... */ }
  if (!isAuthenticated || !cartItems || cartItems.length === 0) { /* ... Fallback UI ... */ }

  const storeName = "ชื่อร้านของคุณ";

  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 transition-colors duration-150";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  const addressTextClass = "text-sm text-slate-700 dark:text-slate-200";

  return (
    <>
      <Head>
        <title>ดำเนินการสั่งซื้อ - {storeName}</title>
        <meta name="description" content={`ดำเนินการสั่งซื้อสินค้าจาก ${storeName}`} />
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-10 text-center">
          ดำเนินการสั่งซื้อ
        </h1>

        <form onSubmit={handleSubmitOrder} className="space-y-8 md:space-y-10">
          {/* Shipping Address Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">1. ที่อยู่จัดส่ง</h2>
                <Link href={`/profile/addresses?redirect=${encodeURIComponent(router.asPath)}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    จัดการที่อยู่
                </Link>
            </div>

            {userAddresses.length > 0 ? (
              <div className="mb-4">
                <label htmlFor="savedShippingAddress" className={labelClass}>เลือกที่อยู่จัดส่ง:</label>
                <select
                  id="savedShippingAddress"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  disabled={submitLoading}
                  className="mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer"
                >
                  <option value="">-- เลือกที่อยู่ --</option>
                  {userAddresses.map(addr => (
                    <option key={addr.id} value={String(addr.id)}>
                      {addr.full_name} - {addr.addressLine1}, {addr.city} {addr.is_default ? '(ค่าเริ่มต้น)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
                <div className="text-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">คุณยังไม่มีที่อยู่ที่บันทึกไว้</p>
                    <Link href={`/profile/addresses/new?redirect=${encodeURIComponent(router.asPath)}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        + เพิ่มที่อยู่ใหม่
                    </Link>
                </div>
            )}

            {/* แสดงข้อมูลที่อยู่จัดส่งที่เลือก (Read-only) */}
            {shippingAddressDisplay && selectedAddressId && ( // แสดงเมื่อมีที่อยู่ถูกเลือกแล้วเท่านั้น
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md space-y-1 border border-slate-200 dark:border-slate-600">
                <p className={addressTextClass}><strong>ผู้รับ:</strong> {shippingAddressDisplay.full_name}</p>
                <p className={addressTextClass}>{shippingAddressDisplay.addressLine1}</p>
                {shippingAddressDisplay.addressLine2 && <p className={addressTextClass}>{shippingAddressDisplay.addressLine2}</p>}
                <p className={addressTextClass}>{shippingAddressDisplay.city}, {shippingAddressDisplay.province} {shippingAddressDisplay.postalCode}</p>
                <p className={addressTextClass}>{shippingAddressDisplay.country}</p>
                <p className={addressTextClass}><strong>โทร:</strong> {shippingAddressDisplay.phone}</p>
              </div>
            )}
             {!selectedAddressId && userAddresses.length > 0 && (
                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">กรุณาเลือกที่อยู่จัดส่งจากรายการด้านบน</p>
            )}
          </section>

          {/* Billing Address Section */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">ข้อมูลที่อยู่ใบเสร็จ</h2>
            <div className="flex items-center mb-4">
                <input id="billingSameAsShipping" name="billingSameAsShipping" type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} disabled={submitLoading} className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500"/>
                <label htmlFor="billingSameAsShipping" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">ใช้ที่อยู่เดียวกับที่อยู่จัดส่ง</label>
            </div>
            {!billingSameAsShipping && (
                <div className="mt-4 border-t dark:border-slate-700 pt-6 space-y-4">
                    {userAddresses.length > 0 && (
                        <div className="mb-4">
                            <label htmlFor="savedBillingAddress" className={labelClass}>เลือกที่อยู่ใบเสร็จที่บันทึกไว้:</label>
                            <select
                                id="savedBillingAddress"
                                value={selectedBillingAddressId}
                                onChange={(e) => setSelectedBillingAddressId(e.target.value)}
                                disabled={submitLoading}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="">-- เลือกที่อยู่ใบเสร็จ --</option>
                                {userAddresses.map(addr => (
                                    <option key={addr.id} value={String(addr.id)}>
                                    {addr.full_name} - {addr.addressLine1}, {addr.city} {addr.is_default ? '(ค่าเริ่มต้น)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* แสดงข้อมูลที่อยู่ใบเสร็จที่เลือก (Read-only) */}
                    {billingAddressDisplay && selectedBillingAddressId && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md space-y-1 border border-slate-200 dark:border-slate-600">
                            <p className={addressTextClass}><strong>ผู้รับ (ใบเสร็จ):</strong> {billingAddressDisplay.full_name}</p>
                            <p className={addressTextClass}>{billingAddressDisplay.addressLine1}</p>
                            {billingAddressDisplay.addressLine2 && <p className={addressTextClass}>{billingAddressDisplay.addressLine2}</p>}
                            <p className={addressTextClass}>{billingAddressDisplay.city}, {billingAddressDisplay.province} {billingAddressDisplay.postalCode}</p>
                            <p className={addressTextClass}>{billingAddressDisplay.country}</p>
                            <p className={addressTextClass}><strong>โทร (ใบเสร็จ):</strong> {billingAddressDisplay.phone}</p>
                        </div>
                    )}
                    {!selectedBillingAddressId && userAddresses.length > 0 && (
                         <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">กรุณาเลือกที่อยู่ใบเสร็จจากรายการ หรือระบบจะใช้ที่อยู่จัดส่ง</p>
                    )}
                    {userAddresses.length === 0 && (
                         <p className="text-sm text-slate-500 dark:text-slate-400">ไม่มีที่อยู่ที่บันทึกไว้สำหรับออกใบเสร็จ กรุณาเพิ่มที่อยู่ก่อน</p>
                    )}
                </div>
            )}
          </section>

          {/* Payment Method Section (เหมือนเดิม) */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">2. วิธีการชำระเงิน</h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-md dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 dark:has-[:checked]:border-indigo-500">
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={submitLoading}
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">ชำระเงินปลายทาง (COD)</span>
              </label>
              <label className="flex items-center p-3 border rounded-md dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 dark:has-[:checked]:border-indigo-500">
                <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={submitLoading}
                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">โอนเงินผ่านธนาคาร (Mock)</span>
              </label>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">การชำระเงินจริงจะถูกดำเนินการผ่านช่องทางที่ปลอดภัย (ตัวอย่างนี้เป็นเพียง Mockup)</p>
          </section>

          {/* Order Summary Section (เหมือนเดิม) */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">3. สรุปคำสั่งซื้อ</h2>
            <div className="space-y-2 text-sm">
              {cartItems.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <div className="flex-1 truncate pr-2">
                        <span className="text-slate-700 dark:text-slate-300">{item.product?.name || 'Unknown Product'}</span>
                        <span className="text-slate-500 dark:text-slate-400"> (x{item.quantity})</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {(item.product?.price && typeof item.quantity === 'number' ? item.product.price * item.quantity : 0).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </span>
                  </div>
              ))}
              <div className="flex justify-between pt-3">
                <span className="text-slate-600 dark:text-slate-300">ค่าจัดส่ง:</span>
                <span className="text-slate-600 dark:text-slate-300">ฟรี</span>
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
            {submitLoading ? ( <span>กำลังดำเนินการ...</span> ) : ( 'ยืนยันการสั่งซื้อและชำระเงิน' )}
          </button>
        </form>
      </main>
    </>
  );
};

export default CheckoutPage;