// utils/adminService.js (หรือชื่ออื่นที่เหมาะสม)
import { fetchApi } from './authService'; 

/**
 * (Admin) ดึงข้อมูลผู้ใช้ทั้งหมด
 * API: GET /admin/getall
 */
export const adminGetAllUsers = async (page = 1, limit = 10) => { // กำหนด default limit
  console.log(`[adminService] Admin: Getting all users. Page: ${page}, Limit: ${limit}`);
  // Endpoint คือ /admin/getall ตามที่คุณให้มา และเพิ่ม query params
  return fetchApi(`/admin/getall?page=${page}&limit=${limit}`);
};

/**
 * (Admin) ดึงข้อมูลผู้ใช้ตาม ID
 * API: GET /admin/user/:id
 */
export const adminGetUserById = async (userId) => {
  if (!userId) throw new Error('User ID is required for adminGetUserById');
  console.log(`[adminService] Admin: Getting user by ID: ${userId} from /admin/user/${userId}`);
  return fetchApi(`/admin/user/${userId}`);
};

/**
 * (Admin) อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ตาม ID
 * API: PUT /admin/user/:id
 * @param {string|number} userId - ID ของผู้ใช้ที่จะอัปเดต
 * @param {object} userData - ข้อมูลที่จะอัปเดต (เช่น { first_name, last_name, role })
 */
export const adminUpdateUserProfileById = async (userId, userData) => {
  if (!userId) throw new Error('User ID is required for adminUpdateUserProfileById');
  console.log(`[adminService] Admin: Updating user ID: ${userId} with data:`, userData);
  return fetchApi(`/admin/user/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

/**
 * (Admin) ลบผู้ใช้ตาม ID
 * API: DELETE /admin/user/:id
 */
export const adminDeleteUserById = async (userId) => {
  if (!userId) throw new Error('User ID is required for adminDeleteUserById');
  console.log(`[adminService] Admin: Deleting user ID: ${userId}`);
  return fetchApi(`/admin/user/${userId}`, {
    method: 'DELETE',
  });
};

export const adminGetAllOrders = async (
    page = 1, 
    limit = 10, 
    sortField = 'CreatedAt', // Default sort field
    sortOrder = 'desc'     // Default sort order (ล่าสุดขึ้นก่อน)
) => {
  console.log(`[adminService] Admin: Getting all orders. Page: ${page}, Limit: ${limit}, Sort: ${sortField} ${sortOrder}`);
  return fetchApi(`/admin/orders?page=${page}&limit=${limit}&sort=${sortField}&order=${sortOrder}`);
};

/**
 * (Admin) ดึงข้อมูลคำสั่งซื้อตาม ID
 * API: GET /admin/order/:id (หรือ /order/:id ถ้า API ของคุณใช้ path นั้นสำหรับ Admin ด้วย)
 * **สำคัญ:** ตรวจสอบให้แน่ใจว่า Path นี้ถูกต้อง และมีการป้องกันสิทธิ์ Admin ที่ Backend
 */
export const adminGetOrderById = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required');
  console.log(`[adminService] Admin: Getting order by ID: ${orderId}`);
  // ถ้า endpoint ของ Admin คือ /admin/order/:id ให้ใช้ path นี้
  return fetchApi(`/admin/order/${orderId}`);
  // แต่ถ้า endpoint คือ /order/:id (ตามที่คุณ list มา) และมันมี middleware AdminOnly ก็ใช้
  // return fetchApi(`/order/${orderId}`);
};

/**
 * (Admin) อัปเดตข้อมูล/สถานะคำสั่งซื้อ
 * API: PUT /order/:id (หรือ /admin/order/:id)
 */
export const adminUpdateOrder = async (orderId, updateData) => {
  if (!orderId) throw new Error('Order ID is required for update');
  console.log(`[adminService] Admin: Updating order ID: ${orderId} with data:`, updateData);
  // ปรับ path ให้ตรงกับ API ของคุณ
  return fetchApi(`/order/${orderId}`, { // หรือ /admin/order/${orderId}
    method: 'PUT',
    body: JSON.stringify(updateData), // เช่น { status: "shipped", tracking_number: "..." }
  });
};

/**
 * (Admin) ลบคำสั่งซื้อ
 * API: DELETE /order/:id (หรือ /admin/order/:id)
 */
export const adminDeleteOrder = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required for delete');
  console.log(`[adminService] Admin: Deleting order ID: ${orderId}`);
  // ปรับ path ให้ตรงกับ API ของคุณ
  return fetchApi(`/order/${orderId}`, { // หรือ /admin/order/${orderId}
    method: 'DELETE',
  });
};

/**
 * (Admin) ดึงข้อมูลรายงานรายได้ตามปี, เดือน และ (optionally) ช่วงเวลาเปรียบเทียบ
 * API: GET /report/revenue?year=YYYY[&month=MM][&compare_year=YYYY_prev&compare_month=MM_prev]
 * @param {number} year - ปีที่ต้องการ
 * @param {number} [month] - (Optional) เดือนที่ต้องการ (1-12)
 * @param {number} [compareYear] - (Optional) ปีที่ต้องการเปรียบเทียบ
 * @param {number} [compareMonth] - (Optional) เดือนที่ต้องการเปรียบเทียบ (1-12, ถ้ามี compareYear)
 */
export const adminGetRevenueReport = async (year, month, compareYear, compareMonth) => {
  if (!year) throw new Error('Year is required for revenue report');
  
  let endpoint = `/admin/reports/revenue?year=${year}`;
  if (month && month >= 1 && month <= 12) {
    endpoint += `&month=${month}`;
  }

  // เพิ่ม parameters สำหรับการเปรียบเทียบ
  if (compareYear) {
    endpoint += `&compare_year=${compareYear}`;
    if (compareMonth && compareMonth >= 1 && compareMonth <= 12) {
      endpoint += `&compare_month=${compareMonth}`;
    }
  }

  console.log(`[adminService] Admin: Getting revenue report from ${endpoint}`);
  return fetchApi(endpoint);
};

export const adminGetDashboardSummary = async () => {
  console.log('[adminService] Admin: Getting dashboard summary');
  return fetchApi('/admin/reports/dashboard-summary');
};

/**
 * (Admin) ดึงข้อมูลแนวโน้มยอดขาย
 * API: GET /admin/reports/sales-trend?period=X&days=Y
 * @param {string} period - เช่น 'daily', 'weekly', 'monthly'
 * @param {number} daysOrMonths - จำนวนวันหรือเดือนย้อนหลัง
 */
export const adminGetSalesTrend = async (period = 'daily', range = 30) => {
  console.log(`[adminService] Admin: Getting sales trend, period: ${period}, range: ${range}`);
  // สมมติว่า API รับ parameter ชื่อ 'days' หรือ 'months' หรือ 'range'
  // คุณอาจจะต้องปรับ query param ให้ตรงกับ API ของคุณ
  let queryParam = period === 'daily' ? 'days' : (period === 'weekly' ? 'weeks' : 'months');
  return fetchApi(`/admin/reports/sales-trend?period=${period}&${queryParam}=${range}`);
};

/**
 * (Admin) ดึงคำสั่งซื้อล่าสุด
 * API: GET /admin/orders?sort=CreatedAt&order=desc&limit=X
 */
export const adminGetRecentOrders = async (limit = 5) => {
  console.log(`[adminService] Admin: Getting recent ${limit} orders`);
  return fetchApi(`/admin/orders?sort=CreatedAt&order=desc&limit=${limit}`);
};

/**
 * (Admin) ดึงสินค้าที่เพิ่มล่าสุด
 * API: GET /admin/products?sort=CreatedAt&order=desc&limit=X&page=1
 */
export const adminGetRecentProducts = async (limit = 5) => {
  console.log(`[adminService] Admin: Getting recent ${limit} products`);
  return fetchApi(`/admin/products?sort=CreatedAt&order=desc&limit=${limit}&page=1`);
};

/**
 * (Admin) ดึงผู้ใช้ที่สมัครใหม่ล่าสุด
 * API: GET /admin/getall?sort=CreatedAt&order=desc&limit=X
 */
export const adminGetRecentUsers = async (limit = 3) => {
  console.log(`[adminService] Admin: Getting recent ${limit} users`);
  return fetchApi(`/admin/getall?sort=CreatedAt&order=desc&limit=${limit}`);
};