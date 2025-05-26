// utils/products.js หรือ utils/productService.js

// URL ของ Golang API (ควรมาจาก .env.local)
const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT/api';

export async function fetchAllProducts() {
  let products = [];
  let error = null;

  try {
    const res = await fetch(`${API_URL}/products`); // สมมติ endpoint คือ /products
    if (!res.ok) {
      throw new Error(`Failed to fetch products, status: ${res.status}`);
    }
    const data = await res.json();

    // ตรวจสอบว่า data ที่ได้เป็น array จริงๆ
    if (!Array.isArray(data)) {
      console.warn("Fetched products data is not an array:", data);
      throw new Error("Invalid data format received from API.");
    }
    products = data;

  } catch (e) {
    console.error("Error in fetchAllProducts:", e);
    error = e.message;
  }

  return { products, error }; // Return แค่ products และ error
}

// ฟังก์ชันดึงข้อมูลสินค้าชิ้นเดียวตาม ID
export async function fetchProductById(id) {
  let product = null;
  let error = null;
  try {
    // ใช้ endpoint `/product/[id]` ตามที่คุณระบุในตัวอย่างก่อนหน้า
    // และแก้ไขการใส่ตัวแปร id ใน URL ให้ถูกต้อง
    const res = await fetch(`${API_URL}/product/${id}`); // <--- จุดที่แก้ไข

    if (!res.ok) {
      if (res.status === 404) {
        // ไม่ใช่ error แต่ไม่พบสินค้า
        console.log(`Product with ID ${id} not found (404).`);
        return { product: null, error: null }; 
      }
      // สำหรับ error อื่นๆ
      const errorData = await res.text(); 
      throw new Error(`Failed to fetch product ${id}, status: ${res.status}, message: ${errorData}`);
    }
    product = await res.json();
  } catch (e) {
    console.error(`Error in fetchProductById for ID ${id}:`, e);
    error = e.message;
  }
  return { product, error };
}