// pages/about.js
import Head from 'next/head';
import Link from 'next/link'; // Import Link สำหรับ Call to Action

// (ไม่จำเป็นต้อง import Image from 'next/image' แล้ว ถ้าไม่ใช้)

const AboutPage = () => {
  const storeName = "Luxe Collections"; // <--- เปลี่ยนเป็นชื่อร้านของคุณ
  const yearFounded = 2023; // <--- ปีที่ก่อตั้งร้านของคุณ

  // Tailwind CSS classes สำหรับใช้ซ้ำ
  const sectionPadding = "py-12 sm:py-16";
  const headingClass = "text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-6 text-center sm:text-left";
  const subHeadingClass = "text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4";
  const paragraphClass = "text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-4"; // เพิ่ม space-y-4 ให้แต่ละ <p> ห่างกัน

  return (
    <>
      <Head>
        <title>เกี่ยวกับ {storeName} - เรื่องราวของเรา</title>
        <meta name="description" content={`ทำความรู้จักกับ ${storeName}, พันธกิจ, และความมุ่งมั่นของเราในการนำเสนอสินค้าคุณภาพ`} />
        <meta property="og:title" content={`เกี่ยวกับ ${storeName} - เรื่องราวของเรา`} />
        <meta property="og:description" content={`ทำความรู้จักกับ ${storeName}, พันธกิจ, และความมุ่งมั่นของเราในการนำเสนอสินค้าคุณภาพ`} />
      </Head>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section (แบบ Text-based) */}
        <section className={`${sectionPadding} text-center`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 mb-4">
            ยินดีต้อนรับสู่ {storeName}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {/* ใส่ Tagline หรือคำโปรยสั้นๆ เกี่ยวกับร้านของคุณที่นี่ */}
            เรามุ่งมั่นที่จะมอบประสบการณ์ที่ดีที่สุดในการเลือกซื้อสินค้าคุณภาพ
          </p>
        </section>

        {/* Our Story Section */}
        <section className={`${sectionPadding} bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-10`}>
          <h2 className={headingClass}>{/* ปรับให้ชิดซ้าย */}
            เรื่องราวของเรา (Our Story)
          </h2>
          <div className={paragraphClass}>
            <p>
              {storeName} ได้ถือกำเนิดขึ้นในปี {yearFounded} จากความปรารถนาอันแรงกล้าที่จะนำเสนอ
              {/* VVVVV ใส่เนื้อหาของคุณ VVVVV */}
              สินค้าแฟชั่นที่คัดสรรมาอย่างดี ผสมผสานสไตล์คลาสสิกและความทันสมัยเข้าด้วยกัน
              {/* VVVVV สิ้นสุดเนื้อหา VVVVV */}
              ให้กับลูกค้าทุกท่าน.
            </p>
            <p>
              แรงบันดาลใจของเราเริ่มต้นจาก
              {/* VVVVV ใส่เนื้อหาของคุณ VVVVV */}
              การเดินทางและการค้นพบความงดงามของงานฝีมือจากทั่วทุกมุมโลก. เราต้องการแบ่งปันความประทับใจเหล่านั้นผ่านสินค้าทุกชิ้นที่เราเลือกสรร.
              {/* VVVVV สิ้นสุดเนื้อหา VVVVV */}
            </p>
            <p>
              หัวใจสำคัญของ {storeName} คือ
              {/* VVVVV ใส่เนื้อหาของคุณ VVVVV */}
              การให้ความสำคัญกับคุณภาพที่ไม่เป็นสองรองใคร, การออกแบบที่ใส่ใจในรายละเอียด, และความมุ่งมั่นที่จะสร้างความพึงพอใจสูงสุดให้กับลูกค้า.
              {/* VVVVV สิ้นสุดเนื้อหา VVVVV */}
            </p>
          </div>
        </section>

        {/* Our Mission/Vision Section */}
        <section className={`${sectionPadding}`}>
           <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                    <h2 className={subHeadingClass}>พันธกิจของเรา (Our Mission)</h2>
                    <p className={paragraphClass}>
                    {/* VVVVV ใส่เนื้อหาของคุณ VVVVV */}
                    คือการเป็นแพลตฟอร์มที่เชื่อมโยงคุณเข้ากับสินค้าที่มีเอกลักษณ์และเปี่ยมด้วยคุณภาพ สร้างแรงบันดาลใจในทุกๆ วันของคุณ.
                    {/* VVVVV สิ้นสุดเนื้อหา VVVVV */}
                    </p>
                </div>
                <div className="space-y-6">
                    <h2 className={subHeadingClass}>วิสัยทัศน์ของเรา (Our Vision)</h2>
                    <p className={paragraphClass}>
                    {/* VVVVV ใส่เนื้อหาของคุณ VVVVV */}
                    เรามุ่งหวังที่จะเป็นจุดหมายปลายทางอันดับหนึ่งสำหรับผู้ที่มองหาสินค้าที่ไม่เพียงแต่สวยงาม แต่ยังสะท้อนถึงตัวตนและไลฟ์สไตล์.
                    {/* VVVVV สิ้นสุดเนื้อหา VVVVV */}
                    </p>
                </div>
           </div>
        </section>

        {/* (Optional) Our Values Section - เพิ่มส่วนนี้ถ้าต้องการ */}
        {/* <section className={`${sectionPadding} bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 md:p-10`}>
          <h2 className={headingClass}>คุณค่าที่เรายึดมั่น (Our Values)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[
              { title: "คุณภาพ", description: "เราใส่ใจในทุกรายละเอียดของสินค้า..." },
              { title: "บริการด้วยใจ", description: "ทีมงานของเราพร้อมดูแลคุณ..." },
              { title: "ความยั่งยืน", description: "เรามุ่งมั่นที่จะเป็นส่วนหนึ่งของ..." },
            ].map(value => (
              <div key={value.title} className="p-6 bg-white dark:bg-slate-700 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{value.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </section> */}


        {/* Call to Action Section */}
        <section className="text-center py-16">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6 max-w-xl mx-auto">
            เรายินดีต้อนรับคุณเข้าสู่ครอบครัว {storeName}
          </h2>
          <Link href="/products" className="inline-block bg-indigo-600 text-white font-semibold py-3 px-10 rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-lg transform hover:scale-105">
              เลือกชมสินค้าของเรา
          </Link>
        </section>
      </main>
    </>
  );
};

// ไม่จำเป็นต้องมี getLayout ถ้าคุณใช้ MainLayout จาก _app.js เป็น default
// และหน้านี้ไม่ได้ต้องการ Layout ที่แตกต่างออกไป

export default AboutPage;