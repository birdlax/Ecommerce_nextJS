// utils/adminProductService.js

// สมมติว่าคุณมี fetchApi helper กลาง ที่จัดการเรื่อง auth/credentials
// และ API_URL ถูก define ในนั้น หรือใน environment variables ที่ fetchApi เข้าถึงได้
import { fetchApi } from './authService'; // หรือ path ที่ถูกต้อง เช่น '@/utils/authService'

/**
 * (Admin) ดึงข้อมูลสินค้าทั้งหมด
 * API: GET /admin/products
 */
export const adminGetAllProducts = async (page = 1, limit = 100) => {
  console.log(`[adminProductService] Admin: Getting all products. Page: ${page}, Limit: ${limit}`);
  // ใช้ fetchApi ที่ import มา
  return fetchApi(`/admin/products?page=${page}&limit=${limit}`);
};

/**
 * (Admin) สร้างสินค้าใหม่
 * API: POST /admin/product
 * @param {object} productData - ข้อมูลสินค้าที่จะสร้าง
 */
export const adminCreateProduct = async (productData) => {
  console.log('[adminProductService] Admin: Creating new product, wrapping in array for API:', productData);
  // API คาดหวัง Array, ดังนั้นเราจะส่งเป็น Array ที่มี Object สินค้าเดียว
  return fetchApi('/admin/product', {
    method: 'POST',
    body: JSON.stringify([productData]),
  });
};

/**
 * (Admin) ดึงข้อมูลสินค้าตาม ID (สำหรับแก้ไข)
 * API: GET /admin/product/:id
 */
export const adminGetProductById = async (productId) => {
  if (!productId) throw new Error('Product ID is required');
  console.log(`[adminProductService] Admin: Getting product by ID: ${productId}`);
  return fetchApi(`/admin/product/${productId}`);
};

/**
 * (Admin) อัปเดตข้อมูลสินค้า
 * API: PUT /admin/product/:id
 */
export const adminUpdateProduct = async (productId, productData) => {
  if (!productId) throw new Error('Product ID is required for update');
  console.log(`[adminProductService] Admin: Updating product ID: ${productId}`, productData);
  return fetchApi(`/admin/product/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

/**
 * (Admin) ลบสินค้า
 * API: DELETE /admin/product/:id
 */
export const adminDeleteProduct = async (productId) => {
  if (!productId) throw new Error('Product ID is required for delete');
  console.log(`[adminProductService] Admin: Deleting product ID: ${productId}`);
  return fetchApi(`/admin/product/${productId}`, {
    method: 'DELETE',
  });
};

/**
 * (Admin) ดึงข้อมูลหมวดหมู่สินค้าทั้งหมด
 * API: GET /admin/categories/
 */
export const adminGetAllCategories = async () => {
  console.log('[adminProductService] Admin: Getting all categories from /admin/categories/');
  return fetchApi('/admin/categories/');
};

/**
 * (Admin) ดึงข้อมูลสินค้าตามหมวดหมู่
 * API: GET /admin/categories/filter/:categoryId
 */
export const adminGetProductsByCategory = async (categoryId, page = 1, limit = 100) => {
  if (!categoryId || String(categoryId).trim() === '') {
    console.warn('[adminProductService] Admin: Category ID is required to fetch products by category. Fetching all products instead.');
    return adminGetAllProducts(page, limit); // ถ้าไม่มี categoryId, ให้ดึงสินค้าทั้งหมด
  }
  console.log(`[adminProductService] Admin: Getting products for category ID: ${categoryId}. Page: ${page}, Limit: ${limit}`);
  // ใช้ fetchApi ที่ import มา และ Path ที่คุณระบุล่าสุด
  return fetchApi(`/admin/categories/filter/${categoryId}?page=${page}&limit=${limit}`);
};

export const adminCreateProductWithImages = async (productData, imageFileObjects) => {
  console.log('[adminProductService] adminCreateProductWithImages called.');
  console.log('[adminProductService] Received Product Data:', productData);
  console.log('[adminProductService] Received Image File Objects:', imageFileObjects);

  const formData = new FormData();

  formData.append('name', productData.name || '');
  formData.append('description', productData.description || '');
  formData.append('price', String(productData.price || 0));
  formData.append('quantity', String(productData.quantity || 0));
  formData.append('category_id', String(productData.category_id || ''));

  if (imageFileObjects && imageFileObjects.length > 0) {
    console.log(`[adminProductService] Appending ${imageFileObjects.length} image files with field name "images"...`);
    for (let i = 0; i < imageFileObjects.length; i++) {
      const file = imageFileObjects[i];
      if (file instanceof File) {
        // VVVVVV เปลี่ยนจาก 'images_0' เป็น 'images' VVVVVV
        formData.append('images', file, file.name); 
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        console.log(`[adminProductService] Appended file to FormData: images, Name: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
      } else {
        console.warn('[adminProductService] An item in imageFileObjects is not a File object:', file);
      }
    }
  } else {
    console.log('[adminProductService] No new image files were provided to append.');
  }

  console.log('[adminProductService] FormData entries just before sending:');
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`  Key: ${pair[0]}, File: { name: "${pair[1].name}", size: ${pair[1].size}, type: "${pair[1].type}" }`);
    } else {
      console.log(`  Key: ${pair[0]}, Value: "${pair[1]}"`);
    }
  }

  try {
    // ใช้ fetchApi หรือ fetchWithCredentials ที่แก้ไขเรื่อง Content-Type แล้ว
    const response = await fetchApi('/admin/product/bulk', { 
      method: 'POST',
      body: formData,
    });
    console.log('[adminProductService] Product creation API response received.');
    return response;
  } catch (error) {
    console.error('[adminProductService] Error during product creation API call:', error);
    throw error; 
  }
};