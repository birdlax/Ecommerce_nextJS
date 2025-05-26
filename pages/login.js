// pages/login.js
import { useState, useEffect } from 'react'; // useEffect ถูกเพิ่มเข้ามา
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; // ตรวจสอบ path ให้ถูกต้อง

const LoginPage = () => {
  const [email, setEmail] = useState('Birdlax@gmail.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false); // State loading สำหรับการ submit form
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authIsLoading } = useAuth(); // ดึง isLoading จาก AuthContext และเปลี่ยนชื่อเป็น authIsLoading

  // useEffect สำหรับ redirect ถ้าผู้ใช้ login อยู่แล้ว
  // จะทำงานเมื่อ authIsLoading เป็น false (การเช็ค auth ครั้งแรกเสร็จสิ้น) และ isAuthenticated เป็น true
  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      router.replace('/'); // หรือ '/profile' หรือหน้าที่คุณต้องการให้ไปหลัง login
    }
  }, [isAuthenticated, router, authIsLoading]); // เพิ่ม authIsLoading ใน dependency array


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true); // เริ่ม loading ของ form
    try {
      await login(email, password); // เรียกใช้ login จาก Context
      // การ redirect จะถูกจัดการโดย useEffect ข้างบน เมื่อ isAuthenticated เปลี่ยนเป็น true
      // ไม่จำเป็นต้อง router.push('/') ที่นี่โดยตรงหลัง login สำเร็จ
    } catch (err) {
      console.error('Login page submission error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
    } finally {
      setSubmitLoading(false); // สิ้นสุด loading ของ form
    }
  };

  // 1. ถ้า AuthContext กำลังโหลดข้อมูล (เช็คสถานะ login ครั้งแรก) ให้แสดง loading...
  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-300">กำลังตรวจสอบสถานะ...</p>
        {/* หรือจะใส่ Spinner component ที่นี่ก็ได้ */}
      </div>
    );
  }

  // 2. ถ้า AuthContext โหลดเสร็จแล้ว และผู้ใช้ login อยู่ (isAuthenticated)
  //    useEffect ด้านบนจะทำการ redirect ผู้ใช้ไปหน้าอื่น
  //    ดังนั้นเราอาจจะ return null หรือ loading state อีกแบบสั้นๆ ระหว่างรอ redirect
  //    เพื่อป้องกันไม่ให้ Form แสดงขึ้นมาแล้วหายไปอย่างรวดเร็ว
  if (isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <p className="text-slate-700 dark:text-slate-300">กำลังนำคุณไปยังหน้าหลัก...</p>
        </div>
    );
  }


  // 3. ถ้า AuthContext โหลดเสร็จแล้ว และผู้ใช้ยังไม่ได้ login (isAuthenticated เป็น false)
  //    ให้แสดง Form Login ตามปกติ
  return (
    <>
      <Head>
        <title>เข้าสู่ระบบ - ชื่อร้านของคุณ</title>
        <meta name="description" content="เข้าสู่ระบบเพื่อเริ่มประสบการณ์ช้อปปิ้งที่ไม่เหมือนใคร" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            {/* ถ้ามี Logo Component หรือ Image ก็ใส่ตรงนี้ */}
            {/* <Link href="/" passHref>
              <a className="flex justify-center mb-6">
                <Image src="/images/logo-dark.png" alt="ชื่อร้านของคุณ" width={60} height={60} className="dark:hidden" />
                <Image src="/images/logo-white.png" alt="ชื่อร้านของคุณ" width={60} height={60} className="hidden dark:block" />
              </a>
            </Link> */}
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              เข้าสู่ระบบบัญชีของคุณ
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">อีเมล</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-700 rounded-t-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-300"
                  placeholder="อีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">รหัสผ่าน</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-300"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitLoading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center pt-2">{error}</p>
            )}

            <div className="flex items-center justify-end text-sm mt-5">
              <div className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300">
                <Link href="/forgot-password"> {/* เราจะสร้างหน้านี้ทีหลัง */}
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-60 transition-colors duration-300"
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
                 สมัครสมาชิกที่นี่ {/* เราจะสร้างหน้านี้ทีหลัง */}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;