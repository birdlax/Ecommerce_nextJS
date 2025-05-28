// pages/profile/addresses/edit/[addressId].js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getAddressById, updateAddress, setDefaultAddress } from '@/utils/addressService';
import AddressForm from '@/components/forms/AddressForm';
import Link from 'next/link';

const EditAddressPage = () => {
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { addressId } = router.query; // ดึง addressId จาก URL

  const [initialAddressData, setInitialAddressData] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch address details when component mounts and addressId is available
  const fetchAddressDetails = useCallback(async (id) => {
    if (!isAuthenticated) return;
    setLoadingPage(true);
    setSubmitError('');
    try {
      const data = await getAddressById(id);
      setInitialAddressData(data); // data จาก API ควรจะมี is_default field
      console.log("Fetched address for edit:", data);
    } catch (err) {
      console.error("Failed to fetch address details:", err);
      setSubmitError(err.message || 'Could not load address details.');
    } finally {
      setLoadingPage(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/profile/addresses/edit/${addressId}`);
    }
  }, [authIsLoading, isAuthenticated, router, addressId]);

  useEffect(() => {
    if (router.isReady && addressId && isAuthenticated && !authIsLoading) {
      fetchAddressDetails(addressId);
    }
  }, [router.isReady, addressId, isAuthenticated, authIsLoading, fetchAddressDetails]);

  const handleUpdateAddress = async (formData) => {
    if (!addressId) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const { is_default, ...addressDataForUpdate } = formData;
      await updateAddress(addressId, addressDataForUpdate); // API: PUT /api/addresses/update/:id
      alert('อัปเดตที่อยู่สำเร็จ!');

      if (is_default) { // ถ้าผู้ใช้ติ๊ก is_default ในฟอร์ม
        // ตรวจสอบว่าที่อยู่นี้เป็น default อยู่แล้วหรือไม่จาก initialAddressData
        // หรือจะเรียก setDefaultAddress เลยก็ได้ถ้า API จัดการเรื่องนี้ได้ดี
        if (!initialAddressData?.is_default) { // ถ้าเดิมยังไม่ใช่ default
            try {
                await setDefaultAddress(addressId);
                alert('ตั้งค่าที่อยู่หลักสำเร็จแล้ว');
            } catch (defaultErr) {
                console.error("Failed to set updated address as default:", defaultErr);
            }
        }
      }
      // อาจจะต้อง update user context ถ้า default_address เปลี่ยน
      // auth.checkAuthStatus();
      router.push('/profile/addresses');
    } catch (err) {
      console.error("Failed to update address:", err);
      setSubmitError(err.message || 'Could not update address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading || loadingPage) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading address details...</p></div>;
  }
  if (!isAuthenticated) return null;

  if (submitError && !initialAddressData) { // ถ้าโหลดข้อมูลครั้งแรกไม่สำเร็จ
      return <div className="min-h-screen flex items-center justify-center text-red-500"><p>Error: {submitError}</p></div>
  }
  if (!initialAddressData && !loadingPage) { // ถ้าโหลดเสร็จแล้วแต่ไม่พบข้อมูล
      return <div className="min-h-screen flex items-center justify-center"><p>ไม่พบข้อมูลที่อยู่</p></div>
  }

  const storeName = "ชื่อร้านของคุณ";

  return (
    <>
      <Head>
        <title>แก้ไขที่อยู่ - {storeName}</title>
      </Head>
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Link href="/profile/addresses" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                &larr; กลับไปหน้ารายการที่อยู่
            </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
          แก้ไขที่อยู่
        </h1>
        {initialAddressData && ( // แสดงฟอร์มเมื่อมี initialData
            <AddressForm 
                initialData={initialAddressData}
                onSubmit={handleUpdateAddress} 
                isLoading={isSubmitting}
                error={submitError}
                submitButtonText="บันทึกการเปลี่ยนแปลง"
            />
        )}
      </main>
    </>
  );
};

export default EditAddressPage;