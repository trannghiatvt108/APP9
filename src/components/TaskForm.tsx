import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, UserProfile } from '../types';
import { STATUS_LABELS } from '../data';
import { X, Save, PlusCircle, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  task?: Task | null; // Null if adding new
  currentUser: UserProfile;
  onSave: (task: Task) => void;
  onClose: () => void;
  currentDateString: string;
  surveyStaff: string[];
  drawingStaff: string[];
}

export default function TaskForm({ 
  task, 
  currentUser, 
  onSave, 
  onClose, 
  currentDateString,
  surveyStaff,
  drawingStaff
}: TaskFormProps) {
  const isEditing = !!task;
  const isAdmin = currentUser.role === 'ADMIN';

  // State fields
  const [id, setId] = useState('');
  const [contractId, setContractId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [surveyor, setSurveyor] = useState('');
  const [drawer, setDrawer] = useState('');
  const [status, setStatus] = useState<TaskStatus>('CHUA_DO');
  const [receivedDate, setReceivedDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [completedDate, setCompletedDate] = useState<string>('');
  const [contractValue, setContractValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
  // Note Log creation
  const [newLogText, setNewLogText] = useState('');

  // Hydrate fields
  useEffect(() => {
    if (task) {
      setId(task.id);
      setContractId(task.contractId || '');
      setCustomerName(task.customerName || '');
      setCustomerPhone(task.customerPhone || '');
      setAddress(task.address || '');
      setSurveyor(task.surveyor || surveyStaff[0] || '');
      setDrawer(task.drawer || drawingStaff[0] || '');
      setStatus(task.status || 'CHUA_DO');
      setReceivedDate(task.receivedDate || currentDateString);
      setDeadlineDate(task.deadlineDate || currentDateString);
      setCompletedDate(task.completedDate || '');
      setContractValue(task.contractValue || 0);
      setNotes(task.notes || '');
    } else {
      // Setup defaults for adding new task
      const randomId = `HS-2026-${Math.floor(100 + Math.random() * 900)}`;
      setId(randomId);
      setContractId(`HĐ-${Math.floor(100 + Math.random() * 900)}`);
      setCustomerName('');
      setCustomerPhone('');
      setAddress('');
      // Default to surveyor if current user is surveyor
      setSurveyor(currentUser.role === 'SURVEYOR' ? currentUser.employeeName : (surveyStaff[0] || ''));
      setDrawer(drawingStaff[0] || '');
      setStatus('CHUA_DO');
      setReceivedDate(currentDateString);
      setDeadlineDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days from now
      setCompletedDate('');
      setContractValue(5000000);
      setNotes('');
    }
  }, [task, currentUser, currentDateString]);

  // When status switches to Completed, automatically fill complete date if empty
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'HOAN_THANH' && !completedDate) {
      setCompletedDate(currentDateString);
    } else if (newStatus !== 'HOAN_THANH') {
      setCompletedDate('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractId || !customerName || !address) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc: Số hợp đồng, Tên khách hàng, Địa chỉ!");
      return;
    }

    const updatedLogs = [...(task?.notesHistory || [])];
    if (newLogText.trim()) {
      updatedLogs.unshift({
        id: Date.now().toString(),
        date: currentDateString,
        author: currentUser.displayName,
        text: newLogText.trim()
      });
    }

    const savedTask: Task = {
      id,
      contractId,
      customerName,
      customerPhone,
      address,
      surveyor,
      drawer,
      status,
      receivedDate,
      deadlineDate,
      completedDate: status === 'HOAN_THANH' ? (completedDate || currentDateString) : null,
      contractValue: Number(contractValue),
      notes,
      notesHistory: updatedLogs
    };

    onSave(savedTask);
  };

  return (
    <div 
      id="task-form-overlay" 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in"
    >
      <div 
        id="task-form-panel"
        className="bg-white w-full max-w-lg h-full overflow-y-auto flex flex-col shadow-2xl animate-slide-in"
      >
        {/* Header */}
        <div id="form-header" className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {isEditing ? `Chi tiết hồ sơ: ${id}` : 'Tạo hồ sơ đo đạc mới'}
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? 'Cập nhật tiến độ' : 'Thêm hồ sơ vào hệ thống'}
            </h2>
          </div>
          <button 
            id="close-form-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Banner for surveyors */}
        {!isAdmin && isEditing && (
          <div id="role-restriction-banner" className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center space-x-2 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Quyền <strong>Nhân viên</strong>: Chỉ có thể điều chỉnh trạng thái đo vẽ và thêm nhật ký tiến độ thực địa.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 p-6 space-y-5">
          
          <div id="primary-info" className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mã Hồ Sơ (ID)</label>
              <input 
                id="input-id"
                type="text" 
                value={id} 
                className="w-full text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl cursor-not-allowed outline-none" 
                readOnly 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Số Hợp Đồng *</label>
              <input 
                id="input-contract-id"
                type="text" 
                value={contractId} 
                onChange={e => setContractId(e.target.value)}
                disabled={!isAdmin}
                required
                placeholder="Ví dụ: HĐ-012"
                className={`w-full text-sm font-semibold text-slate-700 border px-3.5 py-2.5 rounded-xl outline-none transition focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mã và Tên Khách Hàng *</label>
            <input 
              id="input-customer-name"
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              disabled={!isAdmin}
              required
              placeholder="Nhập họ và tên người đứng tên chủ đất"
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 ${
                !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Số Điện Thoại Liên Hệ</label>
            <input 
              id="input-customer-phone"
              type="tel" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)}
              disabled={!isAdmin}
              placeholder="Nhập số điện thoại khách hàng"
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 ${
                !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Địa Chỉ Đo Đạc *</label>
            <textarea 
              id="input-address"
              value={address} 
              onChange={e => setAddress(e.target.value)}
              disabled={!isAdmin}
              required
              rows={2}
              placeholder="Nhập chi tiết số nhà, tên đường, phường xã để cán bộ đo thực địa tìm kiếm"
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 resize-none ${
                !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
              }`}
            />
          </div>

          <div id="staff-assignment" className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cán Bộ Đo (Thực Địa)</label>
              <select 
                id="select-surveyor"
                value={surveyor} 
                onChange={e => setSurveyor(e.target.value)}
                disabled={!isAdmin}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              >
                {surveyStaff.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nhân Viên Vẽ Sơ Đồ</label>
              <select 
                id="select-drawer"
                value={drawer} 
                onChange={e => setDrawer(e.target.value)}
                disabled={!isAdmin}
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              >
                {drawingStaff.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div id="status-and-value" className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Giá Trị Hợp Đồng (đ)</label>
              <input 
                id="input-contract-value"
                type="number" 
                value={contractValue} 
                onChange={e => setContractValue(Number(e.target.value))}
                disabled={!isAdmin}
                className={`w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Trạng Thái Xử Lý</label>
              <select 
                id="select-status"
                value={status} 
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full text-sm font-semibold bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500"
              >
                {Object.entries(STATUS_LABELS).map(([key, item]) => (
                  <option key={key} value={key} className="font-semibold">{item.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div id="dates-section" className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-xs-heading-color text-slate-500 uppercase tracking-wider mb-1">Ngày Nhận</label>
              <input 
                id="input-received-date"
                type="date" 
                value={receivedDate} 
                onChange={e => setReceivedDate(e.target.value)}
                disabled={!isAdmin}
                className={`w-full text-xs px-2.5 py-2 rounded-xl border outline-none focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Hạn Hoàn Thành</label>
              <input 
                id="input-deadline-date"
                type="date" 
                value={deadlineDate} 
                onChange={e => setDeadlineDate(e.target.value)}
                disabled={!isAdmin}
                className={`w-full text-xs px-2.5 py-2 rounded-xl border outline-none focus:border-indigo-500 ${
                  !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày Xong</label>
              <input 
                id="input-completed-date"
                type="date" 
                value={completedDate} 
                onChange={e => setCompletedDate(e.target.value)}
                disabled={status !== 'HOAN_THANH'}
                className={`w-full text-xs px-2.5 py-2 rounded-xl border outline-none focus:border-indigo-500 ${
                  status !== 'HOAN_THANH' ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ghi Chú Đọc Đồng / Biên Bản</label>
            <textarea 
              id="input-notes"
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              disabled={!isAdmin}
              rows={2}
              placeholder="Nhập ghi chú quan trọng hoặc thông báo từ khách hàng..."
              className={`w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition focus:border-indigo-500 resize-none ${
                !isAdmin ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200'
              }`}
            />
          </div>

          {/* Activity Logs (Always editable by either Admin or Surveyor on site!) */}
          <div id="activity-logs-section" className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Nhật Ký Thực Địa & Tiến Độ ({task?.notesHistory?.length || 0})
            </h3>
            
            {/* Log creation tool */}
            <div id="add-log-box" className="p-3 bg-slate-50 rounded-xl space-y-2">
              <label className="block text-[10px] font-semibold text-slate-500">Cập nhật nhanh tệp CAD / Ý kiến thực địa tại trạm đo:</label>
              <div className="flex space-x-2">
                <input 
                  id="input-new-log-text"
                  type="text" 
                  value={newLogText}
                  onChange={e => setNewLogText(e.target.value)}
                  placeholder="Ghi nhận mốc đo đạc, vướng ranh hay hoàn tất sơ đồ..."
                  className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
                <button
                  id="btn-add-log"
                  type="button"
                  onClick={() => {
                    if (!newLogText.trim()) return;
                    // Add dummy logs reactive interface triggers immediately by form submission or standard trigger
                  }}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-semibold rounded-lg flex items-center shrink-0 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 mr-0.5" /> Thêm
                </button>
              </div>
            </div>

            {/* List of existing logs */}
            {task?.notesHistory && task.notesHistory.length > 0 ? (
              <div id="logs-scroller" className="max-h-36 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                {task.notesHistory.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-700">{log.author}</span>
                      <span className="text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{log.text}</p>
                  </div>
                ))}
              </div>
            ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  Chưa có nhật ký hoạt động nào.
                </p>
            )}
          </div>

          {/* Footer Action Bar */}
          <div id="form-footer" className="pt-4 border-t border-slate-100 flex space-x-3">
            <button
              id="btn-form-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
            >
              Hủy bỏ (Trở lại)
            </button>
            <button
              id="btn-form-save"
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm shadow-indigo-200 transition active:scale-98 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Lưu cập nhật' : 'Khởi tạo hồ sơ'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
