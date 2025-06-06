// utils/cartService.js
const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT';

async function cartFetchApi(endpoint, options = {}) {
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

  const response = await fetch(url, config);

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return null; // หรือ { success: true } ตาม API
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data;
}


export const getCart = async () => {
  return cartFetchApi("/cart"); // GET /cart
};

export const addItemToCart = async (productId, quantity) => {
  // POST /cart/item - body: { product_id, quantity }
  return cartFetchApi("/cart/item", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
};

export const removeItemCompletelyFromCart = async (productId) => {
  // DELETE /cart/items/:product_id
  return cartFetchApi(`/cart/items/${productId}`, {
    method: "DELETE",
  });
};

export const incrementCartItem = async (productId) => {
  // POST /cart/item/:product_id - เพิ่ม 1 ชิ้น
  return cartFetchApi(`/cart/item/${productId}`, {
    method: "POST",
  });
};

export const decrementCartItem = async (productId) => {
  // DELETE /cart/itemx/:product_id - ลด 1 ชิ้น
  return cartFetchApi(`/cart/itemx/${productId}`, {
    method: "DELETE",
  });
};

// ฟังก์ชันสำหรับ Checkout จะทำทีหลัง
export const checkoutCart = async (checkoutData) => {
  return cartFetchApi("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(checkoutData),
  });
};
