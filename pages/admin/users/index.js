// pages/admin/users/index.js
import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
// import Image from 'next/image'; // ไม่ได้ใช้ Image โดยตรงในหน้านี้ (อาจจะอยู่ใน UserRow ถ้ามีรูป Profile)
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { adminGetAllUsers, adminDeleteUserById } from '@/utils/adminService';

const USERS_PER_PAGE = 10; // <--- **ประกาศค่าคงที่นี้**

// --- Icons (ตัวอย่าง) ---
const RefreshIcon = ({isLoading = false}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2H15" />
    </svg>
);
// const PlusIcon = () => ( ... ); // ถ้ามีปุ่ม Add User

// Component ย่อยสำหรับแสดงแต่ละแถวของ User ในตาราง
const UserRow = ({ u, currentUser, onDelete }) => (
  <tr key={u.ID} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{u.ID}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
      {`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'N/A'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm">
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100' 
                           : 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
      }`}>
          {u.role}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
      {u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric'}) : 'N/A'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
      <Link href={`/admin/users/edit/${u.ID}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
        แก้ไข
      </Link>
      {currentUser && u.ID !== currentUser.id && ( // currentUser คือ adminUser ที่ login อยู่
          <button 
            onClick={() => onDelete(u.ID, `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email)} 
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
              ลบ
          </button>
      )}
    </td>
  </tr>
);


// --- Component หลักที่เก็บ Logic และ JSX ของเนื้อหาหน้านี้ ---
const ManageUsersPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin, user: adminUser } = useAuth(); // user คือ adminUser
  const router = useRouter();

  const [usersList, setUsersList] = useState([]);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1, totalPages: 1, totalItems: 0, perPage: USERS_PER_PAGE,
  });
  const [loadingPageData, setLoadingPageData] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const initialLoadPerformed = useRef(false); // Track ว่า initial data load เสร็จหรือยัง


  const fetchAllAdminUsers = useCallback(async (page = 1) => {
    if (isAuthenticated && isAdmin) {
      setLoadingPageData(true); 
      setPageError(null); // เคลียร์ error เก่าก่อน fetch
      // ไม่จำเป็นต้องเคลียร์ actionMessage ที่นี่ เพราะอาจจะมาจากการ delete/update ก่อนหน้า
      try {
        const data = await adminGetAllUsers(page, USERS_PER_PAGE);
        
        setUsersList(data?.items || []); // API ของคุณควรคืน items array
        setPaginationData({
          currentPage: data?.current_page || page,
          totalPages: data?.total_pages || 1,
          totalItems: data?.total_items || 0,
          perPage: data?.per_page || USERS_PER_PAGE,
        });
        console.log("[AdminUsersPage] All Users Fetched:", data);
      } catch (err) {
        console.error("[AdminUsersPage] Failed to fetch users:", err);
        setPageError(err.message || 'Could not load users list.');
        setUsersList([]); // เคลียร์ users ถ้า error
        setPaginationData(prev => ({ ...prev, currentPage: page, totalPages: 1, totalItems: 0 }));
      } finally {
        setLoadingPageData(false);
      }
    } else {
      // ถ้าไม่ authenticated หรือไม่ใช่ admin ก็เคลียร์ข้อมูลและหยุด loading
      setUsersList([]);
      setPaginationData({ currentPage: 1, totalPages: 1, totalItems: 0, perPage: USERS_PER_PAGE });
      setLoadingPageData(false);
    }
  }, [isAuthenticated, isAdmin]); // Dependencies หลักของ fetchAllAdminUsers


  // Effect 1: Route Protection และ Initial Data Load
  useEffect(() => {
    console.log("[AdminUsersPage] Initial Load & Auth Check Effect. AuthLoading:", authIsLoading, "IsAuth:", isAuthenticated, "IsAdmin:", isAdmin);
    if (!authIsLoading) { // รอให้ Auth check จาก AuthContext เสร็จก่อน
      if (!isAuthenticated || !isAdmin) {
        const redirectPath = isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`;
        router.replace(redirectPath);
      } else if (!initialLoadPerformed.current) { // ทำงานเฉพาะเมื่อยังไม่ได้ initial load
        const pageFromQuery = parseInt(router.query.page) || 1; // อ่าน page จาก URL ถ้ามี
        console.log(`[AdminUsersPage] Performing initial data load for page: ${pageFromQuery}`);
        fetchAllAdminUsers(pageFromQuery);
        initialLoadPerformed.current = true; // ตั้งค่าว่า initial load เสร็จแล้ว
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router, fetchAllAdminUsers]); // เพิ่ม router.asPath ถ้า redirect path เปลี่ยนบ่อย

  // Effect 2: Re-fetch Users เมื่อ page query parameter เปลี่ยน (หลังจาก initial load)
  useEffect(() => {
    const pageFromQuery = parseInt(router.query.page) || 1;
    console.log(`[AdminUsersPage] Page Query Effect. Page from query: ${pageFromQuery}, Current page in state: ${paginationData.currentPage}, Initial load done: ${initialLoadPerformed.current}`);
    
    // ทำงานเมื่อ router พร้อม, initial load เสร็จแล้ว, และ auth state พร้อม
    if (router.isReady && initialLoadPerformed.current && !authIsLoading && isAuthenticated && isAdmin) {
      if (pageFromQuery !== paginationData.currentPage) {
        console.log(`[AdminUsersPage] Page query changed to ${pageFromQuery}, refetching users.`);
        fetchAllAdminUsers(pageFromQuery);
      }
    }
  }, [router.query, router.isReady, authIsLoading, isAuthenticated, isAdmin, fetchAllAdminUsers, paginationData.currentPage]);


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages && newPage !== paginationData.currentPage) {
      // อัปเดต URL, useEffect ด้านบนจะ re-fetch ข้อมูล
      router.push(`/admin/users?page=${newPage}`, undefined, { shallow: false });
    }
  };

  const handleDeleteUser = async (userIdToDelete, userName) => {
    if (!window.confirm(`คุณต้องการลบผู้ใช้ "${userName || 'User'}" (ID: ${userIdToDelete}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
    
    setActionMessage({ type: '', text: ''});
    // setLoadingPageData(true); // หรือใช้ loading state แยกสำหรับ action นี้
    try {
        await adminDeleteUserById(userIdToDelete);
        setActionMessage({ type: 'success', text: `ผู้ใช้ "${userName || 'User'}" ถูกลบเรียบร้อยแล้ว` });
        // Refresh list โดยใช้หน้าปัจจุบันของ pagination
        await fetchAllAdminUsers(paginationData.currentPage); 
    } catch (err) {
        console.error("Admin: Failed to delete user:", err);
        setActionMessage({ type: 'error', text: err.message || `Could not delete user ${userName || 'User'}.` });
        // setLoadingPageData(false); // ถ้าใช้ loading state แยก
    }
  };

  // ----- UI Rendering Logic -----
  const storeName = "ชื่อร้านของคุณ";

  if (authIsLoading || (loadingPageData && !initialLoadPerformed.current)) {
    return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูล...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError || "คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้"}</div>;
  }
  if (pageError && usersList.length === 0 && !loadingPageData) { // ถ้ามี error ตอนโหลด และไม่มี user แสดง
      return <div className="p-6 text-center text-red-500 dark:text-red-400">{pageError}</div>;
  }

  return (
    <>
      <Head>
        <title>จัดการผู้ใช้งาน - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
          ผู้ใช้งานทั้งหมดในระบบ
        </h1>
        <div className="flex gap-3">
            <button
                onClick={() => fetchAllAdminUsers(paginationData.currentPage)}
                disabled={loadingPageData}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 flex items-center gap-2"
            >
                <RefreshIcon isLoading={loadingPageData} />
                {loadingPageData && usersList.length > 0 ? 'กำลังรีเฟรช...' : (loadingPageData ? 'กำลังโหลด...' : 'รีเฟรช')}
            </button>
            {/* <Link href="/admin/users/new" className="...">+ เพิ่มผู้ใช้ใหม่</Link> */}
        </div>
      </div>

      {actionMessage.text && (
        <div className={`mb-4 p-4 text-sm rounded-lg ${
            actionMessage.type === 'success' ? 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30' 
                                           : 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30'
        }`}>
            {actionMessage.text}
        </div>
      )}
      {/* แสดง pageError ถ้ามี และไม่ใช่ loading และ usersList ว่าง */}
      {pageError && !loadingPageData && usersList.length === 0 && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg">{pageError}</div>}


      {usersList.length === 0 && !pageError && !loadingPageData && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <p className="text-slate-500 dark:text-slate-400">ไม่พบข้อมูลผู้ใช้งานในระบบ</p>
        </div>
      )}

      {usersList.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">วันที่สมัคร</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {usersList.map((u) => (
                <UserRow key={u.ID} u={u} currentUser={adminUser} onDelete={handleDeleteUser} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination UI */}
      {paginationData && paginationData.totalPages > 1 && usersList.length > 0 && !pageError && (
        <nav aria-label="Pagination" className="mt-12 flex justify-center items-center space-x-1 sm:space-x-2 text-sm">
          <button
            onClick={() => handlePageChange(paginationData.currentPage - 1)}
            disabled={paginationData.currentPage <= 1 || loadingPageData}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>&laquo;
          </button>
          {[...Array(paginationData.totalPages).keys()].map(num => {
              const pageNum = num + 1;
              const isCurrent = paginationData.currentPage === pageNum;
              const showPage = paginationData.totalPages <= 7 || pageNum === 1 || pageNum === paginationData.totalPages || (pageNum >= paginationData.currentPage - 1 && pageNum <= paginationData.currentPage + 1) || (paginationData.currentPage <= 3 && pageNum <= 4) || (paginationData.currentPage >= paginationData.totalPages - 2 && pageNum >= paginationData.totalPages - 3);
              const showEllipsisBefore = paginationData.totalPages > 7 && pageNum === paginationData.currentPage - 2 && paginationData.currentPage > 3;
              const showEllipsisAfter = paginationData.totalPages > 7 && pageNum === paginationData.currentPage + 2 && paginationData.currentPage < paginationData.totalPages - 2;
              if (showPage) {
                  return ( <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={loadingPageData || isCurrent} aria-current={isCurrent ? "page" : undefined} className={`px-3 py-2 border rounded-md transition-colors min-w-[36px] ${isCurrent ? 'bg-indigo-600 text-white border-indigo-600 cursor-default' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50'}`}> {pageNum} </button> );
              }
              if(showEllipsisBefore || showEllipsisAfter) { return <span key={`ellipsis-${pageNum}`} className="px-1 py-2 text-slate-500 dark:text-slate-400">...</span>; }
              return null;
          })}
          <button
            onClick={() => handlePageChange(paginationData.currentPage + 1)}
            disabled={paginationData.currentPage >= paginationData.totalPages || loadingPageData}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>&raquo;
          </button>
        </nav>
      )}
    </>
  );
};

// --- Page Component หลัก และ getLayout ---
// เปลี่ยนชื่อ Wrapper Component หรือใช้ Content Component เป็น Default Export โดยตรง
const ManageUsersPage = () => {
    return <ManageUsersPageContent />;
}

ManageUsersPage.getLayout = function getLayout(page) {
  return <AdminLayout title="จัดการผู้ใช้งาน">{page}</AdminLayout>;
};

export default ManageUsersPage;