// pages/admin/reports/revenue.js
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/Layout/AdminLayout';
import { adminGetRevenueReport } from '@/utils/adminService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Helper Functions & Constants ---
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
const monthOptions = [
  { value: '', label: 'ทั้งปี' }, { value: '1', label: 'มกราคม' }, { value: '2', label: 'กุมภาพันธ์' },
  { value: '3', label: 'มีนาคม' }, { value: '4', label: 'เมษายน' }, { value: '5', label: 'พฤษภาคม' },
  { value: '6', label: 'มิถุนายน' }, { value: '7', label: 'กรกฎาคม' }, { value: '8', label: 'สิงหาคม' },
  { value: '9', label: 'กันยายน' }, { value: '10', label: 'ตุลาคม' }, { value: '11', label: 'พฤศจิกายน' },
  { value: '12', label: 'ธันวาคม' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return value.toLocaleString('th-TH');
};
const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7300', '#A3A1FB', '#5EE2A0', '#FFD700'];

// --- Components ย่อย ---
const ReportFilter = ({
  selectedYear, setSelectedYear,
  selectedMonth, setSelectedMonth,
  compareEnabled, setCompareEnabled,
  selectedCompareYear, setSelectedCompareYear,
  selectedCompareMonth, setSelectedCompareMonth,
  onSubmit, isLoading
}) => {
  const inputClass = "block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer transition-colors";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5";
  const primaryButtonClasses = "w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-60 transition-colors";
  return (
    <form onSubmit={onSubmit} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
        <div>
          <label htmlFor="yearFilter" className={labelClass}>เลือกปี:</label>
          <select id="yearFilter" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} disabled={isLoading} className={inputClass}>
            {yearOptions.map(year => (<option key={year} value={year}>{year}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="monthFilter" className={labelClass}>เลือกเดือน:</label>
          <select id="monthFilter" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={isLoading} className={inputClass}>
            {monthOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </div>
        <div className="flex items-center pt-6 sm:pt-8">
            <input type="checkbox" id="compareEnabled" checked={compareEnabled} onChange={(e) => setCompareEnabled(e.target.checked)} disabled={isLoading}
              className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-500 rounded focus:ring-indigo-500" />
            <label htmlFor="compareEnabled" className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">เปรียบเทียบกับช่วงอื่น</label>
        </div>
        <div className="lg:col-start-4">
          <button type="submit" disabled={isLoading} className={`${primaryButtonClasses} w-full`}>
            {isLoading ? 'กำลังโหลด...' : 'ดูรายงาน'}
          </button>
        </div>
      </div>
      {compareEnabled && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-end">
              <div>
                  <label htmlFor="compareYearFilter" className={labelClass}>ปีที่เปรียบเทียบ:</label>
                  <select id="compareYearFilter" value={selectedCompareYear} onChange={(e) => setSelectedCompareYear(parseInt(e.target.value))} disabled={isLoading} className={inputClass}>
                      {yearOptions.map(year => (<option key={`cy-${year}`} value={year}>{year}</option>))}
                  </select>
              </div>
              <div>
                  <label htmlFor="compareMonthFilter" className={labelClass}>เดือนที่เปรียบเทียบ:</label>
                  <select id="compareMonthFilter" value={selectedCompareMonth} onChange={(e) => setSelectedCompareMonth(e.target.value)} disabled={isLoading} className={inputClass}>
                      {monthOptions.map(opt => (<option key={`cm-${opt.value}`} value={opt.value}>{opt.label}</option>))}
                  </select>
              </div>
          </div>
      )}
    </form>
  );
};

const RevenuePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-center py-10 text-slate-500 dark:text-slate-400">ไม่มีข้อมูลรายได้ตามหมวดหมู่สำหรับแสดงกราฟ</p>;
  }
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-3 shadow-lg rounded-md border border-slate-200 dark:border-slate-600 text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{`${dataPoint.name}`}</p>
          <p className="text-slate-600 dark:text-slate-300">รายได้: {formatCurrency(dataPoint.value)}</p>
          {dataPoint.percentage !== undefined && (
            <p className="text-slate-500 dark:text-slate-400">สัดส่วน: {dataPoint.percentage.toFixed(2)}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: "11px", marginTop: "15px"}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const RevenueComparisonChart = ({ data, currentLabel, comparisonLabel }) => {
    if (!data || data.length === 0 || !currentLabel || !comparisonLabel || !data[0]?.[currentLabel] || !data[0]?.[comparisonLabel] ) {
        return <p className="text-sm text-center py-10 text-slate-500 dark:text-slate-400">ไม่มีข้อมูลเพียงพอสำหรับกราฟเปรียบเทียบ</p>;
    }
    return (
        <div style={{ width: '100%', height: 250 }}> {/* ปรับความสูงตามความเหมาะสม */}
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}> {/* ปรับ left margin ให้พอดีกับ label แกน Y */}
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="dark:stroke-slate-700"/>
                    <XAxis type="number" tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} tick={{ fontSize: 10, fill: 'var(--chart-text-color, #4A5568)' }} className="dark:fill-slate-400"/>
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'var(--chart-text-color, #4A5568)' }} className="dark:fill-slate-400"/>
                    <Tooltip formatter={(value, name) => [formatCurrency(value), name]} wrapperStyle={{fontSize: '12px'}} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '4px' }}/>
                    <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                    <Bar dataKey={currentLabel} fill="var(--chart-bar-color, #6366f1)" name={`รายได้: ${currentLabel}`} barSize={20} radius={[0, 4, 4, 0]}/>
                    <Bar dataKey={comparisonLabel} fill="var(--chart-bar-color-previous, #a5b4fc)" name={`รายได้: ${comparisonLabel}`} barSize={20} radius={[0, 4, 4, 0]}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const RevenueReportPageContent = () => {
  const { isAuthenticated, isLoading: authIsLoading, isAdmin } = useAuth();
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [selectedCompareYear, setSelectedCompareYear] = useState(currentYear - 1);
  const [selectedCompareMonth, setSelectedCompareMonth] = useState('');

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  // ใช้ชื่อ state เดียวกันให้ตลอด: pieChartData
  const [pieChartData, setPieChartData] = useState([]);
  const [revenueComparisonData, setRevenueComparisonData] = useState([]);


  const fetchRevenueReport = useCallback(async () => {
    if (!isAuthenticated || !isAdmin || !selectedYear) return;
    
    setLoadingReport(true); setReportError(''); setReportData(null); 
    setPieChartData([]); // เคลียร์ข้อมูลกราฟเก่า
    setRevenueComparisonData([]); // เคลียร์ข้อมูลกราฟเก่า

    const yearToFetch = selectedYear;
    const monthToFetch = selectedMonth ? parseInt(selectedMonth) : undefined;
    let compareYearToFetch = undefined;
    let compareMonthToFetch = undefined;

    if (compareEnabled && selectedCompareYear) {
        compareYearToFetch = selectedCompareYear;
        if (selectedCompareMonth) {
            compareMonthToFetch = parseInt(selectedCompareMonth);
        }
    }

    try {
      const data = await adminGetRevenueReport(yearToFetch, monthToFetch, compareYearToFetch, compareMonthToFetch);
      setReportData(data);
      console.log("[RevenueReportPage] Revenue report fetched:", data);

      if (data) {
        // 1. สำหรับ Pie Chart (รายได้ตามหมวดหมู่)
        if (data.revenue_by_category) {
          const transformedPieData = data.revenue_by_category.map((cat, index) => ({
            name: cat.category_name,
            value: cat.total_revenue,
            percentage: cat.percentage_of_total,
            // สีจะถูกกำหนดใน RevenuePieChart component โดยใช้ PIE_CHART_COLORS
          }));
          setPieChartData(transformedPieData);
        }

        // 2. สำหรับ Bar Chart (เปรียบเทียบรายได้รวม)
        if (data.previous_period_data && data.overall_total_revenue !== undefined) {
            const currentLabel = data.month 
                ? `${monthOptions.find(m=>m.value===String(data.month))?.label || `ด.${data.month}`} ${data.year}` 
                : `ปี ${data.year}`;
            const previousLabel = data.previous_period_data.month 
                ? `${monthOptions.find(m=>m.value===String(data.previous_period_data.month))?.label || `ด.${data.previous_period_data.month}`} ${data.previous_period_data.year}` 
                : `ปี ${data.previous_period_data.year}`;
            
            const compData = [{
                name: 'รายได้รวม',
                [currentLabel]: data.overall_total_revenue,
                [previousLabel]: data.previous_period_data.overall_total_revenue,
            }];
            setRevenueComparisonData(compData);
        }
      }
    } catch (err) {
      console.error("[RevenueReportPage] Failed to fetch revenue report:", err);
      setReportError(err.message || 'Could not load revenue report.');
    } finally {
      setLoadingReport(false);
    }
  }, [isAuthenticated, isAdmin, selectedYear, selectedMonth, compareEnabled, selectedCompareYear, selectedCompareMonth]);


  useEffect(() => {
    if (!authIsLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.replace(isAuthenticated ? '/' : `/login?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [authIsLoading, isAuthenticated, isAdmin, router]);
  
  useEffect(() => {
      if(isAuthenticated && isAdmin && !authIsLoading && selectedYear){
          fetchRevenueReport();
      }
  }, [isAuthenticated, isAdmin, authIsLoading, selectedYear, selectedMonth, compareEnabled, selectedCompareYear, selectedCompareMonth, fetchRevenueReport]);

  const handleFilterSubmit = (e) => { e.preventDefault(); fetchRevenueReport(); };

  const storeName = "ชื่อร้านของคุณ";
  if (authIsLoading) { return <div className="p-6 text-center text-slate-500 dark:text-slate-400">กำลังตรวจสอบสิทธิ์...</div>; }
  if (!isAuthenticated || !isAdmin) { return <div className="p-6 text-center text-red-500 dark:text-red-400">คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้</div>; }

  let currentPeriodLabelForChart = '';
  let comparisonPeriodLabelForChart = '';
  if (reportData && revenueComparisonData.length > 0 && revenueComparisonData[0]) {
      currentPeriodLabelForChart = reportData.month 
          ? `${monthOptions.find(m=>m.value===String(reportData.month))?.label || `ด.${reportData.month}`} ${reportData.year}` 
          : `ปี ${reportData.year}`;
      if (reportData.previous_period_data) {
          comparisonPeriodLabelForChart = reportData.previous_period_data.month 
              ? `${monthOptions.find(m=>m.value===String(reportData.previous_period_data.month))?.label || `ด.${reportData.previous_period_data.month}`} ${reportData.previous_period_data.year}` 
              : `ปี ${reportData.previous_period_data.year}`;
      }
  }

  return (
    <>
      <Head>
        <title>รายงานรายได้ - Admin Panel - {storeName}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-8">
        รายงานสรุปรายได้
      </h1>

      <ReportFilter 
        selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
        compareEnabled={compareEnabled} setCompareEnabled={setCompareEnabled}
        selectedCompareYear={selectedCompareYear} setSelectedCompareYear={setSelectedCompareYear}
        selectedCompareMonth={selectedCompareMonth} setSelectedCompareMonth={setSelectedCompareMonth}
        onSubmit={handleFilterSubmit} isLoading={loadingReport}
      />

      {loadingReport && (
        <div className="p-10 text-center text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลรายงาน...</div>
      )}
      {reportError && !loadingReport && (
        <div className="p-4 my-6 text-sm text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30 rounded-lg text-center shadow">
          <strong>เกิดข้อผิดพลาด:</strong> {reportError}
        </div>
      )}

      {reportData && !loadingReport && !reportError && (
        <div className="space-y-8 mt-8">
          {/* Overall Summary */}
          <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b dark:border-slate-700">
              สรุปภาพรวมสำหรับ: <span className="text-indigo-600 dark:text-indigo-400">
                {selectedMonth ? monthOptions.find(m=>m.value===selectedMonth)?.label : 'ทั้ง'} ปี {selectedYear}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/60 rounded-lg text-center shadow">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">คำสั่งซื้อทั้งหมด</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatNumber(reportData.overall_total_orders)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/60 rounded-lg text-center shadow">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">รายได้รวมทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(reportData.overall_total_revenue)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/60 rounded-lg text-center shadow">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ข้อมูล ณ วันที่</p>
                <p className="text-md font-medium text-slate-700 dark:text-slate-200 mt-2">{new Date(reportData.report_generated_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>
          </section>

          {/* Revenue Comparison Chart */}
          {revenueComparisonData.length > 0 && reportData.previous_period_data && (
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 pb-3 border-b dark:border-slate-700">
                เปรียบเทียบรายได้รวม
                {reportData.comparison_type && <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({reportData.comparison_type === 'vs_previous_month' ? 'เทียบเดือนต่อเดือน' : (reportData.comparison_type === 'vs_previous_year' ? 'เทียบปีต่อปี' : reportData.comparison_type )})</span>}
              </h2>
              <RevenueComparisonChart 
                data={revenueComparisonData} 
                currentLabel={currentPeriodLabelForChart}
                comparisonLabel={comparisonPeriodLabelForChart}
              />
            </section>
          )}

          {/* Revenue by Category Pie Chart */}
          {pieChartData.length > 0 && ( // <--- แก้ไข: ใช้ pieChartData
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 pb-3 border-b dark:border-slate-700">
                สัดส่วนรายได้ตามหมวดหมู่สินค้า
              </h2>
              <RevenuePieChart data={pieChartData} /> {/* <--- เรียกใช้ Pie Chart Component */}
            </section>
          )}
          {/* ถ้าไม่มีข้อมูลรายได้ตามหมวดหมู่ */}
          {(!reportData.revenue_by_category || reportData.revenue_by_category.length === 0) && !loadingReport && (
             <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
                <p className="text-slate-500 dark:text-slate-400 py-4">ไม่พบข้อมูลรายได้ตามหมวดหมู่สำหรับช่วงเวลานี้</p>
             </section>
          )}
        </div>
      )}
    </>
  );
};

// Wrapper component และ getLayout
const RevenueReportPage = () => {
    return <RevenueReportPageContent />
}
RevenueReportPage.getLayout = function getLayout(page) {
  return <AdminLayout title="รายงานรายได้">{page}</AdminLayout>;
};
export default RevenueReportPage;