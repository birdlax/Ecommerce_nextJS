// pages/profile.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // ปรับ path ถ้าจำเป็น

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300 text-lg">กำลังโหลดโปรไฟล์...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300 text-lg">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300 text-lg">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้...</p>
      </div>
    );
  }

  const storeName = "ชื่อร้านของคุณ"; // หรือดึงมาจาก config
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ผู้ใช้';

  return (
    <>
      <Head>
        <title>{`โปรไฟล์ของ ${fullName} - ${storeName}`}</title>
        <meta name="description" content={`ดูและจัดการข้อมูลโปรไฟล์ของคุณ ${fullName} ที่ ${storeName}`} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                โปรไฟล์ของฉัน
              </h1>
              {/* Optional: Avatar */}
              <div className="mt-4 mx-auto md:mx-0 w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-4xl font-semibold text-indigo-600 dark:text-indigo-300 uppercase">
                {user.first_name ? user.first_name.charAt(0) : (user.email ? user.email.charAt(0) : '?')}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">ชื่อจริง:</label>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{user.first_name || 'ยังไม่ได้ระบุ'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">นามสกุล:</label>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{user.last_name || 'ยังไม่ได้ระบุ'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">อีเมล:</label>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{user.email || 'ยังไม่ได้ระบุ'}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">บทบาท (Role):</label>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">{user.role || 'ยังไม่ได้ระบุ'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">รหัสสมาชิก (ID):</label>
                <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{user.id}</p>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors"
                  onClick={() => alert('ฟังก์ชันแก้ไขโปรไฟล์ยังไม่พร้อมใช้งาน')}
                >
                  แก้ไขโปรไฟล์ (เร็วๆ นี้)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;