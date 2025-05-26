// pages/_app.js
import "./globals.css"; // หรือ '../styles/globals.css' ขึ้นอยู่กับตำแหน่งไฟล์
import MainLayout from "@/components/Layout/MainLayout"; // ใช้ Path Alias, ดีมากครับ
import { ThemeProvider } from "@/contexts/ThemeContext"; // ใช้ Path Alias
import { AuthProvider } from "@/contexts/AuthContext";   // ใช้ Path Alias
import { CartProvider } from '../contexts/CartContext';
function MyApp({ Component, pageProps }) {
  // ส่วนนี้คือหัวใจของการทำ Per-Page Layouts
  const getLayout = Component.getLayout || ((page) => <MainLayout>{page}</MainLayout>);

  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          {getLayout(<Component {...pageProps} />)}
          </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;