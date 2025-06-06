// utils/adminProductService.js

// สมมติว่าคุณมี fetchApi helper กลาง ที่จัดการเรื่อง auth/credentials
// และ API_URL ถูก define ในนั้น หรือใน environment variables ที่ fetchApi เข้าถึงได้
import { fetchApi } from './api';

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
export const adminUpdateProduct = async (productId, productData, newImageFiles, keepImagePaths = []) => {
  console.log(`[adminProductService] Updating product ID: ${productId}`);
  console.log('[adminProductService] Product Data:', productData);
  if (newImageFiles && newImageFiles.length > 0) {
    console.log('[adminProductService] New Image Files:', newImageFiles);
  }
  if (keepImagePaths && keepImagePaths.length > 0) {
    console.log('[adminProductService] Paths of existing images to keep:', keepImagePaths);
  }

  const formData = new FormData();
  formData.append('name', productData.name || '');
  formData.append('description', productData.description || '');
  formData.append('price', String(productData.price || 0));
  formData.append('quantity', String(productData.quantity || 0));
  formData.append('category_id', String(productData.category_id || ''));

  // Append new image files (ถ้ามี)
  // Backend API PUT /admin/product/:id จะต้องสามารถรับ field 'images' สำหรับไฟล์ใหม่ได้
  if (newImageFiles && newImageFiles.length > 0) {
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      if (file instanceof File) {
        formData.append('images', file, file.name); // ใช้ 'images' ตาม Postman example
      }
    }
  }

  // Append paths of existing images to keep
  // Backend จะต้องมี Logic ในการอ่านค่านี้และจัดการ (เช่น ไม่ลบรูปเหล่านี้)
  if (keepImagePaths && keepImagePaths.length > 0) {
    keepImagePaths.forEach(imgPath => {
      formData.append('keep_images', imgPath); // ส่งเป็น array โดย append ซ้ำๆ ด้วย key เดียวกัน
                                                // หรือถ้า Backend คาดหวัง keep_images[] ก็ใช้ชื่อนั้น
    });
  } else if (isEditMode && (!newImageFiles || newImageFiles.length === 0)) {
    // ถ้าเป็น Edit Mode และไม่มีรูปใหม่ที่อัปโหลด และไม่มีรูปเดิมที่เลือกเก็บไว้เลย
    // อาจจะต้องส่ง field พิเศษบอก Backend ว่าให้ลบรูปทั้งหมด หรือ Backend มี default logic
    // ในกรณีนี้ ถ้า keepImagePaths ว่าง และไม่มี newImageFiles อาจจะหมายความว่าลบรูปทั้งหมด
    // หรือถ้าต้องการให้มีรูปเสมอ อาจจะต้องมี validation ที่ Frontend
    // ถ้า API ของคุณต้องการให้ส่ง keep_images แม้จะเป็น array ว่าง ก็อาจจะ:
    // formData.append('keep_images', ''); // หรือวิธีที่ Backend กำหนดสำหรับ array ว่าง
  }


  console.log('[adminProductService] FormData for update (before send):');
  for (let pair of formData.entries()) {
    console.log(`  Key: ${pair[0]}, Value: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
  }

  return fetchApi(`/admin/product/${productId}`, {
    method: 'PUT',
    body: formData,
    // ไม่ต้องตั้ง Content-Type header
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