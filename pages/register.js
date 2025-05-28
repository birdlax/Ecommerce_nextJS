// pages/register.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // หรือ path ที่ถูกต้อง

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { register, isAuthenticated, isLoading: authIsLoading } = useAuth(); // ดึง register function จาก AuthContext

  // Redirect ถ้า login อยู่แล้ว
  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      router.replace('/'); // หรือ '/profile'
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (password.length < 6) { // เพิ่มการ validate ความยาวรหัสผ่านเบื้องต้น
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
    }
    setError('');
    setLoading(true);

    try {
      // เรียกใช้ register function จาก AuthContext
      // ซึ่งภายใน AuthContext จะเรียก apiRegisterUser จาก authService.js อีกที
      const registeredData = await register({ 
        firstName, // ส่งเป็น firstName, lastName ให้ตรงกับที่ authService คาดหวัง
        lastName, 
        email, 
        password 
      });
      
      console.log('Registration successful data:', registeredData);
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ');
      router.push('/login'); // ไปหน้า login หลังสมัครสำเร็จ
    } catch (err) {
      console.error('Registration page error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  const storeName = "ชื่อร้านของคุณ";
  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 transition-colors duration-150";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  if (authIsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  // ถ้า login อยู่แล้ว useEffect ด้านบนจะ redirect ไป

  return (
    <>
      <Head>
        <title>สมัครสมาชิก - {storeName}</title>
        <meta name="description" content={`สร้างบัญชีใหม่กับ ${storeName} เพื่อรับสิทธิพิเศษ`} />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-xl shadow-2xl">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              สร้างบัญชีผู้ใช้ใหม่
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label htmlFor="firstName" className={labelClass}>ชื่อจริง</label>
                <input id="firstName" name="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} disabled={loading} />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>นามสกุล</label>
                <input id="lastName" name="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} disabled={loading} />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className={labelClass}>อีเมล</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} disabled={loading} />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>รหัสผ่าน</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} disabled={loading} placeholder="อย่างน้อย 6 ตัวอักษร"/>
            </div>
            <div>
              <label htmlFor="confirm-password" className={labelClass}>ยืนยันรหัสผ่าน</label>
              <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} disabled={loading} />
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center pt-1">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'สมัครสมาชิก'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              มีบัญชีอยู่แล้ว?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                 เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;