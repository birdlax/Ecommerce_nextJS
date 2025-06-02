// pages/admin/users/edit/[userId].js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { adminGetUserById, adminUpdateUserProfileById } from '@/utils/adminService';

const EditUserPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin, user: adminUser } = useAuth();
  const router = useRouter();
  const { userId } = router.query;

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
  });
  const [originalEmail, setOriginalEmail] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUserDetails = useCallback(async (id) => {
    if (isAuthenticated && isAdmin && id) {
      setLoadingPage(true);
      setPageError('');
      setFormError('');
      setSuccessMessage('');
      try {
        const data = await adminGetUserById(id);
        if (data) {
          setUserData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            role: data.role || 'user',
          });
          setOriginalEmail(data.email || '');
        } else {
          setPageError(`ไม่พบข้อมูลผู้ใช้สำหรับ ID: ${id}`);
        }
      } catch (err) {
        console.error("Admin: Failed to fetch user details for edit:", err);
        setPageError(err.message || 'Could not load user details.');
      } finally {
        setLoadingPage(false);
      }
    } else {
      setLoadingPage(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        const redirectPath = isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`;
        router.replace(redirectPath);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (router.isReady && userId && isAuthenticated && isAdmin && !authIsLoading) {
      fetchUserDetails(userId);
    } else if (router.isReady && !userId && !authIsLoading && isAuthenticated && isAdmin) {
        setPageError("ไม่พบ User ID ใน URL");
        setLoadingPage(false);
    }
  }, [router.isReady, userId, isAuthenticated, isAdmin, authIsLoading, fetchUserDetails]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setFormError("User ID ไม่ถูกต้อง ไม่สามารถบันทึกได้");
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    setSuccessMessage('');
    try {
      const dataToUpdate = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
      };
      await adminUpdateUserProfileById(userId, dataToUpdate);
      setSuccessMessage('อัปเดตข้อมูลผู้ใช้สำเร็จ!');
    } catch (err) {
      console.error("Admin: Failed to update user:", err);
      setFormError(err.message || 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading and Error States
  if (authIsLoading || (!router.isReady && !pageError && !userData.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">กำลังโหลด...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-lg font-medium mb-4">
          คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้
        </div>
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  if (loadingPage && !pageError && !userData.email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageError && !userData.email && !loadingPage) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-lg font-medium mb-4">
          เกิดข้อผิดพลาดในการโหลดข้อมูล
        </div>
        <p className="text-slate-700 dark:text-slate-300 mb-6">{pageError}</p>
        <Link 
          href="/admin/users" 
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับไปหน้ารายการผู้ใช้
        </Link>
      </div>
    );
  }

  if (router.isReady && !userId && !pageError) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-lg font-medium mb-4">
          ไม่พบ User ID ใน URL
        </div>
        <Link 
          href="/admin/users" 
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          กลับไปหน้ารายการผู้ใช้
        </Link>
      </div>
    );
  }

  if (!userData.email && !loadingPage && pageError) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-lg font-medium mb-4">
          {pageError}
        </div>
        <Link 
          href="/admin/users" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับไปหน้ารายการผู้ใช้
        </Link>
      </div>
    );
  }

  // Style Classes
  const inputClass = "mt-1 block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const buttonClass = "px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center";
  const primaryButtonClass = `${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`;
  const secondaryButtonClass = `${buttonClass} bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:ring-slate-500`;

  return (
    <>
      <Head>
        <title>แก้ไขผู้ใช้ #{userId} - Admin Panel</title>
      </Head>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/admin/users" 
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            กลับไปหน้ารายการผู้ใช้
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              แก้ไขข้อมูลผู้ใช้ <span className="text-indigo-600">ID: {userId}</span>
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className={labelClass}>อีเมล</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  value={originalEmail}
                  readOnly
                  className={`${inputClass} bg-slate-50 dark:bg-slate-700/80 cursor-not-allowed`} 
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ไม่สามารถแก้ไขอีเมลได้</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className={labelClass}>ชื่อจริง</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    id="first_name" 
                    value={userData.first_name} 
                    onChange={handleChange} 
                    disabled={isSubmitting} 
                    className={inputClass} 
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className={labelClass}>นามสกุล</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    id="last_name" 
                    value={userData.last_name} 
                    onChange={handleChange} 
                    disabled={isSubmitting} 
                    className={inputClass} 
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className={labelClass}>บทบาท</label>
                <select 
                  name="role" 
                  id="role" 
                  value={userData.role} 
                  onChange={handleChange} 
                  disabled={isSubmitting || (adminUser && adminUser.id === parseInt(userId))}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
                {adminUser && adminUser.id === parseInt(userId) && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    คุณไม่สามารถแก้ไขบทบาทของบัญชีที่คุณกำลังใช้งานอยู่ได้
                  </p>
                )}
              </div>
              
              {/* Status Messages */}
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{formError}</span>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={primaryButtonClass}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      บันทึกการเปลี่ยนแปลง
                    </>
                  )}
                </button>
                
                <Link 
                  href="/admin/users" 
                  className={secondaryButtonClass}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  ยกเลิก
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const EditUserPageWrapper = () => {
  return <EditUserPageContent />;
}

EditUserPageWrapper.getLayout = function getLayout(page) {
  return <AdminLayout title="แก้ไขผู้ใช้งาน">{page}</AdminLayout>;
};

export default EditUserPageWrapper;