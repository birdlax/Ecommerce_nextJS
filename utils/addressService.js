// utils/addressService.js (หรือชื่ออื่นที่เหมาะสม)


import { fetchApi } from './authService';


export const getUserAddresses = async () => {
  console.log('[addressService] Getting user addresses from /api/addresses/');
  return fetchApi('/api/addresses/');
};

/**
 * สร้างที่อยู่ใหม่
 * API: POST /api/addresses/
 * @param {object} addressData - ข้อมูลที่อยู่ที่จะสร้าง
 */
export const createAddress = async (addressData) => {
  console.log('[addressService] Creating new address:', addressData);
  return fetchApi('/api/addresses/', {
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
  return fetchApi(`/api/addresses/${addressId}`);
};

/**
 * อัปเดตที่อยู่
 * API: PUT /api/addresses/update/:id
 * @param {string|number} addressId - ID ของที่อยู่ที่จะอัปเดต
 * @param {object} addressData - ข้อมูลที่อยู่ใหม่
 */
export const updateAddress = async (addressId, addressData) => {
  console.log(`[addressService] Updating address ID: ${addressId} with data:`, addressData);
  return fetchApi(`/api/addresses/update/${addressId}`, {
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
  return fetchApi(`/api/addresses/delete/${addressId}`, {
    method: 'DELETE',
  });
};

/**
 * ตั้งค่าที่อยู่หลัก
 * API: PUT /api/addresses/default/:id
 */
export const setDefaultAddress = async (addressId) => {
  console.log(`[addressService] Setting address ID: ${addressId} as default`);
  return fetchApi(`/api/addresses/default/${addressId}`, {
    method: 'PUT',
    // API นี้อาจจะไม่ต้องการ body หรืออาจจะต้องการ body ว่างๆ ก็ได้
    // body: JSON.stringify({}), // ถ้า API ต้องการ empty JSON body
  });
};