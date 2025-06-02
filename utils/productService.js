// utils/productService.js

const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:3000'; // API URL ของคุณ

// Helper function สำหรับ Public API (ถ้าต้องการแยก)
async function publicFetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const config = {
    ...options,
    headers,
    // ไม่มี credentials: 'include' สำหรับ public API
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `API request failed with status ${response.status}` }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  return response.json();
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
  return publicFetchApi(endpoint);
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
  return publicFetchApi(endpoint);
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
    return await publicFetchApi(`/product/${id}`); // ใช้ publicFetchApi ถ้าเป็น public
  } catch (error) {
    console.error(`[productService] Error fetching product by ID ${id}:`, error.message);
    // ถ้า API ตอบ 404, publicFetchApi ควรจะ throw error ที่มี message สื่อถึง Not Found
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
    return publicFetchApi('/categories'); // สมมติ endpoint คือ /categories
};
export const fetchNewArrivalProducts = async (page = 1, limit = 12) => {
  // *** แก้ไข Endpoint นี้ให้ตรงกับ API จริงของคุณสำหรับดึงสินค้าใหม่ ***
  const endpoint = `/products/new-arrivals?page=${page}&limit=${limit}`; 
  console.log(`[productService] Fetching new arrival products: ${endpoint}`);
  return publicFetchApi(endpoint); // หรือ fetchApi ถ้า Endpoint นี้ต้องใช้ Auth
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
  return publicFetchApi(endpoint); // หรือ fetchApi ถ้า Endpoint นี้ต้องใช้ Auth (ไม่น่าจะใช่สำหรับ Search ทั่วไป)
};


// ... (ฟังก์ชัน fetchProductById (สำหรับรายละเอียดสินค้าสาธารณะ) อาจจะต้องใช้ publicFetchApi เช่นกัน)
// export const fetchProductById = async (id) => { ... return publicFetchApi(`/product/${id}`); ... };

// ... (ส่วนของ Admin Service Functions อาจจะยังใช้ fetchApi เดิม) ...