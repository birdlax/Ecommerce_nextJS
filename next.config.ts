/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // หรือการตั้งค่าอื่นๆ ที่คุณมี
  images: {
    domains: ['localhost'],
    remotePatterns: [
            {
        protocol: 'http', // Protocol ที่ใช้ (http หรือ https)
        hostname: '104.214.188.65', // IP Address ของ Server ที่เก็บรูป
        port: '3000', // Port ของ Server ที่เก็บรูป
        pathname: '/uploads/**', // Path เริ่มต้นของรูปภาพ (ใช้ ** เพื่ออนุญาตทุก path ย่อย)
      },
      {
        protocol: 'http', // หรือ 'https' ถ้า API ของคุณใช้ HTTPS
        hostname: 'localhost',
        port: '3000', // <--- **ระบุ Port ของ Golang API ของคุณ**
        pathname: '/uploads/**', // อนุญาตทุก path ภายใต้ /uploads/
                                // หรือจะระบุให้ละเอียดกว่านี้ก็ได้ เช่น '/uploads/1/**'
      },
      // (Optional) ถ้าคุณยังใช้รูปจาก picsum.photos ด้วย ก็เพิ่ม pattern นี้เข้าไป
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        // port: '', // ไม่ต้องใส่ถ้าเป็น default port (80/443)
        // pathname: '/**', // อนุญาตทุก path
      },
    ],
  },
};

module.exports = nextConfig;


