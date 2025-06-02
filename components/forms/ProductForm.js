// components/forms/ProductForm.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // สำหรับ Preview

const ProductForm = ({
    initialData = {},
    onSubmit,
    isLoading,
    error,
    categories = [],
    loadingCategoriesForm, // สถานะการโหลด Categories จาก Page
    submitButtonText = "บันทึกสินค้า",
    cancelLink = "/admin/products"
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    category_id: '', // จะเป็น string จาก value ของ select
  });

  const [imageFiles, setImageFiles] = useState([]); // เก็บ File objects ที่เลือกใหม่
  const [imagePreviews, setImagePreviews] = useState([]); // เก็บ Data URLs สำหรับ preview
  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL || 'http://localhost:3000';

  // Effect to pre-fill form data and image previews
  useEffect(() => {
    // Pre-fill text data from initialData
    setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        quantity: initialData.quantity || 0,
        category_id: initialData.category_id ? String(initialData.category_id) : 
                        (categories.length > 0 && !loadingCategoriesForm && !initialData.category_id ? '' : (initialData.category_id ? String(initialData.category_id) : '')),
    });

    // Pre-fill existing images for Edit mode
    if (initialData.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
        const previews = initialData.images.map(img =>
            `${baseApiUrl}/${img.path.replace(/^\.\//, '')}`
        );
        setImagePreviews(previews);
        setImageFiles([]); // Clear any newly selected files if initialData is loaded (for edit)
    } else {
        // Reset for Add New mode or if no initial images
        setImagePreviews([]);
        setImageFiles([]);
    }
  }, [initialData, categories, loadingCategoriesForm, baseApiUrl]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const MAX_FILES = 5; 
      if (filesArray.length > MAX_FILES) {
         alert(`คุณสามารถอัปโหลดรูปภาพได้สูงสุด ${MAX_FILES} รูปต่อครั้ง`);
         e.target.value = null;
         return;
      }
      setImageFiles(filesArray);
      imagePreviews.filter(url => url.startsWith('blob:')).forEach(url => URL.revokeObjectURL(url));
      const newPreviewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviewsArray);
    } else {
      setImageFiles([]);
      imagePreviews.filter(url => url.startsWith('blob:')).forEach(url => URL.revokeObjectURL(url));
      // Revert to initial images if selection is cleared (for edit mode)
      const existingImageUrls = initialData?.images?.map(img => `${baseApiUrl}/${img.path.replace(/^\.\//, '')}`) || [];
      setImagePreviews(existingImageUrls);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => { if (url.startsWith('blob:')) { URL.revokeObjectURL(url); } });
    };
  }, [imagePreviews]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id) { 
        alert("กรุณาเลือกหมวดหมู่สินค้า"); 
        return; 
    }
    // For Add New mode, require images. For Edit mode, new images are optional.
    if (imageFiles.length === 0 && (!initialData || Object.keys(initialData).length === 0 || !initialData.images || initialData.images.length === 0)) {
        alert("กรุณาอัปโหลดรูปภาพสินค้าอย่างน้อย 1 รูป");
        return;
    }
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity, 10) || 0,
      category_id: parseInt(formData.category_id, 10),
    };
    onSubmit(dataToSubmit, imageFiles); 
  };

  // CSS Class Variables
  const inputClass = "block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 transition-colors disabled:opacity-70";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5";
  const buttonClass = "w-full px-4 py-2.5 font-semibold rounded-md transition-colors disabled:opacity-60";
  const primaryButtonClasses = `${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900`;
  const secondaryButtonClasses = `${buttonClass} bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900`;
  const fileInputClass = `block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/40 cursor-pointer disabled:opacity-50`;

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div>
            <label htmlFor="name" className={labelClass}>ชื่อสินค้า<span className="text-red-500 ml-1">*</span></label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div>
            <label htmlFor="description" className={labelClass}>รายละเอียดสินค้า</label>
            <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} disabled={isLoading} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label htmlFor="price" className={labelClass}>ราคา (บาท)<span className="text-red-500 ml-1">*</span></label>
                <input type="number" name="price" id="price" required value={formData.price} onChange={handleChange} disabled={isLoading} className={inputClass} step="0.01" min="0" />
            </div>
            <div>
                <label htmlFor="quantity" className={labelClass}>จำนวนในสต็อก<span className="text-red-500 ml-1">*</span></label>
                <input type="number" name="quantity" id="quantity" required value={formData.quantity} onChange={handleChange} disabled={isLoading} className={inputClass} step="1" min="0" />
            </div>
        </div>
         <div>
            <label htmlFor="category_id" className={labelClass}>หมวดหมู่<span className="text-red-500 ml-1">*</span></label>
            <select 
                name="category_id" 
                id="category_id" 
                required 
                value={formData.category_id} 
                onChange={handleChange} 
                disabled={isLoading || loadingCategoriesForm || !categories || categories.length === 0} 
                className={`${inputClass} cursor-pointer`}
            >
                <option value="" disabled={!!formData.category_id && formData.category_id !== ''}>
                    {loadingCategoriesForm ? 'กำลังโหลดหมวดหมู่...' : (categories.length === 0 ? 'ไม่มีหมวดหมู่ให้เลือก' : '-- กรุณาเลือกหมวดหมู่ --')}
                </option>
                {categories.map(cat => (
                    <option key={cat.ID} value={String(cat.ID)}>{cat.name}</option>
                ))}
            </select>
            {!loadingCategoriesForm && (!categories || categories.length === 0) && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ไม่พบหมวดหมู่สินค้าในระบบ กรุณาเพิ่มหมวดหมู่ก่อน</p>
            )}
        </div>
        <div>
            <label htmlFor="images" className={labelClass}>
                รูปภาพสินค้า (เลือกได้หลายรูป)
                {(!initialData?.images?.length && (!imageFiles || imageFiles.length === 0)) && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="file"
                name="images"
                id="images"
                multiple
                onChange={handleImageChange}
                disabled={isLoading}
                className={fileInputClass}
                accept="image/png, image/jpeg, image/webp"
            />
            {/* Image Previews (แสดงรูปที่เลือกใหม่ หรือรูปเดิมถ้ายังไม่ได้เลือกใหม่) */}
            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {imagePreviews.map((previewUrl, index) => (
                        <div key={previewUrl} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                            <Image 
                                src={previewUrl} 
                                alt={`Preview ${index + 1}`} 
                                fill 
                                style={{objectFit:"cover"}} 
                                sizes="100px" 
                                onError={(e) => { e.target.style.display = 'none'; /* Hide broken image */ }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>

        {error && <p className="text-sm text-center text-red-600 dark:text-red-400 py-2 px-3 bg-red-50 dark:bg-red-900/30 rounded-md shadow">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-3 pt-5 border-t border-slate-200 dark:border-slate-700">
             <Link href={cancelLink} className={`${secondaryButtonClasses} w-full sm:w-auto text-center`}>ยกเลิก</Link>
            <button type="submit" disabled={isLoading} className={`${primaryButtonClasses} w-full sm:w-auto`}>
                {isLoading ? 'กำลังบันทึก...' : submitButtonText}
            </button>
        </div>
    </form>
  );
};

export default ProductForm;