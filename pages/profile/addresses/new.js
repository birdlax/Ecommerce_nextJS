// pages/profile/addresses/new.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { createAddress, setDefaultAddress } from '@/utils/addressService'; // เพิ่ม setDefaultAddress
import AddressForm from '@/components/forms/AddressForm'; // Import AddressForm
import Link from 'next/link';

const AddAddressPage = () => {
  const { isAuthenticated, isLoading: authIsLoading, user } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect ถ้ายังไม่ได้ login
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile/addresses/new');
    }
  }, [authIsLoading, isAuthenticated, router]);

  const handleAddAddress = async (formData) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // API ของคุณสำหรับ CreateAddress อาจจะไม่ได้รับ is_default โดยตรง
      // แต่มักจะสร้าง Address ก่อน แล้วค่อยเรียก API ตั้ง Default แยกต่างหากถ้า is_default เป็น true
      const { is_default, ...addressDataForCreation } = formData; // แยก is_default ออก

      const newAddress = await createAddress(addressDataForCreation); // API: POST /api/addresses/
      alert('เพิ่มที่อยู่ใหม่สำเร็จ!');

      if (newAddress && newAddress.id && is_default) {
        // ถ้าผู้ใช้เลือก "ตั้งเป็นที่อยู่หลัก" ให้เรียก API setDefaultAddress
        try {
            await setDefaultAddress(newAddress.id);
            alert('ตั้งค่าที่อยู่หลักสำเร็จแล้ว');
        } catch (defaultErr) {
            console.error("Failed to set new address as default:", defaultErr);
            // อาจจะแจ้ง user ว่าเพิ่มที่อยู่ได้ แต่ตั้ง default ไม่สำเร็จ
        }
      }
      // ถ้ามี user context และต้องการ update default_address ใน user context ทันที
      // อาจจะต้องเรียก auth.checkAuthStatus() หรือมีฟังก์ชัน update user ใน auth context
      router.push('/profile/addresses'); // กลับไปหน้ารายการที่อยู่
    } catch (err) {
      console.error("Failed to create address:", err);
      setSubmitError(err.message || 'Could not create address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }
  if (!isAuthenticated) return null; // useEffect จะ redirect

  const storeName = "ชื่อร้านของคุณ";

  return (
    <>
      <Head>
        <title>เพิ่มที่อยู่ใหม่ - {storeName}</title>
      </Head>
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
            <Link href="/profile/addresses" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                &larr; กลับไปหน้ารายการที่อยู่
            </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6">
          เพิ่มที่อยู่ใหม่
        </h1>
        <AddressForm 
            onSubmit={handleAddAddress} 
            isLoading={isSubmitting}
            error={submitError}
            submitButtonText="เพิ่มที่อยู่"
        />
      </main>
    </>
  );
};

export default AddAddressPage;