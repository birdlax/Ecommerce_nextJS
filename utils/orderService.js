// utils/orderService.js
import { fetchApi } from './authService';


/**
 * ดึงรายการคำสั่งซื้อทั้งหมดของผู้ใช้ที่ login อยู่
 * API: GET /order (สำหรับ User)
 */
export const getUserOrders = async () => {
  console.log('[orderService] Getting user orders from /order');
  return fetchApi('/order'); //order ถ้าจะดึงแค่ order ที่กำลังซื้อ
};

/**
 * (สำหรับ User) ดึงรายละเอียดคำสั่งซื้อตาม ID
 * API: GET /order/:id (สมมติว่า User ใช้ endpoint เดียวกับ Admin แต่ Backend จะ filter ให้)
 * หรือถ้า User มี endpoint แยก เช่น GET /order/user/:id ก็ให้เปลี่ยน path ตรงนี้
 */
export const getOrderDetails = async (orderId) => { // <<--- **เพิ่มฟังก์ชันนี้และ Export**
  console.log(`[orderService] Getting order details for ID: ${orderId} from /order/${orderId}`);
  return  fetchApi(`/order/${orderId}`);
};

/**
 * (สำหรับ User) ยกเลิกคำสั่งซื้อ
 * API: PUT /orders/cancel
 */
export const cancelUserOrder = async (orderId) => {
  console.log(`[orderService] Cancelling order ID: ${orderId}`);
  return  fetchApi('/order/cancel', {
    method: 'PUT',
    body: JSON.stringify({ order_id: orderId }), // ตรวจสอบ body ที่ API ต้องการ
  });
};

/**
 * (สำหรับ User) ทำเครื่องหมายว่าจ่ายเงินแล้ว
 * API: PUT /pay
 */
export const markOrderAsPaid = async (orderId, paymentData = {}) => {
  console.log(`[orderService] Marking order ${orderId} as paid with data:`, paymentData);
  return  fetchApi('/order/pay', {
    method: 'PUT',
    body: JSON.stringify({
      order_id: orderId,
      ...paymentData,
    }),
  });
};

/**
 * ส่งข้อมูลการสั่งซื้อไปยัง API เพื่อทำการ Checkout
 * API: POST /cart/checkout
 */
export const processCheckout = async (checkoutData) => {
  console.log('[orderService] Processing checkout with data:', checkoutData);
  return  fetchApi('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  });
};


