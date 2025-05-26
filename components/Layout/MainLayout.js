// components/Layout/MainLayout.js
import Head from 'next/head';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer'; 

export default function MainLayout({ children, title = "E-commerce App" }) {
  return (
    <div className="">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Welcome to our E-commerce store" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <Footer /> 
    </div>
  );
}