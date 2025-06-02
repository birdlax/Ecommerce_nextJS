// utils/authService.js
const API_URL = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:3000';
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // --- แก้ไขส่วน Headers ---
  const defaultHeaders = {};
  if (!(options.body instanceof FormData)) { // <--- **ตรวจสอบว่าเป็น FormData หรือไม่**
    // ตั้ง Content-Type เป็น application/json ต่อเมื่อ body ไม่ใช่ FormData
    defaultHeaders['Content-Type'] = 'application/json';
  }
  // --- สิ้นสุดการแก้ไขส่วน Headers ---

  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  // ถ้า body เป็น FormData, Content-Type header จะถูกลบออก (ถ้าเผลอใส่มาใน defaultHeaders)
  // หรือจะปล่อยให้ browser จัดการเองโดยไม่ใส่ Content-Type ใน defaultHeaders เลยก็ได้ถ้า body เป็น FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type']; // <--- **สำคัญ: ลบ Content-Type ที่อาจจะตั้งไว้ ถ้า body คือ FormData**
  }

  console.log(`[fetchApi] Requesting: ${config.method || 'GET'} ${url}`);
  if (options.body && !(options.body instanceof FormData)) { // Log body ถ้าไม่ใช่ FormData
    // console.log(`[fetchApi] Request Body:`, options.body); // ระวัง log sensitive data
  } else if (options.body instanceof FormData) {
    // console.log(`[fetchApi] Sending FormData body (content not logged for brevity)`);
  }

  const response = await fetch(url, config);
  console.log(`[fetchApi] Response status for ${url}: ${response.status}`);

  if (response.status === 204) { // No Content
    if (!response.ok && response.status !== 204) { // response.ok จะ false สำหรับ 204 ในบาง client
        console.error(`[fetchApi] API request for ${url} returned ${response.status} ${response.statusText} (expected 204)`);
        throw new Error(`API request ${response.statusText} with status ${response.status}`);
    }
    return null; 
  }
  
  if (response.headers.get('content-length') === '0' && !response.ok) {
      console.error(`[fetchApi] API request for ${url} returned ${response.status} ${response.statusText} with no content`);
      throw new Error(`API request ${response.statusText} with status ${response.status} and no content`);
  }

  let data;
  try {
    // ตรวจสอบ Content-Type ของ response ก่อนพยายาม parse เป็น JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // ถ้าไม่ใช่ JSON (เช่น text/html สำหรับ error page ของ server)
      // ให้พยายามอ่านเป็น text แล้ว throw error
      const textData = await response.text();
      if (!response.ok) {
        console.error(`[fetchApi] API Error (Non-JSON Response) for ${url}: Status ${response.status}, Body: ${textData.substring(0, 100)}...`);
        throw new Error(textData || `API request failed with status ${response.status}`);
      }
      // ถ้า response ok แต่ไม่ใช่ JSON (กรณีนี้ไม่ควรเกิดกับ API ที่ออกแบบดี)
      data = textData; // หรือจะ throw error ก็ได้
    }
  } catch (parseError) {
    if (!response.ok) {
      console.error(`[fetchApi] API response was not OK and failed to parse for ${url}:`, response.status, response.statusText, parseError);
      // พยายามอ่าน response body เป็น text เพื่อดู error message จาก server โดยตรง
      try {
        const errorText = await response.text();
        throw new Error(errorText || `API request failed with status ${response.status}: ${response.statusText}`);
      } catch (textError) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText} (and response body could not be read)`);
      }
    }
    console.error(`[fetchApi] API response was OK but not valid JSON for ${url}:`, parseError);
    throw new Error('Received malformed JSON response from server.');
  }

  if (!response.ok) {
    console.error(`[fetchApi] API Error (parsed) for ${url}:`, data);
    throw new Error(data?.error || data?.message || `API request failed with status ${response.status}`);
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

export const updateUserProfile = async (profileData) => {
  console.log('[authService] Updating user profile with data:', profileData);
  return fetchApi('/profile/me/updateprofile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};


export const updateUserPassword = async (passwordData) => {
  console.log('[authService] Updating user password.'); // ไม่ควร log passwordData ที่มีรหัสผ่าน
  return fetchApi('/profile/me/updatepassword', {
    method: 'POST',
    body: JSON.stringify(passwordData),
  });
};


export const requestPasswordReset = async (email) => {
  console.log(`[authService] Requesting password reset for email: ${email}`);
  return fetchApi('/forgot-password', { // Endpoint ที่คุณระบุ
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};


export const resetPasswordWithToken = async (token, newPassword) => {
  console.log(`[authService] Resetting password with token.`); // ไม่ควร log token หรือ newPassword
  return fetchApi('/reset-password', { // Endpoint ที่คุณระบุ
    method: 'POST',
    body: JSON.stringify({
      token: token,
      new_password: newPassword, // ตรงกับ JSON body ที่คุณระบุ
    }),
  });
};