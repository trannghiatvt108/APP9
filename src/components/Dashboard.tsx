import React from 'react';
import { Task, TaskStatus } from '../types';
import { STATUS_LABELS } from '../data';
import { 
  FileText, CheckCircle2, AlertTriangle, Clock, XCircle, 
  TrendingUp, Award, User, MapPin, Calendar 
} from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  onNavigateToTasks: (filters?: { status?: TaskStatus; search?: string; onlyOverdue?: boolean }) => void;
  currentDateString: string;
}

export default function Dashboard({ tasks, onNavigateToTasks, currentDateString }: DashboardProps) {
  // Calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'HOAN_THANH').length;
  const cancelledCount = tasks.filter(t => t.status === 'HUY').length;
  const pendingCount = totalCount - completedCount - cancelledCount;

  // Overdue calculation: deadline is before today and status is not COMPLETED or CANCELLED
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'HOAN_THANH' || t.status === 'HUY') return false;
    return t.deadlineDate < currentDateString;
  });
  const overdueCount = overdueTasks.length;

  // Total Contract Value of completed files
  const completedRevenue = tasks
    .filter(t => t.status === 'HOAN_THANH')
    .reduce((sum, t) => sum + (t.contractValue || 0), 0);

  // Group stats by Staff
  const staffStats = tasks.reduce((acc, t) => {
    if (!acc[t.surveyor]) {
      acc[t.surveyor] = { total: 0, completed: 0, pending: 0, cancelled: 0, overdue: 0 };
    }
    const stat = acc[t.surveyor];
    stat.total += 1;
    if (t.status === 'HOAN_THANH') {
      stat.completed += 1;
    } else if (t.status === 'HUY') {
      stat.cancelled += 1;
    } else {
      stat.pending += 1;
      if (t.deadlineDate < currentDateString) {
        stat.overdue += 1;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; pending: number; cancelled: number; overdue: number }>);

  // Sort staff by completed count descending to find "top performers"
  const sortedStaff = Object.entries(staffStats).sort((a, b) => b[1].completed - a[1].completed);

  // Get recent 4 logs in the whole database
  const allLogs = tasks.flatMap(t => 
    t.notesHistory.map(h => ({
      ...h,
      taskTitle: `${t.customerName} (${t.id})`,
      taskId: t.id
    }))
  ).sort((a, b) => b.date.localeCompare(a.date));
  
  const recentLogs = allLogs.slice(0, 4);

  return (
    <div id="dashboard-section" className="space-y-6">
      
      {/* Alert Warning for Overdue Tasks */}
      {overdueCount > 0 && (
        <div 
          id="overdue-banner"
          onClick={() => onNavigateToTasks({ onlyOverdue: true })}
          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-100 transition duration-200 animate-pulse active:scale-98"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-rose-900 text-sm md:text-base">
                Phát hiện {overdueCount} hồ sơ trễ hạn hoàn thành!
              </h4>
              <p className="text-xs md:text-sm text-rose-700">
                Nhấp vào đây để xem chi tiết và đôn đốc cán bô đo xử lý khẩn cấp.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-rose-200 text-rose-800 px-3 py-1 rounded-full">
            Xem ngay
          </span>
        </div>
      )}

      {/* Main KPI Stats Block */}
      <div id="kpi-grid" className="grid grid-cols-2 md:grid-cols-5 gap-3">
        
        <div 
          id="kpi-total"
          onClick={() => onNavigateToTasks({})}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Hồ Sơ</span>
            <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Hồ sơ đo đạc & vẽ bản vẽ</p>
          </div>
        </div>

        <div 
          id="kpi-completed"
          onClick={() => onNavigateToTasks({ status: 'HOAN_THANH' })}
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Hoàn Thành</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-emerald-700">{completedCount}</h3>
            <p className="text-[10px] text-emerald-500 mt-1">
              Tỷ lệ: {totalCount ? Math.round((completedCount/totalCount)*100) : 0}%
            </p>
          </div>
        </div>

        <div 
          id="kpi-pending"
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">Đang Xử Lý</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-amber-700">{pendingCount}</h3>
            <p className="text-[10px] text-amber-500 mt-1">Chưa đo, vẽ hoặc biên bản</p>
          </div>
        </div>

        <div 
          id="kpi-overdue"
          onClick={() => onNavigateToTasks({ onlyOverdue: true })}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            overdueCount > 0 
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400' 
              : 'bg-white border-slate-100 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs font-medium uppercase tracking-wider ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Trễ Hạn</span>
            <div className={`p-1.5 rounded-lg ${overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className={`text-2xl font-bold ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>{overdueCount}</h3>
            <p className={`text-[10px] mt-1 ${overdueCount > 0 ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>Cần kiểm tra khắc phục</p>
          </div>
        </div>

        <div 
          id="kpi-revenue"
          className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition col-span-2 md:col-span-1"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Doanh Thu</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base font-bold text-slate-800 break-all">
              {completedRevenue.toLocaleString('vi-VN')} đ
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Hồ sơ thực tế hoàn thành</p>
          </div>
        </div>

      </div>

      {/* Analytics Summary + Staff Performance (Bento Panel) */}
      <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Staff Performance Stacked Progress Bars */}
        <div id="staff-performance-panel" className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Hiệu Suất Đo Đạc Nhân Viên</h3>
              <p className="text-xs text-slate-400">Thống kê hồ sơ thu thập thực tế của từng cán bộ</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>

          <div className="space-y-4 pt-2">
            {sortedStaff.map(([name, stats]) => {
              const compPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              const pendPercent = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
              const cancPercent = stats.total > 0 ? Math.round((stats.cancelled / stats.total) * 100) : 0;

              return (
                <div key={name} id={`staff-item-${name.replace(/\s+/g, '-')}`} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span 
                      onClick={() => onNavigateToTasks({ search: name })}
                      className="font-semibold text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      {name}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      Hoàn thành: <span className="text-emerald-600 font-bold">{stats.completed}</span> / Tổng: {stats.total} hồ sơ
                    </span>
                  </div>

                  <div className="h-3.5 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                    {stats.completed > 0 && (
                      <div 
                        title={`Hoàn thành: ${stats.completed} hồ sơ`}
                        style={{ width: `${compPercent}%` }}
                        className="bg-indigo-650 h-full flex items-center justify-center text-[8px] text-white font-bold transition-all duration-500"
                      >
                        {compPercent > 15 && `${compPercent}%`}
                      </div>
                    )}
                    {stats.pending > 0 && (
                      <div 
                        title={`Hoạt động: ${stats.pending} hồ sơ`}
                        style={{ width: `${pendPercent}%` }}
                        className="bg-indigo-400/80 h-full flex items-center justify-center text-[8px] text-indigo-950 font-bold transition-all duration-500"
                      >
                        {pendPercent > 15 && `${pendPercent}%`}
                      </div>
                    )}
                    {stats.cancelled > 0 && (
                      <div 
                        title={`Hủy bỏ: ${stats.cancelled} hồ sơ`}
                        style={{ width: `${cancPercent}%` }}
                        className="bg-indigo-200 h-full flex items-center justify-center text-[8px] text-indigo-700 font-bold transition-all duration-500"
                      >
                        {cancPercent > 15 && `${cancPercent}%`}
                      </div>
                    )}
                  </div>
                  {stats.overdue > 0 && (
                    <div className="flex items-center space-x-1 text-[10px] text-rose-600 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{stats.overdue} hồ sơ đang trễ hạn!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Recent Work Logs / Feed */}
        <div id="logs-panel" className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Nhật Ký Thực Địa Gần Đây</h3>
                <p className="text-xs text-slate-400">Ghi nhận tiến độ mới nhất của nhân viên</p>
              </div>
            </div>

            <div className="space-y-4">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} id={`log-item-${log.id}`} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1.5 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {log.author}
                      </span>
                      <span className="text-slate-400 flex items-center">
                        <Calendar className="h-2.5 w-2.5 mr-0.5" />
                        {log.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {log.taskTitle}
                    </p>
                    <p className="text-xs text-slate-500 italic line-clamp-2">
                      "{log.text}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không có nhật ký công việc mới nào gần đây.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button 
              id="btn-navigate-all-tasks"
              onClick={() => onNavigateToTasks({})}
              className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 py-2 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
            >
              Xem toàn bộ danh bạ hồ sơ
            </button>
          </div>
        </div>

      </div>

      {/* Guide Line for Office Staff Android View */}
      <div id="android-guidelines" className="bg-slate-50 border border-slate-100 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-slate-800 text-sm md:text-base">Mẹo thích ứng trên thiết bị Android di động 📱</h4>
          <p className="text-xs text-slate-500">
            Ứng dụng được thiết kế tối ưu hóa diện tích hiển thị trên điện thoại. Bạn có thể vuốt ngang bộ điều khiển, nhấp trực tiếp vào danh sách hồ sơ để chỉnh sửa nhanh trạng thái đo đạc lập tức ở thực địa.
          </p>
        </div>
        <div className="flex space-x-2">
          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
            Chế độ rảnh tay
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
            Đồng bộ Local Offline
          </span>
        </div>
      </div>

    </div>
  );
}
