// pages/profile/addresses.js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link'; // สำหรับปุ่ม "เพิ่มที่อยู่ใหม่" หรือ "แก้ไข" ที่อาจจะพาไปหน้าฟอร์ม
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserAddresses,
  deleteAddress,
  setDefaultAddress
} from '@/utils/addressService'; // Import service functions

// อาจจะสร้าง AddressCard component แยกต่างหากเพื่อความเรียบร้อย
const AddressCard = ({ address, onSetDefault, onDelete, onEdit, currentDefaultId }) => {
  const isDefault = address.id === currentDefaultId || address.is_default; // ใช้ is_default จาก API โดยตรง

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-md transition-all 
      ${isDefault ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg'}`}
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{address.full_name}</h3>
        {isDefault && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded-full">ค่าเริ่มต้น</span>
        )}
      </div>
      <address className="not-italic text-sm text-slate-600 dark:text-slate-300 space-y-0.5">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{address.city}, {address.province} {address.zip_code}</p>
        <p>{address.country}</p>
        <p>โทร: {address.phone}</p>
      </address>
      <div className="mt-4 pt-3 border-t dark:border-slate-600 flex flex-wrap gap-2 items-center">
        {!isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
          >
            ตั้งเป็นค่าเริ่มต้น
          </button>
        )}
        <Link href={`/profile/addresses/edit/${address.id}`} className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">
            แก้ไข
        </Link>
        <button
          onClick={() => onDelete(address.id)}
          className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
        >
          ลบ
        </button>
      </div>
    </div>
  );
};


const ManageAddressesPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // Error สำหรับ actions เช่น delete, set default

  const fetchAddresses = useCallback(async () => {
    if (isAuthenticated) {
      setLoadingAddresses(true);
      setError(null);
      setActionError(null);
      try {
        const data = await getUserAddresses(); // API: GET /api/addresses/
        setAddresses(Array.isArray(data) ? data : []);
        console.log("User Addresses:", data);
      } catch (err) {
        console.error("Failed to fetch user addresses:", err);
        setError(err.message || 'Could not load your addresses.');
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    } else {
      setAddresses([]);
      setLoadingAddresses(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile/addresses');
    }
  }, [authIsLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authIsLoading && isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, authIsLoading, fetchAddresses]);

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm(`คุณต้องการลบที่อยู่นี้ (ID: ${addressId}) ใช่หรือไม่?`)) return;
    setActionError(null);
    try {
      await deleteAddress(addressId);
      alert('ลบที่อยู่สำเร็จ!');
      fetchAddresses(); // Refresh list
    } catch (err) {
      console.error("Failed to delete address:", err);
      setActionError(err.message || 'Could not delete address.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setActionError(null);
    try {
      await setDefaultAddress(addressId);
      alert('ตั้งค่าที่อยู่หลักสำเร็จ!');
      fetchAddresses(); // Refresh list
      // อาจจะต้อง update user context ด้วยถ้า default_address ใน user object เปลี่ยน
      // auth.checkAuthStatus(); // สมมติว่า checkAuthStatus จะดึง user ใหม่ที่มี default_address ที่อัปเดตแล้ว
    } catch (err) {
      console.error("Failed to set default address:", err);
      setActionError(err.message || 'Could not set default address.');
    }
  };


  if (authIsLoading || loadingAddresses) {
    return <div className="min-h-screen flex items-center justify-center"><p>กำลังโหลดข้อมูลที่อยู่...</p></div>;
  }
  if (!isAuthenticated) return null; // useEffect จะ redirect

  const storeName = "ชื่อร้านของคุณ";
  const defaultAddressId = addresses.find(addr => addr.is_default)?.id;

  return (
    <>
      <Head>
        <title>จัดการที่อยู่ - {storeName}</title>
        <meta name="description" content={`จัดการสมุดที่อยู่ของคุณที่ ${storeName}`} />
      </Head>
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            จัดการที่อยู่
          </h1>
          <Link href="/profile/addresses/new" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors text-sm">
            เพิ่มที่อยู่ใหม่
          </Link>
        </div>

        {error && <div className="mb-4 text-center py-3 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md">{error}</div>}
        {actionError && <div className="mb-4 text-center py-3 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md">{actionError}</div>}


        {addresses.length === 0 && !error ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">คุณยังไม่มีที่อยู่ที่บันทึกไว้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <AddressCard 
                key={address.id} 
                address={address}
                onSetDefault={handleSetDefaultAddress}
                onDelete={handleDeleteAddress}
                onEdit={() => router.push(`/profile/addresses/edit/${address.id}`)} // onEdit พาไปหน้าแก้ไข
                currentDefaultId={defaultAddressId} // ส่ง ID ของที่อยู่ที่เป็น default ปัจจุบันไป
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default ManageAddressesPage;

// คุณจะต้องสร้างหน้าสำหรับเพิ่ม/แก้ไขที่อยู่ด้วย
// เช่น pages/profile/addresses/new.js
// และ pages/profile/addresses/edit/[addressId].js