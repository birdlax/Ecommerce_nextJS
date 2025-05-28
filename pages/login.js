// pages/login.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง

const LoginPage = () => {
  const [email, setEmail] = useState('Birdlax@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      const redirectPath = typeof router.query.redirect === 'string' ? router.query.redirect : '/';
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setSubmitLoading(true);
    try {
      await login(email, password);
      // Redirect จะถูกจัดการโดย useEffect
    } catch (err) {
      console.error('Login page submission error object:', err); // คุณควรจะเห็น Error object ที่มี message "User not found" หรือ "Invalid password" ที่นี่
      const errorMessage = err.message || 'เกิดข้อผิดพลาด ไม่สามารถเข้าสู่ระบบได้';

      // แปลง Error Message จาก API ให้เป็นมิตรกับผู้ใช้มากขึ้น
      if (errorMessage.toLowerCase().includes('user not found')) {
        setError('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง หรือสมัครสมาชิกใหม่');
      } else if (errorMessage.toLowerCase().includes('invalid password')) {
        setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (errorMessage.toLowerCase().includes('failed to fetch')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ');
      }
      else {
        // ถ้าเป็น error message อื่นๆ ที่ API อาจจะส่งมาโดยตรง
        // หรือถ้า error message จาก API ไม่ user-friendly พอ ก็อาจจะแสดงข้อความทั่วไป
        setError(errorMessage); // หรือ 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' สำหรับกรณีทั่วไป
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- ส่วน UI Rendering Logic (เหมือนเดิม) ---
  if (authIsLoading) { /* ... Loading UI ... */ }
  if (isAuthenticated && !authIsLoading) { /* ... Redirecting UI หรือ null ... */ }


  const storeName = "ชื่อร้านของคุณ";
  const inputClass = "appearance-none rounded-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-300 disabled:opacity-70";
  const labelClass = "sr-only";

  return (
    <>
      <Head>
        <title>เข้าสู่ระบบ - {storeName}</title>
        <meta name="description" content="เข้าสู่ระบบเพื่อเริ่มประสบการณ์ช้อปปิ้งที่ไม่เหมือนใคร" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              เข้าสู่ระบบบัญชีของคุณ
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className={labelClass}>อีเมล</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`${inputClass} rounded-t-md`}
                  placeholder="อีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>รหัสผ่าน</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`${inputClass} rounded-b-md`}
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center pt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end text-sm mt-5">
              <div className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300">
                <Link href={`/forgot-password${email ? '?email=' + encodeURIComponent(email) : ''}`}>
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-60 transition-colors duration-300"
              >
                {submitLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300">
                 สมัครสมาชิกที่นี่
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;