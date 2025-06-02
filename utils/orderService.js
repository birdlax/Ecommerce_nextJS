// utils/orderService.js

const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT';

async function orderFetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  const response = await fetch(url, config);

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
      let errorPayload = { message: `API request failed with status ${response.status}` };
      try { errorPayload = await response.json(); } catch (e) { /* ignore if body is not json */ }
      throw new Error(errorPayload.message || `API request failed with status ${response.status}`);
    }
    return { success: true };
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data;
}

/**
 * ดึงรายการคำสั่งซื้อทั้งหมดของผู้ใช้ที่ login อยู่
 * API: GET /order (สำหรับ User)
 */
export const getUserOrders = async () => {
  console.log('[orderService] Getting user orders from /order');
  return orderFetchApi('/orderalls'); //order ถ้าจะดึงแค่ order ที่กำลังซื้อ
};

/**
 * (สำหรับ User) ดึงรายละเอียดคำสั่งซื้อตาม ID
 * API: GET /order/:id (สมมติว่า User ใช้ endpoint เดียวกับ Admin แต่ Backend จะ filter ให้)
 * หรือถ้า User มี endpoint แยก เช่น GET /order/user/:id ก็ให้เปลี่ยน path ตรงนี้
 */
export const getOrderDetails = async (orderId) => { // <<--- **เพิ่มฟังก์ชันนี้และ Export**
  console.log(`[orderService] Getting order details for ID: ${orderId} from /order/${orderId}`);
  return orderFetchApi(`/order/${orderId}`);
};

/**
 * (สำหรับ User) ยกเลิกคำสั่งซื้อ
 * API: PUT /orders/cancel
 */
export const cancelUserOrder = async (orderId) => {
  console.log(`[orderService] Cancelling order ID: ${orderId}`);
  return orderFetchApi('/orders/cancel', {
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
  return orderFetchApi('/pay', {
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
  return orderFetchApi('/cart/checkout', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  });
};


