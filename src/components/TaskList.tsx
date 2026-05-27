import React, { useState } from 'react';
import { Task, TaskStatus, UserProfile } from '../types';
import { STATUS_LABELS } from '../data';
import { 
  Search, SlidersHorizontal, Calendar, Phone, MapPin, 
  Trash2, Edit, FileDown, Plus, AlertTriangle, RefreshCcw, Check, Sparkles 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface TaskListProps {
  tasks: Task[];
  currentUser: UserProfile;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddNewTask: () => void;
  currentDateString: string;
  surveyStaff: string[];
}

// Accent stripping helper to prevent PDF unicode issues
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s\-\/\:\.\,\(\)]/g, '');
}

export default function TaskList({ 
  tasks, 
  currentUser, 
  onEditTask, 
  onDeleteTask, 
  onAddNewTask,
  currentDateString,
  surveyStaff
}: TaskListProps) {
  
  const isAdmin = currentUser.role === 'ADMIN';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [surveyorFilter, setSurveyorFilter] = useState<string>('ALL');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'receivedDate' | 'deadlineDate' | 'contractId'>('receivedDate');

  // Filter tasks based on rules
  const filteredTasks = tasks.filter(t => {
    // 1. If non-admin surveyor, they can ONLY view their own assigned records!
    if (currentUser.role === 'SURVEYOR' && t.surveyor !== currentUser.employeeName) {
      return false;
    }
    // If non-admin drawer, they can ONLY view their own drawings!
    if (currentUser.role === 'DRAWER' && t.drawer !== currentUser.employeeName) {
      return false;
    }

    // 2. Search query (matches ID, Contract ID, customer name, address, or surveyor)
    const matchSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contractId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.surveyor.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Status filter
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

    // 4. Surveyor filter (only for admins, since staff are already filtered)
    const matchSurveyor = surveyorFilter === 'ALL' || t.surveyor === surveyorFilter;

    // 5. Overdue filter
    const isOverdue = t.status !== 'HOAN_THANH' && t.status !== 'HUY' && t.deadlineDate < currentDateString;
    const matchOverdue = !isOverdueOnly || isOverdue;

    return matchSearch && matchStatus && matchSurveyor && matchOverdue;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'contractId') return a.contractId.localeCompare(b.contractId);
    return b[sortBy].localeCompare(a[sortBy]); // Descending order (newest first)
  });

  // EXPORT EXCEL
  const handleExportExcel = () => {
    // Format data beautifully for spreadsheets
    const exportData = sortedTasks.map((t, idx) => ({
      "STT": idx + 1,
      "Mã Hồ Sơ": t.id,
      "Số Hợp Đồng": t.contractId,
      "Chủ Đất (Khách Hàng)": t.customerName,
      "Số Điện Thoại": t.customerPhone,
      "Địa Chỉ Bất Động Sản": t.address,
      "Cán Bộ Đo Thực Địa": t.surveyor,
      "Nhân Viên Vẽ Sơ Đồ": t.drawer,
      "Trạng Thái Công Việc": STATUS_LABELS[t.status]?.label || t.status,
      "Giá Trị Hợp Đồng (VND)": t.contractValue,
      "Ngày Nhận Hồ Sơn": t.receivedDate,
      "Hạn Hoàn Thành": t.deadlineDate,
      "Ngày Hoàn Thành Thực Tế": t.completedDate || "Chưa hoàn thành",
      "Ghi Chú Văn Phòng": t.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHoSo_BaoCao");
    
    // Style adjustments for Excel
    worksheet["!cols"] = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã hồ sơ
      { wch: 15 }, // Số hợp đồng
      { wch: 25 }, // Khách hàng
      { wch: 15 }, // Số điện thoại
      { wch: 40 }, // Địa chỉ
      { wch: 20 }, // Cán bộ đo
      { wch: 20 }, // Nhân viên vẽ
      { wch: 20 }, // Trạng thái
      { wch: 22 }, // Giá trị
      { wch: 14 }, // Ngày nhận
      { wch: 14 }, // Hạn hoàn thành
      { wch: 14 }, // Ngày hoàn thành
      { wch: 30 }  // Ghi chú
    ];

    XLSX.writeFile(workbook, `Bao-Cao-Moi-Nhat-${currentDateString}.xlsx`);
  };

  // EXPORT PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Strip accents for standard PDF font rendering compatibility
    const headerTitle = removeVietnameseAccents("BAO CAO TIEN DO CONG VIEC DO DAC & BAN VE DIAD CHINH");
    const docDate = removeVietnameseAccents(`Xuat luc: ${currentDateString} | Tao boi: ${currentUser.displayName}`);
    
    // Document layout & Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(headerTitle, 15, 15);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(docDate, 15, 21);
    
    // Draw table headers
    const cols = ["STT", "MA HS", "SO HD", "KHACH HANG", "DIA CHI", "CAN BO DO", "VE BD", "TRANG THAI", "HAN XONG"];
    const startY = 30;
    const rowHeight = 8;
    const cellWidths = [10, 22, 22, 40, 68, 32, 25, 28, 20];
    const leftMargin = 15;

    // Draw header row
    doc.setFillColor(51, 65, 85); // Slate 700 background
    doc.rect(leftMargin, startY, cellWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);

    let currentX = leftMargin;
    cols.forEach((col, idx) => {
      doc.text(col, currentX + 2, startY + 5.5);
      currentX += cellWidths[idx];
    });

    // Draw table content
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFont("Helvetica", "normal");
    let currentY = startY + rowHeight;

    sortedTasks.forEach((t, idx) => {
      // Create landscape page break if going out of page boundary
      if (currentY > 180) {
        doc.addPage();
        currentY = 20;
        // Redraw table headers on new page
        doc.setFillColor(51, 65, 85);
        doc.rect(leftMargin, currentY, cellWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        let tempX = leftMargin;
        cols.forEach((col, cIdx) => {
          doc.text(col, tempX + 2, currentY + 5.5);
          tempX += cellWidths[cIdx];
        });
        doc.setTextColor(30, 41, 59);
        doc.setFont("Helvetica", "normal");
        currentY += rowHeight;
      }

      // Populate text values nicely stripped of accents to ensure visual print
      const sIndex = (idx + 1).toString();
      const sId = removeVietnameseAccents(t.id);
      const sContract = removeVietnameseAccents(t.contractId);
      const sCust = removeVietnameseAccents(t.customerName);
      const sAddr = removeVietnameseAccents(t.address).substring(0, 35); // truncate
      const sSurv = removeVietnameseAccents(t.surveyor);
      const sDraw = removeVietnameseAccents(t.drawer);
      const sStatus = removeVietnameseAccents(STATUS_LABELS[t.status]?.label || t.status);
      const sDue = removeVietnameseAccents(t.deadlineDate);

      const fields = [sIndex, sId, sContract, sCust, sAddr, sSurv, sDraw, sStatus, sDue];

      // Alternating row background colors
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(leftMargin, currentY, cellWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      }

      // Write cell texts
      let writeX = leftMargin;
      fields.forEach((field, fIdx) => {
        doc.text(field, writeX + 2, currentY + 5.5);
        writeX += cellWidths[fIdx];
      });

      // Draw separator line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(leftMargin, currentY + rowHeight, leftMargin + cellWidths.reduce((a, b) => a + b, 0), currentY + rowHeight);

      currentY += rowHeight;
    });

    // Stamp and approval panel simulation
    const approvalY = currentY + 12;
    if (approvalY < 185) {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text(removeVietnameseAccents("NGUOI LAP BIEU"), leftMargin + 10, approvalY);
      doc.text(removeVietnameseAccents("QUAN LY DUYET (ADMIN)"), leftMargin + 200, approvalY);
      doc.setFont("Helvetica", "normal");
      doc.text(removeVietnameseAccents("(Ky va ghi ro ho ten)"), leftMargin + 12, approvalY + 5);
      doc.text(removeVietnameseAccents("(Ky ten va dong dau)"), leftMargin + 208, approvalY + 5);
    }

    doc.save(`Bao-Cao-Do-Dac-${currentDateString}.pdf`);
  };

  // Quick helper to check if a task is overdue
  const checkOverdue = (t: Task) => {
    return t.status !== 'HOAN_THANH' && t.status !== 'HUY' && t.deadlineDate < currentDateString;
  };

  return (
    <div id="task-list-section" className="space-y-4">
      
      {/* Search & Bulk Operations Header */}
      <div id="search-filter-card" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        
        {/* Search Input and Exporter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input 
              id="search-input"
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm: Mã hồ sơ, số HĐ, tên khách hàng, tọa độ địa chỉ..." 
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 text-sm rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
            {isAdmin && (
              <button
                id="btn-add-task-list"
                onClick={onAddNewTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1" /> Thêm hồ sơ mới
              </button>
            )}

            <button
              id="export-excel-btn"
              onClick={handleExportExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center transition cursor-pointer whitespace-nowrap"
              title="Xuất File Excel"
            >
              <FileDown className="h-4 w-4 mr-1 text-emerald-600" /> Excel
            </button>

            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-3 rounded-xl text-xs font-bold flex items-center transition cursor-pointer whitespace-nowrap"
              title="Xuất File PDF In"
            >
              <FileDown className="h-4 w-4 mr-1 text-rose-600" /> PDF
            </button>
          </div>

        </div>

        {/* Horizontal Filters Section */}
        <div id="filter-controls" className="flex flex-col md:flex-row md:items-center justify-between pt-1 gap-2.5">
          
          {/* Scrollable Status Tags (Touch optimized for Android!) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none shrink-0 max-w-full md:max-w-[70%]">
            <button
              id="btn-status-all"
              onClick={() => { setStatusFilter('ALL'); setIsOverdueOnly(false); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'ALL' && !isOverdueOnly
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tất cả ({tasks.length})
            </button>

            <button
              id="btn-status-overdue"
              onClick={() => { setIsOverdueOnly(true); setStatusFilter('ALL'); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap flex items-center space-x-1 cursor-pointer ${
                isOverdueOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-current shrink-0" />
              <span>Trễ hạn ({tasks.filter(t => t.status !== 'HOAN_THANH' && t.status !== 'HUY' && t.deadlineDate < currentDateString).length})</span>
            </button>

            {Object.entries(STATUS_LABELS).map(([key, value]) => {
              const count = tasks.filter(t => t.status === key).length;
              const isSelected = statusFilter === key && !isOverdueOnly;
              return (
                <button
                  key={key}
                  id={`btn-status-${key.toLowerCase()}`}
                  onClick={() => { setStatusFilter(key); setIsOverdueOnly(false); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {value.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Selector filters for Surveyor and Sorting */}
          <div className="flex items-center gap-2 max-w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs text-slate-500">
            {isAdmin && (
              <div className="flex items-center space-x-1 whitespace-nowrap">
                <span>Nhân viên:</span>
                <select 
                  id="select-surveyor-filter"
                  value={surveyorFilter}
                  onChange={e => setSurveyorFilter(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold outline-none text-slate-700 cursor-pointer"
                >
                  <option value="ALL">Tất cả cán bộ</option>
                  {surveyStaff.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-1 whitespace-nowrap">
              <span>Sắp xếp:</span>
              <select 
                id="select-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold outline-none text-slate-700 cursor-pointer"
              >
                <option value="receivedDate">Ngày nhận</option>
                <option value="deadlineDate">Hạn đo đạc</option>
                <option value="contractId">Số hợp đồng</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Task Count Summary */}
      <p className="text-xs text-slate-400 pl-1 font-medium select-none">
        Tìm thấy <span className="text-slate-700 font-bold">{sortedTasks.length}</span> hồ sơ khớp với điều kiện lọc.
      </p>

      {/* Mobile-Friendly Grid & Table List */}
      <div id="tasks-scroll-container" className="space-y-3.5">
        
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => {
            const isOverdue = checkOverdue(task);
            const statusStyle = STATUS_LABELS[task.status] || { label: task.status, color: "text-slate-600", bg: "bg-slate-50" };

            return (
              <div 
                key={task.id} 
                id={`task-card-${task.id}`}
                className={`bg-white rounded-2xl border p-4 transition shadow-xs hover:shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue ? 'border-rose-200 hover:border-rose-400 bg-rose-50/10' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                {/* Visual side strip indicator */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  isOverdue ? 'bg-rose-500' : task.status === 'HOAN_THANH' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} />

                {/* Left Side: Client profile, ID, location */}
                <div className="flex-1 space-y-2.5 pl-2.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3.5 py-1 rounded-lg">
                      {task.id}
                    </span>
                    <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-800 px-3.5 py-1 rounded-lg">
                      Số HĐ: {task.contractId}
                    </span>
                    
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>

                    {isOverdue && (
                      <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1 animate-pulse">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Trễ Hạn!</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 flex items-center">
                      {task.customerName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                      {task.customerPhone || "Chưa bổ sung SĐT"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-start">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-red-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{task.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400 font-medium">
                    <p>
                      Đo đạc: <span className="text-slate-700 font-semibold">{task.surveyor}</span>
                    </p>
                    <p>
                      Bản vẽ: <span className="text-slate-700 font-semibold">{task.drawer}</span>
                    </p>
                    <p>
                      Giá trị: <span className="text-indigo-600 font-bold">{(task.contractValue || 0).toLocaleString('vi-VN')} đ</span>
                    </p>
                  </div>
                </div>

                {/* Right Side: Deadline progress & Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 gap-4 pl-2.5">
                  
                  {/* Deadline box */}
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ngày nhận - Hạn xử lý</p>
                    <div className="flex items-center text-xs md:justify-end text-slate-600 space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.receivedDate}</span>
                      <span className="text-slate-300">→</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>{task.deadlineDate}</span>
                    </div>
                    {task.completedDate && (
                      <p className="text-[10px] text-emerald-600 font-medium md:text-right">
                        Xong ngày: <span className="font-bold">{task.completedDate}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions Buttons Group */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      id={`btn-edit-${task.id}`}
                      onClick={() => onEditTask(task)}
                      className="p-3 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition cursor-pointer active:scale-95"
                      title="Sửa / Xem chi tiết"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    {isAdmin && (
                      <button
                        id={`btn-delete-${task.id}`}
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ ${task.id} khỏi cơ sở dữ liệu?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition cursor-pointer active:scale-95"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div id="no-tasks-placeholder" className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3.5">
            <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full">
              <Search className="h-8 w-8" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Không tìm thấy hồ sơ lý tưởng</h3>
              <p className="text-xs text-slate-500">
                Hãy thử làm sạch thanh tìm kiếm, đổi bộ lọc ngày hoàn thành hoặc cấu hình cán bộ khác.
              </p>
            </div>
            <button 
              id="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setSurveyorFilter('ALL');
                setIsOverdueOnly(false);
              }}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4.5 py-2.5 rounded-full hover:bg-indigo-100 transition cursor-pointer"
            >
              Làm mới bộ lọc
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
