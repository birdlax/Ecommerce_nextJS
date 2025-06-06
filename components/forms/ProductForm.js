// components/forms/ProductForm.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ProductForm = ({
    initialData = { name: '', description: '', price: 0, quantity: 0, category_id: '', images: [] },
    onSubmit, // Callback: onSubmit(productDataObject, newImageFiles, pathsOfKeptExistingImages)
    isLoading,
    error,
    categories = [],
    loadingCategoriesForm, // สถานะการโหลด Categories จาก Page
    isEditMode = false,
    submitButtonText = "บันทึก",
    cancelLink = "/admin/products"
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    quantity: initialData.quantity || 0,
    category_id: initialData.category_id ? String(initialData.category_id) : '',
  });

  const [newImageFiles, setNewImageFiles] = useState([]); // File objects ใหม่ที่ผู้ใช้เลือก
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Blob URLs สำหรับ preview รูปใหม่

  // สำหรับ Edit Mode: เก็บรูปภาพเดิมที่ "ยังคงอยู่" (ยังไม่ได้ถูกลบโดย User)
  // แต่ละ object คือ { ID: number, path: string }
  const [keptExistingImages, setKeptExistingImages] = useState([]);

  const baseApiUrl = process.env.NEXT_PUBLIC_GOLANG_API_URL  ;

  // Effect to pre-fill form data and manage image states when initialData changes (for Edit mode)
  useEffect(() => {
    setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        quantity: initialData.quantity || 0,
        category_id: initialData.category_id ? String(initialData.category_id) :
                        (categories.length > 0 && !loadingCategoriesForm && !initialData.category_id ? '' : String(initialData.category_id || '')),
    });

    if (isEditMode && initialData.images && Array.isArray(initialData.images)) {
        setKeptExistingImages(initialData.images); // เริ่มต้นด้วยรูปภาพเดิมทั้งหมด
    } else {
        setKeptExistingImages([]);
    }

    // Clear new image selections and their previews when initialData changes
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setNewImagePreviews([]);
    setNewImageFiles([]);

  }, [initialData, categories, loadingCategoriesForm, isEditMode]); // Removed baseApiUrl as it's constant within component lifecycle

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleNewImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const MAX_FILES_UPLOAD = 5; // Max new files user can select at once
      const MAX_TOTAL_IMAGES = 5; // Overall limit for product images

      if (filesArray.length > MAX_FILES_UPLOAD) {
         alert(`คุณสามารถเลือกอัปโหลดรูปภาพใหม่ได้สูงสุด ${MAX_FILES_UPLOAD} รูปต่อครั้ง`);
         e.target.value = null; // Clear selected files from input
         return;
      }
      // Check total images if combined with existing ones (only if in edit mode)
      if (isEditMode && (keptExistingImages.length + filesArray.length > MAX_TOTAL_IMAGES)) {
        alert(`สินค้าสามารถมีรูปภาพได้สูงสุด ${MAX_TOTAL_IMAGES} รูป (รวมรูปเดิมและรูปใหม่). ปัจจุบันมีรูปเดิม ${keptExistingImages.length} รูป`);
        e.target.value = null;
        return;
      }


      setNewImageFiles(filesArray);

      // Cleanup old blob previews before creating new ones
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(previewsArray);
    } else { // If user cancels file selection
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setNewImagePreviews([]);
      setNewImageFiles([]);
    }
  };

  // Handler for "removing" an existing image from the UI (in Edit Mode)
  const handleDeleteExistingImage = (imagePathOrIdToDelete) => {
    if (window.confirm("คุณต้องการลบรูปภาพนี้ (เมื่อบันทึก) ใช่หรือไม่?")) {
        setKeptExistingImages(prev => prev.filter(img =>
            (img.ID ? String(img.ID) : img.path) !== String(imagePathOrIdToDelete)
        ));
    }
  };

  // Cleanup Object URLs for new image previews when component unmounts or previews change
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]); // Run when newImagePreviews change (for blobs)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id) {
        alert("กรุณาเลือกหมวดหมู่สินค้า");
        return;
    }

    const totalFinalImages = keptExistingImages.length + newImageFiles.length;
    if (totalFinalImages === 0) {
        alert("สินค้าต้องมีรูปภาพอย่างน้อย 1 รูป");
        return;
    }
    if (totalFinalImages > 5) { // Re-validate max images
        alert(`สินค้าสามารถมีรูปภาพได้สูงสุด 5 รูป ปัจจุบันคุณมี ${totalFinalImages} รูป (รวมรูปเดิมและรูปใหม่)`);
        return;
    }

    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(String(formData.quantity), 10) || 0, // Ensure quantity is a number
      category_id: parseInt(String(formData.category_id), 10),
    };

    const pathsOfKeptExistingImages = keptExistingImages.map(img => img.path);

    console.log("[ProductForm] Submitting. ProductData:", dataToSubmit, "New Files:", newImageFiles, "Kept Existing Paths:", pathsOfKeptExistingImages);
    onSubmit(dataToSubmit, newImageFiles, pathsOfKeptExistingImages);
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

        {/* Image Upload Section */}
        <div>
            {/* Display EXISTING images in Edit Mode */}
            {isEditMode && keptExistingImages.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">รูปภาพปัจจุบัน (คลิก ✕ เพื่อลบรูปภาพนี้):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {keptExistingImages.map((img, index) => (
                            <div key={img.ID || img.path || index} className="relative group aspect-square rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                                <Image
                                    src={`${baseApiUrl}/${img.path.replace(/^\.\//, '')}`}
                                    alt={`รูปภาพปัจจุบัน ${index + 1}`}
                                    fill
                                    style={{objectFit:"cover"}}
                                    sizes="100px"
                                    onError={(e) => { e.target.style.display = 'none'; /* Hide broken image */ }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteExistingImage(img.ID || img.path)}
                                    className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-xs leading-none flex items-center justify-center w-5 h-5 z-10"
                                    aria-label="ลบรูปภาพนี้"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <label htmlFor="new_images" className={labelClass}>
                {isEditMode ? (keptExistingImages.length + newImageFiles.length < 5 ? "อัปโหลดรูปภาพใหม่/เพิ่มเติม:" : "จำนวนรูปภาพครบแล้ว (สูงสุด 5 รูป)") : "รูปภาพสินค้า (เลือกได้หลายรูป):"}
                {(!isEditMode && newImageFiles.length === 0) && <span className="text-red-500 ml-1">*</span>}
                {(isEditMode && keptExistingImages.length === 0 && newImageFiles.length === 0) && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type="file"
                name="new_images"
                id="new_images"
                multiple
                onChange={handleNewImageChange}
                disabled={isLoading || (isEditMode && keptExistingImages.length + newImageFiles.length >= 5)}
                className={fileInputClass}
                accept="image/png, image/jpeg, image/webp"
            />
            
            {newImageFiles.length > 0 && (
                 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    เลือกแล้ว {newImageFiles.length} รูปภาพใหม่
                    {isEditMode && ` (รวมกับรูปเดิมเป็น ${keptExistingImages.length + newImageFiles.length} รูป)`}
                </p>
            )}

            {/* Previews for NEWLY selected images (blob URLs) */}
            {newImagePreviews.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">รูปภาพที่เลือกใหม่ (จะถูกอัปโหลด):</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {newImagePreviews.map((previewUrl, index) => (
                            <div key={previewUrl} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 shadow-sm">
                                <Image src={previewUrl} alt={`Preview ${index + 1}`} fill style={{objectFit:"cover"}} sizes="100px" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {isEditMode && keptExistingImages.length === 0 && newImageFiles.length === 0 && (
                 <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">ไม่มีรูปภาพปัจจุบัน กรุณาอัปโหลดรูปภาพใหม่</p>
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