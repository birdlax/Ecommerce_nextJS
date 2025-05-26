

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // หรือการตั้งค่าอื่นๆ ที่คุณมีอยู่แล้ว
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '', // ปล่อยว่างถ้าเป็น port มาตรฐาน (https คือ 443)
        pathname: '/**', // อนุญาตทุก path ภายใต้ hostname นี้
      },
      {
        protocol: 'https',
        hostname: 'www.foodandwine.com', // เพิ่ม hostname นี้จากข้อมูล JSON
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.andaseat-th.com', // เพิ่ม hostname นี้จากข้อมูล JSON
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.thewirecutter.com', // เพิ่ม hostname นี้จากข้อมูล JSON
        port: '',
        pathname: '/**',
      },
      // หากมี hostname อื่นๆ จาก image_url อีก ก็เพิ่มเข้ามาในลักษณะเดียวกัน
    ],
  },
};

module.exports = nextConfig;