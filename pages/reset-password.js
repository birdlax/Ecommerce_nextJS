// pages/reset-password.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { resetPasswordWithToken } from '@/utils/authService'; // ตรวจสอบ Path Alias
import Link from 'next/link';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query; // ดึง token จาก URL query param

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenFromUrl, setTokenFromUrl] = useState('');

  useEffect(() => {
    // เมื่อ router พร้อม และ token มีค่าใน query param
    if (router.isReady && token) {
      if (Array.isArray(token)) { // ถ้า token เป็น array (ไม่ควรเกิด) ให้เอาตัวแรก
        setTokenFromUrl(token[0]);
      } else {
        setTokenFromUrl(token);
      }
    } else if (router.isReady && !token) {
        setError("ไม่พบ Token สำหรับการตั้งรหัสผ่านใหม่ หรือ Token ไม่ถูกต้อง");
    }
  }, [router.isReady, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (!tokenFromUrl) {
        setError('Token ไม่ถูกต้องหรือไม่พบ กรุณาตรวจสอบลิงก์อีกครั้ง');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await resetPasswordWithToken(tokenFromUrl, newPassword);
      setSuccessMessage('ตั้งรหัสผ่านใหม่สำเร็จแล้ว! คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที');
      setNewPassword('');
      setConfirmNewPassword('');
      // อาจจะ redirect ไปหน้า login หลังจากผ่านไปสักครู่
      setTimeout(() => {
        router.push('/login');
      }, 3000); // Redirect หลัง 3 วินาที
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่ กรุณาลองอีกครั้ง หรือขอลิงก์ใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const storeName = "ชื่อร้านของคุณ";
  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  // ถ้า router ยังไม่พร้อม หรือ token ยังไม่ได้ถูก set (และยังไม่มี error เรื่อง token) ให้แสดง loading
  if (!router.isReady || (router.isReady && token === undefined && !error)) {
      return <div className="min-h-screen flex items-center justify-center"><p>กำลังโหลด...</p></div>;
  }

  return (
    <>
      <Head>
        <title>ตั้งรหัสผ่านใหม่ - {storeName}</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              ตั้งรหัสผ่านใหม่
            </h2>
          </div>

          {!tokenFromUrl && error && ( // แสดง error ถ้า token ไม่ถูกต้องตั้งแต่แรก
             <p className="text-sm text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>
          )}

          {tokenFromUrl && !successMessage && ( // แสดงฟอร์มต่อเมื่อมี token และยังไม่ success
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="newPassword" className={labelClass}>รหัสผ่านใหม่</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className={labelClass}>ยืนยันรหัสผ่านใหม่</label>
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                  disabled={isLoading}
                />
              </div>

              {error && !successMessage && (
                <p className="text-sm text-red-500 dark:text-red-400 text-center pt-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !tokenFromUrl}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-60"
                >
                  {isLoading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
                </button>
              </div>
            </form>
          )}

          {successMessage && (
            <div className="mt-8 text-center">
                <p className="text-lg text-green-600 dark:text-green-400">{successMessage}</p>
                <Link href="/login" className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    ไปหน้าเข้าสู่ระบบ &rarr;
                </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;