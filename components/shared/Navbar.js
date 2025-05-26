// components/Layout/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggleButton from '@/components/shared/ThemeToggleButton'; 
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
  }

  return (
    <header className={`fixed w-full z-50 transition-all  duration-300 ${isScrolled ? 'bg-white shadow-lg dark:bg-slate-900' : 'bg-white/90 backdrop-blur-sm dark:bg-slate-900/90'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/images/store-white.png" alt="Logo Light Theme" width={32} height={32} className="block dark:hidden group-hover:opacity-80 transition-opacity" />
              <Image src="/images/store-dark.png" alt="Logo Dark Theme" width={32} height={32} className="hidden dark:block group-hover:opacity-80 transition-opacity" />
              <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                LUXE COLLECTIONS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link href="/" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">หน้าแรก</Link>
            <Link href="/products" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">สินค้าทั้งหมด</Link>
            <Link href="/new-arrivals" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">ใหม่ล่าสุด</Link>
            <Link href="/about" className="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">เกี่ยวกับเรา</Link>
            
            
          </div>

          {/* Right Side Area */}
          <div className="flex items-center gap-1 sm:gap-2"> {/* ปรับ gap สำหรับ mobile และ desktop */}

            {/* Search Icon - Always Visible */}
            <button aria-label="Search" className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart Icon - Always Visible */}
      <Link href="/cart" aria-label="Shopping Cart" className="relative p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center p-0.5">
            {itemCount}
          </span>
        )}
      </Link>
            {/* ThemeToggleButton - Desktop Only (in main bar) */}
            <div className="hidden md:flex items-center"> {/* ซ่อนบน mobile, แสดงบน md ขึ้นไป */}
              <ThemeToggleButton />
            </div>

            {/* User / Login - Desktop Only (in main bar) */}
            <div className="hidden md:block"> {/* ซ่อนบน mobile, แสดงบน md ขึ้นไป */}
              
              {isAuthenticated && user ?(
                <div className="relative group">
                   <button aria-label="User Account" className="flex items-center gap-1 p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                   </button>
                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                     <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">โปรไฟล์ของฉัน</Link>
                     <Link href="/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
                        คำสั่งซื้อของฉัน
                      </Link>
                     <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">ออกจากระบบ</button>
                      {isAdmin && ( 
                        <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-purple-600 hover:bg-slate-100 dark:text-purple-400 dark:hover:bg-slate-700 font-semibold">
                            Admin Dashboard
                        </Link>
                     )}
                   </div>
                </div>
              ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /> </svg>
                เข้าสู่ระบบ
              </Link>
              )}
            </div>

            {/* Mobile Menu Button (Hamburger Icon) - Mobile Only */}
            <div className="md:hidden flex items-center"> {/* แสดงเฉพาะบน mobile (เล็กกว่า md) */}
              <button
                type="button"
                aria-label="Open mobile menu"
                className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div> {/* End of Right Side Area parent div */}
        </div>

        {/* Mobile Menu Content */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMobileMenuOpen(false)}>หน้าแรก</Link>
            <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMobileMenuOpen(false)}>สินค้าทั้งหมด</Link>
            <Link href="/new-arrivals" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMobileMenuOpen(false)}>ใหม่ล่าสุด</Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMobileMenuOpen(false)}>เกี่ยวกับเรา</Link>
            {isAdmin && ( // <--- เพิ่ม Admin Dashboard ใน Dropdown ด้วย
              <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-purple-600 hover:bg-slate-100 dark:text-purple-400 dark:hover:bg-slate-700 font-semibold">
                  Admin Dashboard
              </Link>
            )}
            

            <div className="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3 space-y-1">
              {/* Theme Toggle สำหรับ Mobile Menu */}
              <div className="px-3 py-2 flex justify-between items-center"> {/* จัดให้อยู่บรรทัดเดียวกับข้อความ */}
                <span className="text-base font-medium text-slate-700 dark:text-slate-300">โหมดแสดงผล</span>
                <ThemeToggleButton />
              </div>
              
              {/* Mobile Login/Logout */}
              {isAuthenticated && user ?(
                <>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    โปรไฟล์ของฉัน
                  </Link>
                  <button 
                    onClick={() => { 
                      logout(); 
                      setIsMobileMenuOpen(false); 
                    }} 
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /> </svg>
                เข้าสู่ระบบ
              </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;