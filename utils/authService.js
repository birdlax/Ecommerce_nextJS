// utils/authService.js
const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:3000';
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const config = {
    ...options,
    headers,
    credentials: 'include', // credentials จะถูกใส่ให้ทุก request ที่ผ่านฟังก์ชันนี้
  };

  console.log(`[fetchApi] Requesting: ${options.method || 'GET'} ${url}`);
  if (options.body) {
  }

  const response = await fetch(url, config);
  console.log(`[fetchApi] Response status for ${url}: ${response.status}`);

  if (response.status === 204) {
    if (!response.ok) { 
        throw new Error(`API request ${response.statusText} with status ${response.status}`);
    }
    return null; // หรือ { success: true } ถ้า API Logout คืนแบบนั้น
  }
  
  // ถ้า content-length เป็น 0 แต่ไม่ใช่ 204 และไม่ ok
  if (response.headers.get('content-length') === '0' && !response.ok) {
      throw new Error(`API request ${response.statusText} with status ${response.status} and no content`);
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


export const loginUser = async (credentials) => {
  console.log('[authService] Logging in user with email:', credentials.email);
  return fetchApi('/login', { // สมมติ endpoint คือ /login ตามที่คุณให้มา
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const logoutUser = async () => {
  console.log('[authService] Logging out user...');
  return fetchApi('/logout', { // สมมติ endpoint คือ /logout
    method: 'POST', // หรือ GET ตามที่ API คุณกำหนด
    // ไม่จำเป็นต้องใส่ credentials: "include" ที่นี่อีก เพราะ fetchApi จัดการให้แล้ว
  });
};

export const getCurrentUser = async () => {
  console.log('[authService] Getting current user from /profile/me');
  try {
    // Endpoint นี้ควรจะคืนข้อมูล user ถ้ามี session cookie ที่ valid
    // หรือคืน 401 ถ้าไม่มี session / cookie ไม่ valid
    return await fetchApi('/profile/me'); // Endpoint ที่คุณใช้คือ /profile/me
  } catch (error) {
    // ถ้า fetchApi throw error (เช่น 401, 403, network error) จะมาเข้า catch นี้
    console.warn('[authService] getCurrentUser failed:', error.message);
    return null; // คืน null เพื่อให้ AuthContext รู้ว่าไม่ authenticated
  }
};

export const registerUser = async (userData) => {
  const payload = {
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: userData.password,
  };
  console.log('[authService] Registering user with payload:', payload);
  return fetchApi('/register', { // Endpoint คือ /register
    method: 'POST',
    body: JSON.stringify(payload),
  });
};