// utils/addressService.js (หรือชื่ออื่นที่เหมาะสม)

const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT';

// Helper function สำหรับ fetch API (ควรจะเหมือนกับ fetchWithCredentials ที่เราใช้ใน orderService หรือ authService)
// ตรวจสอบให้แน่ใจว่ามีการใส่ credentials: 'include'
async function addressFetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`; // Endpoint ควรจะขึ้นต้นด้วย /api/addresses
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
      try { errorPayload = await response.json(); } catch (e) { /* ignore */ }
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
 * ดึงรายการที่อยู่ทั้งหมดของผู้ใช้
 * API: GET /api/addresses/
 */
export const getUserAddresses = async () => {
  console.log('[addressService] Getting user addresses from /api/addresses/');
  return addressFetchApi('/api/addresses/');
};

/**
 * สร้างที่อยู่ใหม่
 * API: POST /api/addresses/
 * @param {object} addressData - ข้อมูลที่อยู่ที่จะสร้าง
 */
export const createAddress = async (addressData) => {
  console.log('[addressService] Creating new address:', addressData);
  return addressFetchApi('/api/addresses/', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
};

/**
 * ดึงข้อมูลที่อยู่ตาม ID
 * API: GET /api/addresses/:id
 */
export const getAddressById = async (addressId) => {
  console.log(`[addressService] Getting address by ID: ${addressId}`);
  return addressFetchApi(`/api/addresses/${addressId}`);
};

/**
 * อัปเดตที่อยู่
 * API: PUT /api/addresses/update/:id
 * @param {string|number} addressId - ID ของที่อยู่ที่จะอัปเดต
 * @param {object} addressData - ข้อมูลที่อยู่ใหม่
 */
export const updateAddress = async (addressId, addressData) => {
  console.log(`[addressService] Updating address ID: ${addressId} with data:`, addressData);
  return addressFetchApi(`/api/addresses/update/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
};

/**
 * ลบที่อยู่
 * API: DELETE /api/addresses/delete/:id
 */
export const deleteAddress = async (addressId) => {
  console.log(`[addressService] Deleting address ID: ${addressId}`);
  return addressFetchApi(`/api/addresses/delete/${addressId}`, {
    method: 'DELETE',
  });
};

/**
 * ตั้งค่าที่อยู่หลัก
 * API: PUT /api/addresses/default/:id
 */
export const setDefaultAddress = async (addressId) => {
  console.log(`[addressService] Setting address ID: ${addressId} as default`);
  return addressFetchApi(`/api/addresses/default/${addressId}`, {
    method: 'PUT',
    // API นี้อาจจะไม่ต้องการ body หรืออาจจะต้องการ body ว่างๆ ก็ได้
    // body: JSON.stringify({}), // ถ้า API ต้องการ empty JSON body
  });
};