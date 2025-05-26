// components/Layout/Footer.js
import Link from 'next/link';
import Image from 'next/image';

const FacebookIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);

const LineIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.04 4.18c-.67-.36-1.5-.3-2.19.15-.62.4-3.57 2.3-5.85 3.77-2.94 1.9-3.3 2.1-5.04 1.38-2.37-.98-3.6-.7-4.04-.5-.42.2-1.05.7-.95 1.1.1.3.6.9 1.1 1.2.6.4 1.2.6 1.7.9.4.2.8.7 1 1 .4.4.8 1.2.4 1.6-.3.4-.8.4-1.6.2-.8-.2-3.3-1.8-4.6-3.1C.94 10.08.03 8.2 0 7.8c0-.4.4-.8.8-1 .4-.2 3.6-1.3 5.2-1.8 1.6-.5 2.6-.4 3.3-.2.7.2 1.2.4 1.7.7.5.3 1 .8 1.3 1 .3.2.7.5.9.6.2.1.5.1.7-.1.2-.2.2-.5 0-.7-.2-.2-1.2-1.2-1.6-1.6-.4-.4-.8-.8-.4-1.2.3-.3.8-.1 1.2.1.4.2 2.6 1.6 3.1 1.9.5.3 1.1.5 1.1.9 0 .4-.4.5-.8.3-.4-.2-2.3-1.3-2.7-1.5-.3-.2-.6-.3-.8-.3-.3 0-.6.2-.6.5 0 .2 0 .3 1.5 1.5 1 .8 2.8 2.2 3.8 2.9 1 .7 2 1.3 2.2 1.5.2.2.5.3.7.3.2 0 .5-.1.7-.3.2-.2.8-.8.8-1 0-.2-.1-.3-.3-.5-.2-.2-1.4-1.2-2.3-2-1.4-1.2-1.5-1.3-.7-1.8.5-.3 1.6-.3 2.1 0 .6.3.8.6 1.3.6.5 0 .8-.3 1.1-.6.2-.3.4-.7.1-1.1-.2-.3-.6-.5-1.2-.4z" />
  </svg>
);
// ------------------------------------

export default function Footer() {
  const storeName = "MY Store";

  const navigation = [
    { name: "สินค้าทั้งหมด", href: "/products" },
    { name: "คอลเลคชั่นใหม่", href: "/new-arrivals" },
    { name: "สินค้ายอดนิยม", href: "/best-sellers" },
    { name: "เกี่ยวกับเรา", href: "/about" },
    { name: "ติดต่อเรา", href: "/contact" },
  ];

  const customerService = [
    { name: "วิธีการสั่งซื้อ", href: "/how-to-order" },
    { name: "การจัดส่ง", href: "/shipping" },
    { name: "การคืนสินค้า", href: "/returns" },
    { name: "คำถามที่พบบ่อย", href: "/faq" },
  ];

  const legal = [
    { name: "เงื่อนไขการให้บริการ", href: "/terms" },
    { name: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { name: "นโยบายคุกกี้", href: "/cookie-policy" },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl px-6 py-16 mx-auto lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              เมนูหลัก
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              บริการลูกค้า
            </h3>
            <ul className="mt-4 space-y-3">
              {customerService.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ข้อมูลกฎหมาย
            </h3>
            <ul className="mt-4 space-y-3">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
              <Image
                src="/images/store-white.png" 
                alt={`${storeName} Logo`}
                width={36}
                height={36}
                className="block dark:hidden group-hover:opacity-80 transition-opacity"
              />
              <Image
                src="/images/store-dark.png" 
                alt={`${storeName} Logo`}
                width={36}
                height={36}
                className="hidden dark:block group-hover:opacity-80 transition-opacity"
              />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {storeName}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              เรานำเสนอสินค้าแฟชั่นคุณภาพสูงที่คัดสรรมาอย่างดี 
              พร้อมมอบประสบการณ์การช้อปปิ้งระดับพรีเมียมให้กับคุณ
            </p>
            
            {/* Social Media */}
            <div className="mt-6 flex gap-4">
              <a 
                href="#" 
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Line"
              >
                <LineIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
        
      </div>
    </footer>
  );
}