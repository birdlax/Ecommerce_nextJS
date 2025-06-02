// pages/forgot-password.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { requestPasswordReset } from '@/utils/authService'; // ตรวจสอบ Path Alias

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // สำหรับ success หรือ error message
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('หากอีเมลของคุณมีอยู่ในระบบ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่ทางอีเมลเร็วๆ นี้');
      setEmail(''); // เคลียร์ฟอร์ม
    } catch (err) {
      console.error('Forgot password error:', err);
      // API อาจจะไม่ได้คืน error ที่เฉพาะเจาะจงสำหรับกรณี email ไม่มีในระบบ เพื่อความปลอดภัย
      // ดังนั้นเราอาจจะแสดงข้อความทั่วไป
      setError(err.message || 'เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง');
      setMessage('หากอีเมลของคุณถูกต้องและมีอยู่ในระบบ เราได้ส่งคำแนะนำการตั้งรหัสผ่านใหม่ไปให้แล้ว'); // แสดงข้อความคล้ายกันเพื่อไม่ให้รู้ว่าอีเมลมีในระบบหรือไม่
    } finally {
      setIsLoading(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";
  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <>
      <Head>
        <title>ลืมรหัสผ่าน - {storeName}</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              ลืมรหัสผ่าน?
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              กรอกอีเมลของคุณด้านล่างเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className={labelClass}>อีเมลที่ลงทะเบียน</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="กรอกอีเมลของคุณ"
                disabled={isLoading}
              />
            </div>

            {message && !error && ( // แสดง message เมื่อสำเร็จ (หรือเมื่อต้องการให้ user ไม่รู้ว่า email มีในระบบไหม)
              <p className="text-sm text-green-600 dark:text-green-400 text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">{message}</p>
            )}
            {error && ( // แสดง error ถ้ามีปัญหาจริงๆ จากฝั่ง server
              <p className="text-sm text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>
            )}


            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-60"
              >
                {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              &larr; กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;