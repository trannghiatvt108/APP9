import React, { useState } from 'react';
import { Task } from '../types';
import { Calendar, BarChart2, TrendingUp, Filter, Users, Award } from 'lucide-react';

interface AnalyticsProps {
  tasks: Task[];
  surveyStaff: string[];
}

export default function Analytics({ tasks, surveyStaff }: AnalyticsProps) {
  const [selectedSurveyor, setSelectedSurveyor] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL'); // 'ALL' or '04', '05', etc.

  // Filter only completed tasks for completion stats
  const completedTasks = tasks.filter(t => {
    if (t.status !== 'HOAN_THANH' || !t.completedDate) return false;
    
    const matchSurveyor = selectedSurveyor === 'ALL' || t.surveyor === selectedSurveyor;
    
    let matchMonth = true;
    if (selectedMonth !== 'ALL') {
      const month = t.completedDate.split('-')[1]; // YYYY-MM-DD -> MM
      matchMonth = month === selectedMonth;
    }

    return matchSurveyor && matchMonth;
  });

  // Count contracts completed by date
  const completedStatsByDate = completedTasks.reduce((acc, t) => {
    const date = t.completedDate!;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort dates chronologically
  const sortedDates = Object.keys(completedStatsByDate).sort();

  // Find max value for chart scaling
  const maxYValue = sortedDates.length > 0 ? Math.max(...Object.values(completedStatsByDate)) : 5;

  // Monthly stats for overview
  const monthlyCounts = tasks.filter(t => t.status === 'HOAN_THANH' && t.completedDate).reduce((acc, t) => {
    const month = t.completedDate!.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Total Contract Val
  const currentTotalVal = completedTasks.reduce((sum, t) => sum + (t.contractValue || 0), 0);

  return (
    <div id="analytics-section" className="space-y-6">
      
      {/* Title & Filter Options */}
      <div id="analytics-filter-bar" className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Phân Tích Thống Kê Hợp Đồng 📈</h3>
          <p className="text-xs text-slate-400">Thống kê số lượng hồ sơ đo đạc hoàn thành dựa theo ngày</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="h-3.5 w-3.5" />
            <span>Cán bộ:</span>
            <select 
              id="analytics-surveyor-filter"
              value={selectedSurveyor}
              onChange={e => setSelectedSurveyor(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">Toàn bộ nhân viên</option>
              {surveyStaff.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Calendar className="h-3.5 w-3.5" />
            <span>Tháng:</span>
            <select
              id="analytics-month-filter"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer"
            >
              <option value="ALL">Tất cả tháng</option>
              <option value="03">Tháng 3</option>
              <option value="04">Tháng 4</option>
              <option value="05">Tháng 5</option>
            </select>
          </div>

        </div>
      </div>

      {/* KPI stats for the filtered period */}
      <div id="analytics-kpi-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Hợp đồng hoàn thành</p>
            <h3 className="text-2xl font-bold text-slate-800">{completedTasks.length} hồ sơ</h3>
            <p className="text-[10px] text-slate-400">Đã nghiệm thu hiện trường & bàn giao CAD</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Giá trị nghiệm thu</p>
            <h3 className="text-xl font-bold text-slate-800">{currentTotalVal.toLocaleString('vi-VN')} đ</h3>
            <p className="text-[10px] text-slate-400">Doanh thu thu về thực tế</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Tốc độ hoàn thiện ngày</p>
            <h3 className="text-xl font-bold text-slate-800">
              {sortedDates.length > 0 
                ? (completedTasks.length / sortedDates.length).toFixed(1.5) 
                : 0} hồ sơ / ngày
            </h3>
            <p className="text-[10px] text-slate-400">Năng suất bình quân dựa trên biểu mẫu</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div id="chart-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Biểu Đồ Tiến Độ Hoàn Thành Hợp Đồng Theo Ngày 📊</h4>
            <p className="text-xs text-slate-400">Chiều cao cột phản ánh số lượng hồ sơ hoàn thiện trong ngày</p>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {selectedSurveyor === 'ALL' ? 'Tất cả nhân viên' : selectedSurveyor}
          </span>
        </div>

        {sortedDates.length > 0 ? (
          <div>
            {/* Real responsive SVG Bar chart */}
            <div className="h-64 w-full flex items-end justify-between gap-1 md:gap-3.5 pt-6 pb-2 px-1 border-b border-slate-100 overflow-x-auto">
              {sortedDates.map((date) => {
                const count = completedStatsByDate[date];
                // Height percentage calculation
                const heightPercent = maxYValue > 0 ? (count / maxYValue) * 80 + 10 : 10;
                // Nice formatting e.g. "27/05" from "2026-05-27"
                const [,,dayMonth] = date.split('-');
                const shortDate = `${date.split('-')[2]}/${date.split('-')[1]}`;

                return (
                  <div key={date} className="flex-1 min-w-[32px] max-w-[64px] flex flex-col items-center group relative cursor-pointer pt-6">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-1 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                      Ngày {shortDate}: {count} hồ sơ
                    </div>

                    <div className="text-xs font-bold text-emerald-600 mb-1 group-hover:scale-110 transition">
                      {count}
                    </div>

                    {/* Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all duration-300 shadow-xs"
                    />

                    {/* Label */}
                    <span className="text-[10px] font-semibold text-slate-400 mt-2 truncate max-w-full text-center">
                      {shortDate}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center items-center space-x-4 pt-3 text-[11px] text-slate-400">
              <span className="flex items-center">
                <span className="h-3 w-3 bg-emerald-500 rounded mr-1.5" /> 
                Số lượng hợp đồng đạt tiêu chuẩn nghiệm thu
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-sm">
            Chưa phát hiện trường hợp hoàn thành nào khớp với bộ lọc can hệ.
          </div>
        )}

      </div>

      {/* Detail list table mapping directly back to completion date */}
      <div id="analytics-table-card" className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm">Danh Sách Hồ Sơ Đã Bàn Giao Theo Bộ Lọc ({completedTasks.length})</h4>
        
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold tracking-wider uppercase">
                <th className="p-3 text-center">STT</th>
                <th className="p-3">Ngày Xong</th>
                <th className="p-3">Mã Hồ Sơ</th>
                <th className="p-3">Số Hợp Đồng</th>
                <th className="p-3">Chủ Đất</th>
                <th className="p-3">Cán Bộ Đo</th>
                <th className="p-3">Kinh Phí (đ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
              {completedTasks.length > 0 ? (
                completedTasks.map((t, index) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center text-slate-400">{index + 1}</td>
                    <td className="p-3 font-bold text-slate-800">{t.completedDate}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{t.id}</td>
                    <td className="p-3 font-mono">{t.contractId}</td>
                    <td className="p-3 text-slate-700 font-semibold">{t.customerName}</td>
                    <td className="p-3">{t.surveyor}</td>
                    <td className="p-3 text-right font-bold text-slate-700">
                      {t.contractValue?.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 italic">
                    Không có dữ liệu hoàn thành tương ứng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
