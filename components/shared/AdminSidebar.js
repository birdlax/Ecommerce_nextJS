// components/Layout/AdminSidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image'; // ถ้าจะใส่โลโก้ใน Sidebar

// ตัวอย่าง Icons (คุณสามารถใช้ SVG icons ที่ซับซ้อนกว่านี้ หรือ icon library เช่น Heroicons, react-icons)
const HomeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 10.707V16.5a1.5 1.5 0 01-1.5 1.5h-2.5a.75.75 0 01-.75-.75V14.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v2.75a.75.75 0 01-.75.75h-2.5A1.5 1.5 0 013 16.5V10.707a1 1 0 01.293-.707l7-7z" clipRule="evenodd" />
  </svg>
);
const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.296 0 4.47-.78 6.125-2.095a1.23 1.23 0 00.41-1.412A9.99 9.99 0 0010 12.75a9.99 9.99 0 00-6.535 1.743z" />
  </svg>
);
const ProductsIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.528A7.001 7.001 0 0116.5 9.633v1.313a.75.75 0 01-1.444.269V9.633a5.501 5.501 0 00-10.112 0v1.582A.75.75 0 013.5 11.246V9.633A7.001 7.001 0 019.25 3.278V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
    <path d="M4.752 11.703a.75.75 0 01.14.647l.903 2.65A1.75 1.75 0 007.557 16.5H9V9.325a.75.75 0 01.37-.655l4-2.25a.75.75 0 011.158.655V9.325H16V7.752a.75.75 0 011.088-.672l.037.018a.75.75 0 01.599.82v1.779h.165a.75.75 0 010 1.5H4.604a.75.75 0 01-.14-.647l-.002-.005.29-.853z" />
  </svg>
);
const OrdersIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3.505 2.365A.75.75 0 003 3.25v12.5A.75.75 0 004.08 16.5h11.84A.75.75 0 0017 15.75V5.995A.75.75 0 0016.085 5.3l-3.67-1.725a.75.75 0 00-.83-.03L10.44 4.08l-1.892-.89a.75.75 0 00-.868.03L3.505 2.365zM5.75 14.5V7.197l1.003.472a.75.75 0 00.868-.03L9.25 6.89V14.5H5.75zM11.5 14.5V5.92l1.503-.709a.75.75 0 01.83.03l2.415 1.137V14.5h-4.748z" />
  </svg>
);
const ReportsIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" clipRule="evenodd" />
    <path d="M10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.75A.75.75 0 0110 5zM10 12a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);
// เพิ่ม Icon อื่นๆ ตามต้องการ


const AdminSidebar = () => {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'จัดการผู้ใช้งาน', href: '/admin/users', icon: UsersIcon },
    { name: 'จัดการสินค้า', href: '/admin/products', icon: ProductsIcon }, // สมมติ path
    { name: 'จัดการคำสั่งซื้อ', href: '/admin/orders', icon: OrdersIcon }, // สมมติ path
    // { name: 'จัดการหมวดหมู่', href: '/admin/categories', icon: CategoriesIcon },
    { name: 'รายงาน', href: '/admin/reports', icon: ReportsIcon },
    // { name: 'ตั้งค่า', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 shadow-lg flex-shrink-0 transition-all duration-300"> {/* ทำให้ Sidebar มีเงา */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
        {/* Logo หรือชื่อ Admin Panel */}
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            {/* คุณสามารถใส่ Logo Image ที่นี่ได้ */}
            {/* <Image src="/images/admin-logo-dark.png" alt="Admin Logo" width={28} height={28} className="block dark:hidden"/>
            <Image src="/images/admin-logo-white.png" alt="Admin Logo" width={28} height={28} className="hidden dark:block"/> */}
            <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 group-hover:opacity-80">
                Admin Panel
            </span>
        </Link>
      </div>
      <nav className="mt-4 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`); // เช็ค sub-paths ด้วย
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150
                ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-50'
                }`}
            >
              {IconComponent && <IconComponent className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />}
              {item.name}
            </Link>
          );
        })}
      </nav>
      {/* (Optional) อาจจะมีส่วนแสดง User Profile ของ Admin หรือปุ่ม Logout ที่ด้านล่างของ Sidebar */}
    </aside>
  );
};

export default AdminSidebar;