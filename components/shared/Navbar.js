// components/Layout/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router'; // <--- **ตรวจสอบว่ามีการ import useRouter**
import ThemeToggleButton from '@/components/shared/ThemeToggleButton';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading: authIsLoading, isAdmin } = useAuth(); // isAdmin ถูกดึงมา
  const { cartItemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter(); 

  // --- State สำหรับ Search ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchInputMobile, setShowSearchInputMobile] = useState(false);

  // --- Icons ---
  const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
  const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
  const SearchIconSvg = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>; // เปลี่ยนชื่อเป็น Svg เพื่อไม่ให้ชนกับ Search component (ถ้ามี)
  const CartIconSvg = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>; // เปลี่ยนชื่อเป็น Svg
  const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
  const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
  const DropdownArrowIcon = () => <svg className="hidden lg:inline w-4 h-4 ml-1 text-slate-500 dark:text-slate-400 group-hover:rotate-180 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync searchTerm with URL query 'q'
  useEffect(() => {
    if (router.isReady) {
      const queryQ = router.query.q;
      if (queryQ && typeof queryQ === 'string') {
        if (queryQ !== searchTerm) setSearchTerm(queryQ);
      } else if (!queryQ && searchTerm !== '') { // เคลียร์ถ้า URL ไม่มี q
        setSearchTerm('');
      }
    }
  }, [router.query.q, router.isReady, searchTerm]); // searchTerm ใน dep ช่วย sync ถ้ามีการเปลี่ยนจากภายนอก

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    
    if (isMobileMenuOpen) setIsMobileMenuOpen(false); // ปิด mobile menu ก่อน
    if (showSearchInputMobile) setShowSearchInputMobile(false); // ปิด mobile search input

    const queryParams = { page: '1' }; // Search ใหม่ให้ไปหน้า 1 เสมอ
    if (trimmedSearchTerm) {
      queryParams.q = trimmedSearchTerm;
    }
    
    router.push({
      pathname: '/products', // พาไปหน้า Product List
      query: queryParams,
    });
  };
  
  // Placeholder UI สำหรับ Navbar ขณะโหลด Auth
  // เอา isLoading (ซึ่งคือ authIsLoading) ออกจากเงื่อนไขนี้ ถ้าไม่ต้องการให้ Navbar กระพริบตอน Cart โหลด
  if (authIsLoading && !isAuthenticated) { // แสดง loading เฉพาะตอน initial auth check และยังไม่ authenticated
    return (
        <header className={`fixed w-full z-50 h-16 transition-colors duration-300 ${isScrolled ? 'bg-white shadow-lg dark:bg-slate-900' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'}`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center"><div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /><div className="ml-2 w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse hidden sm:block" /></div>
                    <div className="flex items-center gap-2"><div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /><div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" /><div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse md:hidden" /></div>
                </div>
            </nav>
        </header>
    );
  }
  // Style classes
  const navLinkBase = "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150";
  const navLinkDefault = `${navLinkBase} text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-50`;
  const navLinkAdmin = `${navLinkBase} text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-700/30 dark:hover:text-purple-300 font-semibold`;
  const iconButtonClass = "p-2 rounded-full transition-colors duration-150 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400";
  const dropdownItemClass = "block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700";
  const navLinkClass = "block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
        ? 'bg-white shadow-lg dark:bg-slate-900 border-slate-200 dark:border-slate-700' 
        : 'bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-transparent dark:border-slate-800'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => { setIsMobileMenuOpen(false); setShowSearchInputMobile(false); }}>
              <Image src="/images/store-white.png" alt="Luxe Collections Logo Light" width={32} height={32} className="block dark:hidden group-hover:opacity-80 transition-opacity" />
              <Image src="/images/store-dark.png" alt="Luxe Collections Logo Dark" width={32} height={32} className="hidden dark:block group-hover:opacity-80 transition-opacity" />
              <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                LUXE COLLECTIONS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link href="/" className={navLinkDefault}>หน้าแรก</Link>
            <Link href="/products" className={navLinkDefault}>สินค้าทั้งหมด</Link>
            <Link href="/new-arrivals" className={navLinkDefault}>ใหม่ล่าสุด</Link>
            <Link href="/about" className={navLinkDefault}>เกี่ยวกับเรา</Link>
          </div>

          {/* Right Side Area: Search, Cart, Theme, User/Login */}
          <div className="flex items-center">
            {/* --- Desktop Search Form --- */}
            <div className="hidden md:block mr-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  name="desktop-search"
                  id="desktop-search"
                  placeholder="ค้นหาสินค้า..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full sm:w-40 md:w-48 lg:w-56 xl:w-64 px-4 py-2 pl-10 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <SearchIconSvg />
                </div>
                <button type="submit" className="sr-only">Search</button>
              </form>
            </div>

            {/* Icons for Desktop (Cart, Theme, User) */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link href="/cart" aria-label="Shopping Cart" className={`relative ${iconButtonClass}`}>
                <CartIconSvg />
                {isAuthenticated && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] min-w-[18px] flex items-center justify-center p-0.5 leading-none shadow">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              <ThemeToggleButton />
              {isAuthenticated && user ? (
                <div className="relative group ml-1">
                   <button aria-label="User Account" className={`${iconButtonClass} flex items-center gap-1.5`}>
                     <UserIcon />
                     <span className="hidden lg:inline text-sm font-medium text-slate-700 dark:text-slate-300">{user.first_name || (user.email ? user.email.split('@')[0] : 'Account')}</span>
                     <DropdownArrowIcon />
                   </button>
                   <div className="absolute right-0 mt-1 pt-1 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-xl z-50 border border-slate-200 dark:border-slate-700 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible group-hover:opacity-100 group-hover:visible transform scale-95 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-150 ease-out">
                     <div className="px-4 py-3 border-b dark:border-slate-600">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate" title={user.email || ''}>{user.email || 'N/A'}</p>
                     </div>
                     <div className="py-1">
                        <Link href="/profile" className={dropdownItemClass}>โปรไฟล์ของฉัน</Link>
                        <Link href="/orders" className={dropdownItemClass}>คำสั่งซื้อของฉัน</Link>
                        {/* แสดง Admin Panel Link ใน Dropdown ถ้าเป็น Admin */}
                        {isAdmin && ( <Link href="/admin/dashboard" className={`${dropdownItemClass} text-purple-600 dark:text-purple-400 font-semibold`}>Admin Panel</Link> )}
                        <div className="border-t dark:border-slate-600 my-1"></div>
                        <button onClick={logout} className={`${dropdownItemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-700/20`}>ออกจากระบบ</button>
                     </div>
                   </div>
                </div>
              ) : (
                <Link href="/login" className={`${iconButtonClass} flex items-center gap-1 text-sm font-medium`}>
                  <LoginIcon /> <span className="hidden lg:inline">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>

            {/* Mobile Icons Area (Search Toggle, Cart, Hamburger) */}
            <div className="md:hidden flex items-center">
              <button aria-label="Toggle Search" onClick={() => {setShowSearchInputMobile(!showSearchInputMobile); setIsMobileMenuOpen(false);}} className={iconButtonClass}>
                <SearchIconSvg />
              </button>
              <Link href="/cart" aria-label="Shopping Cart" className={`relative ${iconButtonClass} ml-1`}>
                <CartIconSvg />
                {isAuthenticated && cartItemCount > 0 && ( <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] min-w-[18px] flex items-center justify-center p-0.5 leading-none shadow">{cartItemCount > 99 ? '99+' : cartItemCount}</span> )}
              </Link>
              <button type="button" aria-label="Open mobile menu" className={`${iconButtonClass} ml-1`} onClick={() => {setIsMobileMenuOpen(!isMobileMenuOpen); setShowSearchInputMobile(false);}}>
                {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        {showSearchInputMobile && (
            <div className="md:hidden py-2 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSearchSubmit} className="relative px-2">
                    <input type="search" name="mobile-search" id="mobile-search" placeholder="ค้นหาสินค้า..." value={searchTerm} onChange={handleSearchChange} autoFocus
                        className="block w-full px-4 py-2.5 pl-10 border border-slate-300 dark:border-slate-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500"><SearchIconSvg /></div>
                    <button type="submit" className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 rounded-r-full" aria-label="Submit search">
                        ค้นหา
                    </button>
                </form>
            </div>
        )}

        {/* Mobile Menu Content */}
        <div className={`md:hidden ${isMobileMenuOpen && !showSearchInputMobile ? 'block' : 'hidden'} bg-white dark:bg-slate-800 shadow-lg absolute inset-x-0 top-16 pb-4 border-t border-slate-200 dark:border-slate-700`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>หน้าแรก</Link>
            <Link href="/products" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>สินค้าทั้งหมด</Link>
            <Link href="/new-arrivals" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>ใหม่ล่าสุด</Link>
            <Link href="/about" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>เกี่ยวกับเรา</Link>
            {/* Admin Panel Link ใน Mobile Menu (ถ้าเป็น Admin) */}
            {isAuthenticated && isAdmin && (
                <Link href="/admin/dashboard" className={`${navLinkClass} text-purple-600 dark:text-purple-400 font-semibold`} onClick={() => setIsMobileMenuOpen(false)}>
                    Admin Panel
                </Link>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3 space-y-1">
              <div className="px-3 py-2 flex justify-between items-center">
                <span className="text-base font-medium text-slate-700 dark:text-slate-300">โหมดแสดงผล</span>
                <ThemeToggleButton />
              </div>
              {isAuthenticated && user ? (
                 <>
                   <Link href="/profile" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>โปรไฟล์ของฉัน</Link>
                   <Link href="/orders" className={navLinkClass} onClick={() => setIsMobileMenuOpen(false)}>คำสั่งซื้อของฉัน</Link>
                   <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className={`${navLinkClass} w-full text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-700/20`}>ออกจากระบบ</button>
                 </>
              ) : (
                <Link href="/login" className={`${navLinkDefault} flex items-center gap-2`} onClick={() => setIsMobileMenuOpen(false)}>
                  <LoginIcon /> เข้าสู่ระบบ
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