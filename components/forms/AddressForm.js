// components/forms/AddressForm.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
const AddressForm = ({ initialData = {}, onSubmit, isLoading, error, submitButtonText = "บันทึกที่อยู่" }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    zip_code: '',
    country: 'Thailand', // Default
    is_default: false,
    ...initialData, // Override defaults with initialData if provided (for edit mode)
  });

  // Update formData if initialData changes (for edit mode when data loads)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        province: initialData.province || '',
        zip_code: initialData.zip_code || '',
        country: initialData.country || 'Thailand',
        is_default: initialData.is_default || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ส่งเฉพาะ field ที่ API ต้องการจริงๆ (API ของคุณอาจจะไม่ต้องการ is_default ตอน create/update โดยตรง)
    // แต่จะ set default ผ่าน endpoint แยก /api/addresses/default/:id
    // ดังนั้น เราอาจจะส่ง is_default ไปด้วย แล้วให้ backend จัดการ หรือไม่ส่งก็ได้
    const dataToSubmit = { ...formData };
    onSubmit(dataToSubmit);
  };

  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-700/50";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="full_name" className={labelClass}>ชื่อ-นามสกุลผู้รับ</label>
          <input type="text" name="full_name" id="full_name" required value={formData.full_name} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>เบอร์โทรศัพท์</label>
          <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine1" className={labelClass}>ที่อยู่บรรทัด 1 (บ้านเลขที่, หมู่, ถนน)</label>
          <input type="text" name="addressLine1" id="addressLine1" required value={formData.addressLine1} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="addressLine2" className={labelClass}>ที่อยู่บรรทัด 2 (ตำบล/แขวง, อาคาร, ชั้น - ถ้ามี)</label>
          <input type="text" name="addressLine2" id="addressLine2" value={formData.addressLine2} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>เมือง/อำเภอ/เขต</label>
          <input type="text" name="city" id="city" required value={formData.city} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="province" className={labelClass}>จังหวัด</label>
          <input type="text" name="province" id="province" required value={formData.province} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="zip_code" className={labelClass}>รหัสไปรษณีย์</label>
          <input type="text" name="zip_code" id="zip_code" pattern="[0-9]{5}" title="กรุณากรอกรหัสไปรษณีย์ 5 หลัก" required value={formData.zip_code} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>ประเทศ</label>
          <input type="text" name="country" id="country" required value={formData.country} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div className="md:col-span-2 flex items-center pt-2">
            <input
                id="is_default"
                name="is_default"
                type="checkbox"
                checked={formData.is_default}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                ตั้งเป็นที่อยู่หลัก (Default Address)
            </label>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-4 pt-4 border-t dark:border-slate-700">
        <button type="submit" disabled={isLoading}
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {isLoading ? 'กำลังบันทึก...' : submitButtonText}
        </button>
        <Link href="/profile/addresses" className="px-6 py-2.5 bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 font-medium rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
            ยกเลิก
        </Link>
      </div>
    </form>
  );
};

export default AddressForm;