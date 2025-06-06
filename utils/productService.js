// utils/productService.js
// import { fetchApi } from './api';
async function fetchApi(endpoint, options = {}) {
  const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT';
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const config = {
    ...options,
    headers,
    credentials: 'include', // สำคัญมากสำหรับการส่ง HttpOnly cookie
  };
  console.log(`[fetchApi] Requesting: ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log(`[fetchApi] Request body:`, options.body);
  }
  const response = await fetch(url, config);
  console.log(`[fetchApi] Response status for ${url}: ${response.status}`);
  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return null; // หรือ { success: true } ถ้า API Logout คืนแบบนั้น
  }

  // ถ้า content-length เป็น 0 แต่ไม่ใช่ 204 และไม่ ok
  if (response.headers.get('content-length') === '0' && !response.ok) {
    throw new Error(`API request failed with status ${response.status} and no content`);
  }
  let data;
  try {
    data = await response.json(); // พยายาม parse JSON
    // console.log(`[fetchApi] Response data for ${url}:`, data); // ระวัง log sensitive data
  } catch (jsonError) {
    // ถ้า parse JSON ไม่ได้ และ response ก็ไม่ ok
    if (!response.ok) {
      console.error(`[fetchApi] API response was not OK and not valid JSON for ${url}:`, response.status, response.statusText);
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    // ถ้า response ok แต่ parse JSON ไม่ได้ (ไม่ควรเกิดถ้า API ออกแบบดี)
    console.error(`[fetchApi] API response was OK but not valid JSON for ${url}:`, jsonError);
    throw new Error('Received malformed JSON response from server.');
  }
  if (!response.ok) {
    // ตอนนี้ data ควรจะเป็น JSON object ที่มี message หรือ error key
    console.error(`[fetchApi] API Error for ${url}:`, data);
    throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
  }
  return data;
}

export const fetchAllProducts = async (
    page = 1,
    limit = 12,
    sortField = 'CreatedAt', // Default sort
    sortOrder = 'desc',    // Default order
    minPrice = '',
    maxPrice = '',
    searchTerm = ''        // <--- **เพิ่ม searchTerm parameter**
) => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('limit', String(limit));

  if (sortField && sortOrder) {
    queryParams.append('sort', sortField);
    queryParams.append('order', sortOrder);
  }
  if (minPrice && String(minPrice).trim() !== '') {
    queryParams.append('min_price', String(minPrice));
  }
  if (maxPrice && String(maxPrice).trim() !== '') {
    queryParams.append('max_price', String(maxPrice));
  }
  if (searchTerm && String(searchTerm).trim() !== '') { // <--- **เพิ่มเงื่อนไขสำหรับ searchTerm**
    queryParams.append('q', String(searchTerm).trim()); // <--- **ใช้ q parameter ตาม API ของคุณ**
  }

  const endpoint = `/products?${queryParams.toString()}`;
  
  console.log(`[productService] Fetching public products: ${endpoint}`);
  return fetchApi(endpoint);
};


/**
 * ดึงข้อมูลสินค้าตามหมวดหมู่แบบแบ่งหน้า, กรอง, และเรียงลำดับ (สำหรับ User ทั่วไป)
 * API: GET /filter/category/:categoryId?page=X&limit=Y&sort=FIELD&order=ORDER&min_price=MIN&max_price=MAX
 * (หรือ /products/category/:categoryId?...)
 */
export const getProductsByCategory = async (
    categoryId,
    page = 1,
    limit = 12,
    sortField = 'CreatedAt',
    sortOrder = 'desc',
    minPrice = '',
    maxPrice = '',
    searchTerm = ''         // <--- **เพิ่ม searchTerm parameter**
) => {
  if (!categoryId || String(categoryId).trim() === '') {
    // ถ้าไม่มี categoryId ให้ดึงสินค้าทั้งหมด (พร้อม filter/sort/search อื่นๆ ถ้ามี)
    console.warn('[productService] No categoryId for getProductsByCategory, falling back to fetchAllProducts.');
    return fetchAllProducts(page, limit, sortField, sortOrder, minPrice, maxPrice, searchTerm);
  }

  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('limit', String(limit));

  if (sortField && sortOrder) {
    queryParams.append('sort', sortField);
    queryParams.append('order', sortOrder);
  }
  if (minPrice && String(minPrice).trim() !== '') {
    queryParams.append('min_price', String(minPrice));
  }
  if (maxPrice && String(maxPrice).trim() !== '') {
    queryParams.append('max_price', String(maxPrice));
  }
  if (searchTerm && String(searchTerm).trim() !== '') { // <--- **เพิ่มเงื่อนไขสำหรับ searchTerm**
    queryParams.append('q', String(searchTerm).trim()); // <--- **ใช้ q parameter**
  }

  // **ตรวจสอบ Path Endpoint นี้ให้ถูกต้องตาม API ของคุณ**
  // ถ้า API ของคุณสำหรับ filter category คือ /products?category_id=X
  // const endpoint = `/products?category_id=${categoryId}&${queryParams.toString()}`;
  // หรือถ้า API คือ /categories/filter/:id (ตามที่คุณเคยระบุ)
  const endpoint = `/categories/filter/${categoryId}?${queryParams.toString()}`;
  
  console.log(`[productService] Fetching public products by category: ${endpoint}`);
  return fetchApi(endpoint);
};

export const fetchProductById = async (id) => {
  if (!id) {
    console.warn('[productService] Product ID is required for fetchProductById');
    // throw new Error('Product ID is required'); // หรือจะ return null ก็ได้
    return null;
  }
  console.log(`[productService] Fetching product by ID: ${id}`);
  try {
    // Endpoint คือ /product/:id (ตามที่คุณระบุ)
    return await fetchApi(`/product/${id}`); // ใช้ fetchApi ถ้าเป็น public
  } catch (error) {
    console.error(`[productService] Error fetching product by ID ${id}:`, error.message);
    // ถ้า API ตอบ 404, fetchApi ควรจะ throw error ที่มี message สื่อถึง Not Found
    // เราสามารถ re-throw หรือ return null
    if (error.message && (error.message.toLowerCase().includes('not found') || error.message.includes('404'))) {
        return null; // สินค้าไม่พบ
    }
    throw error; // โยน error อื่นๆ ต่อไปเพื่อให้ Page Component จัดการ
  }
};
// ฟังก์ชันสำหรับดึง Categories (สำหรับ User ทั่วไป)
export const getAllCategories = async () => {
    console.log('[productService] Fetching all public categories');
    // **คุณต้องมี Endpoint นี้ใน Golang API และ Path นี้ต้องถูกต้อง**
    return fetchApi('/categories'); // สมมติ endpoint คือ /categories
};
export const fetchNewArrivalProducts = async (page = 1, limit = 12) => {
  // *** แก้ไข Endpoint นี้ให้ตรงกับ API จริงของคุณสำหรับดึงสินค้าใหม่ ***
  const endpoint = `/products/new-arrivals?page=${page}&limit=${limit}`; 
  console.log(`[productService] Fetching new arrival products: ${endpoint}`);
  return fetchApi(endpoint); // หรือ fetchApi ถ้า Endpoint นี้ต้องใช้ Auth
};

export const searchProducts = async (searchTerm, page = 1, limit = 12) => {
  if (!searchTerm || String(searchTerm).trim() === '') {
    console.log('[productService] Search term is empty, returning empty or all products.');
    // อาจจะคืนค่าเป็น Array ว่าง หรือเรียก fetchAllProducts หน้าแรก
    // return { items: [], current_page: 1, total_pages: 0, total_items: 0, per_page: limit };
    return fetchAllProducts(page, limit); // หรือถ้าต้องการให้แสดงสินค้าทั้งหมดเมื่อ search term ว่าง
  }
  // Encode searchTerm เพื่อให้ปลอดภัยสำหรับ URL
  const encodedSearchTerm = encodeURIComponent(searchTerm);
  const endpoint = `/products/search?q=${encodedSearchTerm}&page=${page}&limit=${limit}`;
  
  console.log(`[productService] Searching products: ${endpoint}`);
  return fetchApi(endpoint); // หรือ fetchApi ถ้า Endpoint นี้ต้องใช้ Auth (ไม่น่าจะใช่สำหรับ Search ทั่วไป)
};


// ... (ฟังก์ชัน fetchProductById (สำหรับรายละเอียดสินค้าสาธารณะ) อาจจะต้องใช้ fetchApi เช่นกัน)
// export const fetchProductById = async (id) => { ... return fetchApi(`/product/${id}`); ... };

// ... (ส่วนของ Admin Service Functions อาจจะยังใช้ fetchApi เดิม) ...