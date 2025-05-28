// pages/profile.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // ตรวจสอบ Path Alias
import Link from 'next/link'; // Import Link

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isAuthenticated, authIsLoading, router]);

  if (authIsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-slate-700 dark:text-slate-300">Loading profile...</p></div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-lg text-slate-700 dark:text-slate-300">Please login to view your profile.</p></div>;
  }

  const storeName = "ชื่อร้านของคุณ";
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
              <div className="mt-4 mx-auto md:mx-0 w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-4xl font-semibold text-indigo-600 dark:text-indigo-300 uppercase">
                {user.first_name ? user.first_name.charAt(0) : (user.email ? user.email.charAt(0) : '?')}
              </div>
            </div>

            <div className="space-y-8"> {/* เพิ่ม space-y-8 ให้ section ต่างๆ ห่างกัน */}
              {/* User Information Section */}
              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b dark:border-slate-700 pb-2">ข้อมูลบัญชี</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">ชื่อจริง:</label>
                        <p className="mt-1 text-lg text-slate-800 dark:text-slate-100">{user.first_name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">นามสกุล:</label>
                        <p className="mt-1 text-lg text-slate-800 dark:text-slate-100">{user.last_name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg md:col-span-2">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">อีเมล:</label>
                        <p className="mt-1 text-lg text-slate-800 dark:text-slate-100">{user.email || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">บทบาท:</label>
                        <p className="mt-1 text-lg text-slate-800 dark:text-slate-100 capitalize">{user.role || 'N/A'}</p>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">รหัสสมาชิก:</label>
                        <p className="mt-1 text-lg text-slate-800 dark:text-slate-100">{user.id}</p>
                    </div>
                </div>
              </section>

              {/* Default Address Section */}
              <section>
                <div className="flex justify-between items-center mb-4 border-b dark:border-slate-700 pb-2">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        ที่อยู่ (Default Address)
                    </h2>
                    <Link href="/profile/addresses" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        จัดการที่อยู่ทั้งหมด &rarr;
                    </Link>
                </div>
                {user.default_address ? (
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-1 text-sm text-slate-700 dark:text-slate-200">
                    <p><strong>ผู้รับ:</strong> {user.default_address.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
                    <p><strong>ที่อยู่:</strong> {user.default_address.line1 || 'N/A'}</p>
                    {user.default_address.line2 && <p>{user.default_address.line2}</p>}
                    <p>
                      {user.default_address.city || 'N/A'}, {user.default_address.province || 'N/A'} {user.default_address.zip_code || 'N/A'}
                    </p>
                    <p>{user.default_address.country || 'N/A'}</p>
                    {/* ถ้า API ส่ง phone มากับ default_address ก็แสดงได้ */}
                    {user.default_address.phone && <p><strong>โทร:</strong> {user.default_address.phone}</p>}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                    <p className="text-slate-500 dark:text-slate-400">คุณยังไม่ได้ตั้งค่าที่อยู่เริ่มต้น</p>
                    <Link href="/profile/addresses/new" className="mt-3 inline-block px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600">
                        เพิ่มที่อยู่ใหม่
                    </Link>
                  </div>
                )}
              </section>

              {/* Action Buttons Section */}
              <section className="pt-6 border-t dark:border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors"
                        onClick={() => alert('ฟังก์ชันแก้ไขโปรไฟล์ยังไม่พร้อมใช้งาน')}
                        >
                        แก้ไขข้อมูลโปรไฟล์
                    </button>
                    <Link href="/orders" className="w-full sm:w-auto text-center px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 font-medium rounded-md transition-colors">
                        ดูคำสั่งซื้อของฉัน
                    </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;