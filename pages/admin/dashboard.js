// pages/admin/dashboard.js
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout'; 

const AdminDashboardPage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, authIsLoading, isAdmin, router]);

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300 text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    // ส่วนนี้จะแสดงชั่วขณะก่อน useEffect ทำการ redirect
    // หรือถ้า useEffect มีปัญหาในการ redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-red-500 dark:text-red-400 text-lg">Access Denied. Redirecting...</p>
      </div>
    );
  }

  // ถ้าเป็น Admin และ Login อยู่
  return (
    <>
      {/* Head component ที่นี่จะถูก merge หรือ override โดย Head ใน AdminLayout
          ถ้า AdminLayout มี Head ที่ครอบคลุมแล้ว คุณอาจจะไม่จำเป็นต้องใส่ Head ที่นี่อีก
          แต่ถ้าใส่ ก็จะเป็นการเพิ่มหรือ override meta tags หรือ title เฉพาะหน้านี้
      */}
      <Head>
        {/* title นี้จะถูกใช้ถ้า AdminLayout ไม่ได้ set title หรือจะ override ถ้า AdminLayout อนุญาต */}
        {/* <title>Admin Dashboard - ชื่อร้านของคุณ</title> */}
        {/* meta robots ควรจะอยู่ใน AdminLayout เพื่อให้มีผลกับทุกหน้า admin */}
      </Head>

      {/* เนื้อหาของหน้า Admin Dashboard */}
      {/* ไม่ต้องมี <main> หรือ container หลักที่นี่ เพราะ AdminLayout ควรจะจัดการให้ */}
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
            Admin Dashboard
          </h1>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            ยินดีต้อนรับ, {user?.first_name || 'Admin'}!
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            นี่คือหน้าสำหรับจัดการส่วนต่างๆ ของเว็บไซต์ (ตัวอย่าง)
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">จัดการสินค้า</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">เพิ่ม, แก้ไข, ลบ สินค้าในระบบ</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">จัดการผู้ใช้</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">ดูและจัดการข้อมูลผู้ใช้งาน</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">ดูคำสั่งซื้อ</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">ตรวจสอบและจัดการคำสั่งซื้อทั้งหมด</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

AdminDashboardPage.getLayout = function getLayout(page) {
  return <AdminLayout title="Admin Dashboard">{page}</AdminLayout>;
};

export default AdminDashboardPage;