// utils/authService.js
const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:YOUR_GO_API_PORT'; // ใส่ URL API หลักของคุณ (ไม่รวม /api ถ้ามี)

async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`; // endpoint ควรจะขึ้นต้นด้วย / เช่น /register
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  // สำหรับ Next.js 13+ App Router หรือถ้ามีการใช้ credentials ข้าม domain (อาจจะไม่ใช่กรณีนี้)
  // config.credentials = 'include'; // บอกให้ browser ส่ง cookies ไปด้วย

  const response = await fetch(url, config);

  // กรณี Logout อาจจะไม่มี JSON body หรือ response status 204
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    if (!response.ok) {
        // สำหรับ error ที่ไม่มี body เช่น 401 จาก logout ที่ไม่สำเร็จ
        throw new Error(`API request failed with status ${response.status}`);
    }
    return null; // หรือ { success: true } ตามที่ API คืนค่า
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`);
  }
  return data;
}

export const registerUser = async (userData) => {
  // userData ควรเป็น object เช่น { name, email, password }
  return fetchApi('/register', {
    method: 'POST',
    credentials: "include", 
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  // credentials ควรเป็น object เช่น { email, password }
  // API login จะ set HttpOnly cookie และควรคืนข้อมูลผู้ใช้
  return fetchApi('/login', {
    method: 'POST',
    credentials: "include", 
    body: JSON.stringify(credentials),
  });
};

export const logoutUser = async () => {
  // API logout ควรจะ clear HttpOnly cookie ฝั่ง server
  return fetchApi('/logout', {
    method: 'POST', // หรือ GET ตามที่ API คุณกำหนด
    credentials: "include", 
  });
};

export const getCurrentUser = async () => {
  try {
    const userData = await fetchApi('/profile/me');

    return userData;
  } catch (error) {
    return null;
  }
};