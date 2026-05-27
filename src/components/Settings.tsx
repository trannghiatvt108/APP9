import React, { useState, useRef } from 'react';
import { UserProfile, Task } from '../types';
import { 
  Shield, Database, Download, Upload, Smartphone, Check, 
  Bell, AlertCircle, RefreshCcw, HardDriveDownload,
  Plus, Trash2, UserPlus, Users
} from 'lucide-react';

interface SettingsProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  tasks: Task[];
  onRestoreBackup: (tasks: Task[]) => void;
  onResetDatabase: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  backupHistory: Array<{ timestamp: string; count: number; filename: string }>;
  onManualBackup: () => void;
  
  // Dynamic staff & user management states
  users: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  surveyStaff: string[];
  onUpdateSurveyStaff: (staff: string[]) => void;
  drawingStaff: string[];
  onUpdateDrawingStaff: (staff: string[]) => void;
}

export default function Settings({
  currentUser,
  onUserChange,
  tasks,
  onRestoreBackup,
  onResetDatabase,
  notificationsEnabled,
  onToggleNotifications,
  backupHistory,
  onManualBackup,
  users,
  onUpdateUsers,
  surveyStaff,
  onUpdateSurveyStaff,
  drawingStaff,
  onUpdateDrawingStaff
}: SettingsProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedPwaText, setCopiedPwaText] = useState(false);

  // Management Form states
  const [newSurveyorName, setNewSurveyorName] = useState('');
  const [newDrawerName, setNewDrawerName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'SURVEYOR' | 'DRAWER'>('SURVEYOR');
  const [newUserEmployeeName, setNewUserEmployeeName] = useState('');

  // Add staff trigger handlers
  const handleAddSurveyor = () => {
    const trimmed = newSurveyorName.trim();
    if (!trimmed) return;
    if (surveyStaff.includes(trimmed)) {
      alert("Cán bộ này đã tồn tại trong danh sách!");
      return;
    }
    onUpdateSurveyStaff([...surveyStaff, trimmed]);
    setNewSurveyorName('');
  };

  const handleDeleteSurveyor = (name: string) => {
    if (surveyStaff.length <= 1) {
      alert("Phải giữ lại ít nhất một cán bộ đo để hệ thống hoạt động ổn định!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa cán bộ đo: ${name}?`)) {
      onUpdateSurveyStaff(surveyStaff.filter(s => s !== name));
    }
  };

  const handleAddDrawer = () => {
    const trimmed = newDrawerName.trim();
    if (!trimmed) return;
    if (drawingStaff.includes(trimmed)) {
      alert("Nhân viên vẽ này đã tồn tại trong danh sách!");
      return;
    }
    onUpdateDrawingStaff([...drawingStaff, trimmed]);
    setNewDrawerName('');
  };

  const handleDeleteDrawer = (name: string) => {
    if (drawingStaff.length <= 1) {
      alert("Phải giữ lại ít nhất một nhân viên vẽ vẽ sơ đồ!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên vẽ: ${name}?`)) {
      onUpdateDrawingStaff(drawingStaff.filter(d => d !== name));
    }
  };

  const handleAddUser = () => {
    const username = newUserUsername.trim().toLowerCase();
    const displayName = newUserDisplayName.trim();
    const employeeName = newUserEmployeeName || (newUserRole === 'DRAWER' ? drawingStaff[0] : (newUserRole === 'ADMIN' ? 'Hệ thống' : surveyStaff[0]));

    if (!username || !displayName) {
      alert("Vui lòng điền đầy đủ Tên đăng nhập và Tên hiển thị!");
      return;
    }

    if (users.some(u => u.username === username || u.id === username)) {
      alert("Tên đăng nhập này đã được sử dụng!");
      return;
    }

    const newUser: UserProfile = {
      id: username,
      username,
      displayName,
      role: newUserRole,
      employeeName
    };

    onUpdateUsers([...users, newUser]);
    setNewUserUsername('');
    setNewUserDisplayName('');
    alert(`Đã khởi tạo phân quyền tài khoản thành viên: ${displayName} thành công!`);
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'admin') {
      alert("Tài khoản quản trị cốt lõi (Admin) không thể xóa!");
      return;
    }
    if (currentUser.id === id) {
      alert("Bạn đang đăng nhập bằng tài khoản này! Hãy đổi sang tài khoản khác trước khi xóa.");
      return;
    }
    if (confirm("Xác nhận xóa tài khoản phân quyền này khỏi hệ thống?")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  // Trigger JSON download for manual backup file
  const handleDownloadBackupFile = () => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      dataLength: tasks.length,
      tasks: tasks
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sao-Luu-He-Thong-Do-Dac-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload/import backup JSON
  const handleUploadBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.tasks)) {
          onRestoreBackup(parsed.tasks);
          alert(`Đã khôi phục dữ liệu thành công! Nhập được ${parsed.tasks.length} hồ sơ từ tệp lưu trữ.`);
        } else {
          alert("Lỗi: Định dạng tệp sao lưu không đúng quy chuẩn (Không tìm thấy trường 'tasks' hợp lệ).");
        }
      } catch (err) {
        alert("Lỗi: Không thể phân tích tệp JSON. Vui lòng kiểm tra lại tính hợp lệ.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ''; // clear input
  };

  const copyPwaInstruction = () => {
    setCopiedPwaText(true);
    setTimeout(() => setCopiedPwaText(false), 2000);
  };

  return (
    <div id="settings-section" className="space-y-6">
      
      {/* 1. User Roles & Simulation (Hệ thống phân quyền) */}
      <div id="role-auth-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Mô phỏng Phân Quyền Người Dùng 🔑</h3>
            <p className="text-xs text-slate-400">Chọn tài khoản nhân viên để trải nghiệm hệ thống phân quyền thực tế</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {users.map((user) => {
            const isSelected = currentUser.id === user.id;
            return (
              <div 
                key={user.id}
                id={`user-selector-${user.id}`}
                onClick={() => onUserChange(user)}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer flex justify-between items-start active:scale-98 ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">{user.displayName}</p>
                  <p className="text-[10px] text-slate-400">Vai trò: <span className="font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase text-[9px]">{user.role}</span></p>
                  
                  <ul className="text-[10px] text-slate-500 space-y-0.5 pt-1 list-disc list-inside">
                    {user.role === 'ADMIN' && (
                      <>
                        <li>Toàn quyền truy cập hồ sơ</li>
                        <li>Được thêm/xóa/sửa, sao lưu khóa</li>
                      </>
                    )}
                    {user.role === 'SURVEYOR' && (
                      <>
                        <li>Chỉ thấy hồ sơ của {user.employeeName}</li>
                        <li>Được update nhật ký trạm đo</li>
                      </>
                    )}
                    {user.role === 'DRAWER' && (
                      <>
                        <li>Chỉ thấy hồ sơ vẽ của mình</li>
                        <li>Cập nhật tiến độ hoàn thiện CAD</li>
                      </>
                    )}
                  </ul>
                </div>
                {isSelected && (
                  <span className="p-1 bg-indigo-600 text-white rounded-full">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Staff & User Profile Management (Add New Users, Surveyor, Drawer) */}
      <div id="staff-and-accounts-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Quản Lý Danh Sách Cán Bộ & Tài Khoản Phân Quyền 👥</h3>
            <p className="text-xs text-slate-400">Thay đổi cán bộ đo, nhân viên vẽ CAD và thêm quyền thành viên truy cập</p>
          </div>
        </div>

        {/* Staff roster section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Surveyor management */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Cán bộ đo đạc thực địa ({surveyStaff.length})</h4>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Nhập tên cán bộ đo mới..."
                value={newSurveyorName}
                onChange={e => setNewSurveyorName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 px-3 py-1.5 text-xs rounded-xl outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleAddSurveyor}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center shrink-0 cursor-pointer active:scale-95 transition"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" /> Thêm
              </button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {surveyStaff.map(name => (
                <div key={name} className="flex justify-between items-center px-3 py-2 bg-white border border-slate-50 rounded-xl hover:bg-slate-50 transition">
                  <span className="text-xs font-medium text-slate-700">{name}</span>
                  <button 
                    onClick={() => handleDeleteSurveyor(name)}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition cursor-pointer"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Drawer management */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-100 rounded-2xl">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Cán bộ/Nhân viên vẽ CAD ({drawingStaff.length})</h4>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Nhập tên nhân viên vẽ mới..."
                value={newDrawerName}
                onChange={e => setNewDrawerName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 px-3 py-1.5 text-xs rounded-xl outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleAddDrawer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center shrink-0 cursor-pointer active:scale-95 transition"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" /> Thêm
              </button>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {drawingStaff.map(name => (
                <div key={name} className="flex justify-between items-center px-3 py-2 bg-white border border-slate-50 rounded-xl hover:bg-slate-50 transition">
                  <span className="text-xs font-medium text-slate-700">{name}</span>
                  <button 
                    onClick={() => handleDeleteDrawer(name)}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition cursor-pointer"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom role profile creators */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-display">Tạo mới phân quyền & tài khoản người dùng</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50/40 p-4 border border-slate-100 rounded-2xl">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Tên Đăng Nhập (Username)</label>
              <input 
                type="text"
                placeholder="ví dụ: hieu_do"
                value={newUserUsername}
                onChange={e => setNewUserUsername(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-indigo-500"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Tên Hiển Thị</label>
              <input 
                type="text"
                placeholder="ví dụ: Lê Minh Hiếu (Đo)"
                value={newUserDisplayName}
                onChange={e => setNewUserDisplayName(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1 col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Vai Trò Hệ Thống</label>
              <select 
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value as any)}
                className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-indigo-500 font-bold"
              >
                <option value="SURVEYOR">Cán bộ đo thực địa (SURVEYOR)</option>
                <option value="DRAWER">Nhân viên kỹ thuật CAD (DRAWER)</option>
                <option value="ADMIN">Quản Trị Viên cao cấp (ADMIN)</option>
              </select>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="block text-[10px] font-bold text-slate-500 uppercase md:mb-1">Tên Nhân Viên Gắn Liền</label>
              <select
                value={newUserEmployeeName}
                onChange={e => setNewUserEmployeeName(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Hệ thống">Hệ thống (Mặc định)</option>
                {newUserRole === 'DRAWER' ? (
                  drawingStaff.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                ) : (
                  surveyStaff.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="col-span-1 md:col-span-4 flex justify-end pt-2">
              <button 
                onClick={handleAddUser}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition active:scale-95 shadow-sm"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                <span>Khởi tạo tài khoản thành viên</span>
              </button>
            </div>
          </div>

          {/* Account Lists manager delete columns */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Danh sách tài khoản hiện có ({users.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/60 transition">
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">{u.displayName}</p>
                    <p className="text-[10px] text-slate-400">Username: <strong className="font-mono text-slate-600">{u.username}</strong> | Sổ nhân viên: <strong>{u.employeeName}</strong></p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">{u.role}</span>
                    {u.id !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Auto-backup Panel (Sao lưu tự động & Thủ công) */}
      <div id="data-backup-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Sao Lưu Dữ Liệu Tự Động & Thủ Công 💾</h3>
            <p className="text-xs text-slate-400">Đơn vị đang thực hiện sao lưu offline vào hệ thống Local Storage</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800">
          <AlertCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Chế độ tự động sao lưu đang KÍCH HOẠT!</p>
            <p>Mỗi khi bạn thêm mới, sửa đổi hay lưu trữ ghi chú hồ sơ, máy chủ cục bộ sẽ tự động đồng bộ hóa. Dữ liệu sẽ không bị mất ngay cả khi bạn đóng trình duyệt điện thoại.</p>
          </div>
        </div>

        {/* Manual control block */}
        <div id="backup-actions" className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <button 
            id="btn-manual-backup"
            onClick={onManualBackup}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-98"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Sao lưu điểm phục hồi tức thì</span>
          </button>

          <button 
            id="btn-download-backup-file"
            onClick={handleDownloadBackupFile}
            className="flex-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-98"
          >
            <Download className="h-4 w-4" />
            <span>Tải tệp JSON dự phòng máy tính</span>
          </button>

          <button 
            id="btn-trigger-upload-backup"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-98"
          >
            <Upload className="h-4 w-4" />
            <span>Phục hồi từ File sao lưu</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUploadBackupFile} 
            accept=".json" 
            className="hidden" 
          />
        </div>

        {/* Backup recovery list logs */}
        <div id="backup-history-box" className="pt-2">
          <p className="text-xs font-bold text-slate-600 mb-2">Nhật ký các điểm sao lưu tự động ({backupHistory.length}):</p>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-xs text-slate-500">
            {backupHistory.map((h, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="font-mono text-[10px] text-slate-400">{h.timestamp}</span>
                <span className="font-semibold text-slate-600">Hệ thống auto-save ({h.count} hồ sơ)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Thành công</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dangerous action reset database */}
        {currentUser.role === 'ADMIN' && (
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-700">Khởi tạo lại ứng dụng</p>
              <p className="text-[10px] text-slate-400">Trả cơ sở dữ liệu về 20 tệp mẫu ban đầu của Google Sheets</p>
            </div>
            <button 
              id="btn-reset-db"
              onClick={() => {
                if (confirm("Cảnh báo: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện thời và đưa về tệp mẫu gốc. Bạn có chắc chắn muốn thực hiện?")) {
                  onResetDatabase();
                }
              }}
              className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition active:scale-95"
            >
              Reset dữ liệu mẫu
            </button>
          </div>
        )}
      </div>

      {/* 3. Push notifications Simulation Toggle (Thông báo đẩy & Chuông báo) */}
      <div id="push-notifications-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Thông Báo Đẩy Nhắc Nhở Trễ Hạn 🔔</h3>
            <p className="text-xs text-slate-400">Cấu hình chuông báo và quyền thông báo ứng dụng trên màn hình</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-slate-700">Trạng thái Nhắc nhở Đẩy (Push Notification)</p>
            <p className="text-[10px] text-slate-400">Tự động phát âm thanh và hiển thị hộp thư cảnh báo khi hồ sơ sắp sát hạn</p>
          </div>
          <button
            id="toggle-notifications-btn"
            onClick={onToggleNotifications}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
              notificationsEnabled 
                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs' 
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {notificationsEnabled ? 'Đang kích hoạt' : 'Đang tạm tắt'}
          </button>
        </div>

        <p className="text-xs text-slate-500 italic pl-1">
          * Ghi chú: Sử dụng API thông báo gốc (Web Push Notification). Nếu được bật, ứng dụng sẽ gửi tin nhắn nhắc nhở trực thực lên màn hình điện thoại Android/Máy tính khi phát hiện có hồ sơ bị quá hạn ngày đo đạc.
        </p>
      </div>

      {/* 4. Android PWA Install Guide (Hướng dẫn cài đặt Android) */}
      <div id="pwa-install-card" className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">Cài Đặt Điện Thoại Android (Dễ dàng như App) 📱</h3>
            <p className="text-xs text-slate-400">Biến ứng dụng web thành ứng dụng Android thực địa tiện lợi</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-600">
          <p>Nhân viên văn phòng và cán bộ thực địa hoàn toàn có thể lưu ứng dụng này trực tiếp về màn hình nền điện thoại Samsung, Oppo, Xiaomi mà không cần tải từ CH Play:</p>
          <ol className="list-decimal list-inside space-y-1.5 font-medium">
            <li>Mở trình duyệt <strong>Google Chrome</strong> trên điện thoại Android của bạn.</li>
            <li>Truy cập vào liên kết hệ thống này.</li>
            <li>Nhấn vào biểu tượng <strong>Ba chấm đứng</strong> ở góc trên bên phải màn hình.</li>
            <li>Chọn <strong>"Thêm vào Màn hình chính"</strong> (hoặc "Cài đặt ứng dụng").</li>
            <li>Hệ thống Android sẽ tự động tạo biểu tượng ứng dụng lướt sóng mượt mà ngoài màn hình!</li>
          </ol>

          <div id="pwa-copy-box" className="flex items-center space-x-2 pt-1">
            <input 
              id="pwa-link-input"
              type="text" 
              readOnly 
              value={window.location.href}
              className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] font-mono select-all outline-none" 
            />
            <button 
              id="copy-link-btn"
              onClick={copyPwaInstruction}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer"
            >
              {copiedPwaText ? 'Đã sao chép!' : 'Sao chép link'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
