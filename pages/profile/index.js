// pages/profile.js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { updateUserProfile, updateUserPassword } from '@/utils/authService';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading: authIsLoading, checkAuthStatus } = useAuth();
  const router = useRouter();

  // Edit modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Pre-fill profileData when user data is available or changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isAuthenticated, authIsLoading, router]);

  const handleProfileInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const toggleProfileEditMode = () => {
    if (!isEditingProfile) { // Entering edit mode
      setProfileData({ // Reset form to current user data
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
      });
      setProfileError('');
      setProfileSuccess('');
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const dataToSend = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
      };
      await updateUserProfile(dataToSend);
      setProfileSuccess('อัปเดตข้อมูลโปรไฟล์สำเร็จ!');
      await checkAuthStatus(); // Refresh user data in context
      setIsEditingProfile(false); // Exit edit mode
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileError(err.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const togglePasswordEditMode = () => {
    if (!isEditingPassword) { // Entering password edit mode
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setPasswordError('');
        setPasswordSuccess('');
    }
    setIsEditingPassword(!isEditingPassword);
  };

  const handlePasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const dataToSend = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        // Backend ควรจะ validate confirm_new_password เอง หรือคุณส่งไปก็ได้
        // confirm_new_password: passwordData.confirmNewPassword,
      };
      await updateUserPassword(dataToSend);
      setPasswordSuccess('เปลี่ยนรหัสผ่านสำเร็จแล้ว! กรุณา Login ใหม่อีกครั้งด้วยรหัสผ่านใหม่ (ถ้า API ไม่ได้ auto-refresh session)');
      setIsEditingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      // อาจจะต้อง logout ผู้ใช้เพื่อให้ login ใหม่ด้วยรหัสผ่านใหม่ หรือให้ backend จัดการ session
      // logout(); // ตัวอย่าง
    } catch (err) {
      console.error("Failed to update password:", err);
      setPasswordError(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ (อาจจะใส่รหัสผ่านปัจจุบันผิด)');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authIsLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading profile...</p></div>;
  }
  if (!isAuthenticated || !user) {
    return <div className="min-h-screen flex items-center justify-center"><p>Please login to view your profile.</p></div>;
  }

  const storeName = "ชื่อร้านของคุณ";
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'ผู้ใช้';
  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 transition-colors duration-150";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const buttonClass = "px-6 py-2.5 text-sm font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-60";
  const primaryButtonClass = `${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500`;
  const secondaryButtonClass = `${buttonClass} bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:ring-slate-500`;


  return (
    <>
      <Head>
        <title>{`โปรไฟล์ของ ${fullName} - ${storeName}`}</title>
        <meta name="description" content={`ดูและจัดการข้อมูลโปรไฟล์ของคุณ ${fullName} ที่ ${storeName}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-center md:text-left">
            โปรไฟล์ของฉัน
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: User Info Summary & Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 w-24 h-24 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-4xl font-semibold text-indigo-600 dark:text-indigo-300 uppercase">
                  {user.first_name ? user.first_name.charAt(0) : (user.email ? user.email.charAt(0) : '?')}
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{fullName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                <p className="mt-1 text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full capitalize">{user.role}</p>
              </div>
            </section>
            <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">ลิงก์ด่วน</h3>
                <nav className="space-y-2">
                    <Link href="/orders" className="block text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">คำสั่งซื้อของฉัน</Link>
                    <Link href="/profile/addresses" className="block text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300">จัดการที่อยู่</Link>
                </nav>
            </section>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Update Profile Section */}
            <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">แก้ไขข้อมูลส่วนตัว</h2>
                {!isEditingProfile && (
                  <button onClick={toggleProfileEditMode} className={`${secondaryButtonClass} text-sm`}>แก้ไข</button>
                )}
              </div>
              {isEditingProfile ? (
                <form onSubmit={handleProfileFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>ชื่อจริง</label>
                    <input type="text" name="firstName" id="firstName" value={profileData.firstName} onChange={handleProfileInputChange} disabled={profileLoading} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>นามสกุล</label>
                    <input type="text" name="lastName" id="lastName" value={profileData.lastName} onChange={handleProfileInputChange} disabled={profileLoading} className={inputClass} />
                  </div>
                  {profileError && <p className="text-sm text-red-500 dark:text-red-400">{profileError}</p>}
                  {profileSuccess && <p className="text-sm text-green-600 dark:text-green-400">{profileSuccess}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={profileLoading} className={primaryButtonClass}>
                      {profileLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                    <button type="button" onClick={toggleProfileEditMode} disabled={profileLoading} className={secondaryButtonClass}>
                      ยกเลิก
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-slate-500 dark:text-slate-400">ชื่อจริง:</span> <span className="text-slate-700 dark:text-slate-200">{user.first_name || 'N/A'}</span></p>
                    <p><span className="font-medium text-slate-500 dark:text-slate-400">นามสกุล:</span> <span className="text-slate-700 dark:text-slate-200">{user.last_name || 'N/A'}</span></p>
                    <p><span className="font-medium text-slate-500 dark:text-slate-400">อีเมล:</span> <span className="text-slate-700 dark:text-slate-200">{user.email}</span></p>
                </div>
              )}
            </section>

            {/* Change Password Section */}
            <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">เปลี่ยนรหัสผ่าน</h2>
                {!isEditingPassword && (
                    <button onClick={togglePasswordEditMode} className={`${secondaryButtonClass} text-sm`}>เปลี่ยน</button>
                )}
              </div>
              {isEditingPassword && (
                <form onSubmit={handlePasswordFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className={labelClass}>รหัสผ่านปัจจุบัน</label>
                    <input type="password" name="currentPassword" id="currentPassword" required value={passwordData.currentPassword} onChange={handlePasswordInputChange} disabled={passwordLoading} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className={labelClass}>รหัสผ่านใหม่</label>
                    <input type="password" name="newPassword" id="newPassword" required value={passwordData.newPassword} onChange={handlePasswordInputChange} disabled={passwordLoading} className={inputClass} placeholder="อย่างน้อย 6 ตัวอักษร"/>
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className={labelClass}>ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" name="confirmNewPassword" id="confirmNewPassword" required value={passwordData.confirmNewPassword} onChange={handlePasswordInputChange} disabled={passwordLoading} className={inputClass} />
                  </div>
                  {passwordError && <p className="text-sm text-red-500 dark:text-red-400">{passwordError}</p>}
                  {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>}
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={passwordLoading} className={primaryButtonClass}>
                      {passwordLoading ? 'กำลังเปลี่ยน...' : 'ยืนยันเปลี่ยนรหัสผ่าน'}
                    </button>
                     <button type="button" onClick={togglePasswordEditMode} disabled={passwordLoading} className={secondaryButtonClass}>
                      ยกเลิก
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;