import React, { useState, useEffect } from 'react';
import { Task, UserProfile, TaskStatus } from './types';
import { INITIAL_TASKS, MOCK_USERS, SURVEY_STAFF, DRAWING_STAFF } from './data';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { 
  Compass, FileSpreadsheet, BarChart3, Settings2, 
  Map, ShieldAlert, AlertTriangle, X, Play, BellRing, Sparkles 
} from 'lucide-react';

export default function App() {
  // Current local time simulation base YYYY-MM-DD
  const currentDateString = "2026-05-27";

  // State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_USERS;
  });

  const [surveyStaff, setSurveyStaff] = useState<string[]>(() => {
    const saved = localStorage.getItem('survey_staff_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SURVEY_STAFF;
  });

  const [drawingStaff, setDrawingStaff] = useState<string[]>(() => {
    const saved = localStorage.getItem('drawing_staff_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DRAWING_STAFF;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('users_db');
    let loadedUsers = MOCK_USERS;
    if (saved) {
      try { loadedUsers = JSON.parse(saved); } catch (e) {}
    }
    return loadedUsers[0] || MOCK_USERS[0];
  });

  // Persisting update helpers
  const handleUpdateUsers = (newUsers: UserProfile[]) => {
    setUsers(newUsers);
    localStorage.setItem('users_db', JSON.stringify(newUsers));
  };

  const handleUpdateSurveyStaff = (newStaff: string[]) => {
    setSurveyStaff(newStaff);
    localStorage.setItem('survey_staff_db', JSON.stringify(newStaff));
  };

  const handleUpdateDrawingStaff = (newStaff: string[]) => {
    setDrawingStaff(newStaff);
    localStorage.setItem('drawing_staff_db', JSON.stringify(newStaff));
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'analytics' | 'settings'>('dashboard');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [backupHistory, setBackupHistory] = useState<Array<{ timestamp: string; count: number; filename: string }>>([]);

  // In-app alert state
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  // Initialize App state from LocalStorage
  useEffect(() => {
    // 1. Tasks Database loading
    const storedTasksStr = localStorage.getItem('tasks_db');
    let loadedTasks: Task[] = [];
    if (storedTasksStr) {
      try {
        loadedTasks = JSON.parse(storedTasksStr);
      } catch (err) {
        loadedTasks = INITIAL_TASKS;
      }
    } else {
      loadedTasks = INITIAL_TASKS;
      localStorage.setItem('tasks_db', JSON.stringify(INITIAL_TASKS));
    }
    setTasks(loadedTasks);

    // 2. Load Notifications Preference
    const storedNotif = localStorage.getItem('notifications_enabled');
    if (storedNotif === 'true') {
      setNotificationsEnabled(true);
    }

    // 3. Load Backup History logs
    const storedBackupHistory = localStorage.getItem('backup_history');
    if (storedBackupHistory) {
      try {
        setBackupHistory(JSON.parse(storedBackupHistory));
      } catch (e) {}
    } else {
      const initialHistory = [{
        timestamp: new Date().toLocaleString('vi-VN'),
        count: loadedTasks.length,
        filename: "HeThong-AutoSeed"
      }];
      setBackupHistory(initialHistory);
      localStorage.setItem('backup_history', JSON.stringify(initialHistory));
    }

    // 4. Check for overdue counts on app load and fire Push Notifications!
    const overdueCount = loadedTasks.filter(t => {
      if (t.status === 'HOAN_THANH' || t.status === 'HUY') return false;
      return t.deadlineDate < currentDateString;
    }).length;

    if (overdueCount > 0) {
      setShowWelcomeAlert(true);
    }
  }, []);

  // Save tasks state helper (Automatic backup trigger!)
  const saveTasksState = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('tasks_db', JSON.stringify(newTasks));

    // Register active automatic point restore
    const timestamp = new Date().toLocaleString('vi-VN');
    const autoBackupLog = {
      timestamp,
      count: newTasks.length,
      filename: "HeThong-TuDong"
    };

    const newBackupHistory = [autoBackupLog, ...backupHistory.slice(0, 9)];
    setBackupHistory(newBackupHistory);
    localStorage.setItem('backup_history', JSON.stringify(newBackupHistory));

    // Simulated Web Push Notification trigger if enabled and overdue was edited/changed
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("Hệ thống Đo đạc & Vẽ", {
          body: `Sao lưu tự động thành công lúc ${timestamp}. Hệ thống đang hoàn thiện và bảo vệ an toàn ${newTasks.length} hồ sơ!`,
          icon: "/favicon.ico"
        });
      } catch (e) {
        console.log("Could not trigger native push notification.");
      }
    }
  };

  // Turn notifications on/off
  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      // Turn on: request native browser notification permissions
      if ('Notification' in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            setNotificationsEnabled(true);
            localStorage.setItem('notifications_enabled', 'true');
            // Trigger confirmation notification
            new Notification("Hệ thống Đo đạc & Vẽ", {
              body: "Thông báo đẩy nhắc nhở công việc trễ hạn đã sẵn sàng hoạt động!",
              icon: "/favicon.ico"
            });
          } else {
            alert("Vui lòng cấp quyền thông báo đẩy trên trình duyệt của bạn để nhận nhắc nhở đúng giờ!");
          }
        });
      } else {
        // Fallback or Alert
        setNotificationsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
        alert("Trình duyệt này không hỗ trợ Web Notification API, nhưng hệ thống thông báo đẩy trực quan nội bộ vẫn sẽ hoạt động.");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications_enabled', 'false');
    }
  };

  // Manual point update trigger
  const handleManualBackup = () => {
    const timestamp = new Date().toLocaleString('vi-VN');
    const newBackupLog = {
      timestamp,
      count: tasks.length,
      filename: `DiemSaoLuu-ThuCong-${tasks.length}HS`
    };
    const newHistory = [newBackupLog, ...backupHistory];
    setBackupHistory(newHistory);
    localStorage.setItem('backup_history', JSON.stringify(newHistory));
    alert(`Đã hoàn tất sao lưu thủ công mốc dữ liệu với ${tasks.length} hồ sợ đo vẽ!`);
  };

  // Reset database to templates CSV values
  const handleResetDatabase = () => {
    saveTasksState(INITIAL_TASKS);
    alert("Dữ liệu của bạn đã được khôi phục về file mẫu mặc định ban đầu!");
  };

  // Create or Update task handler
  const handleSaveTask = (savedTask: Task) => {
    let updatedTasks: Task[] = [];
    const taskIndex = tasks.findIndex(t => t.id === savedTask.id);

    if (taskIndex > -1) {
      // Update
      updatedTasks = [...tasks];
      updatedTasks[taskIndex] = savedTask;
    } else {
      // Add
      updatedTasks = [savedTask, ...tasks];
    }

    saveTasksState(updatedTasks);
    setIsFormOpen(false);
    setEditingTask(null);

    // If task is save and is marked COMPLETED on time or overdue
    const isOverdue = savedTask.status !== 'HOAN_THANH' && savedTask.status !== 'HUY' && savedTask.deadlineDate < currentDateString;
    if (isOverdue && notificationsEnabled) {
      try {
        new Notification("Nhắc nhở công việc trễ hạn", {
          body: `Cảnh báo: Hồ sơ ${savedTask.id} của khách hàng ${savedTask.customerName} đang bị trễ hạn hơn ngày ${savedTask.deadlineDate}!`,
          icon: "/favicon.ico"
        });
      } catch (err) {}
    }
  };

  // Delete task completely
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveTasksState(updatedTasks);
  };

  // Navigate directly with pre-filled filters from dashboard
  const handleNavigateToTasksWithFilter = (filters?: { status?: TaskStatus; search?: string; onlyOverdue?: boolean }) => {
    setActiveTab('tasks');
  };

  // Get active stats counts
  const overdueCount = tasks.filter(t => {
    if (t.status === 'HOAN_THANH' || t.status === 'HUY') return false;
    return t.deadlineDate < currentDateString;
  }).length;

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased">
      
      {/* 1. Header Navigation Bar */}
      <header id="app-header" className="bg-slate-900 text-white shadow-md sticky top-0 z-40 select-none px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand/Title */}
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Map className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold tracking-tight">Hệ Thống Quản Lý Đo Đạc Địa Chính</h1>
              <p className="text-[10px] text-slate-400">Văn phòng Kỹ thuật Bản đồ Đo đạc</p>
            </div>
          </div>

          {/* Quick Indicator Swapper & Alarm Bell */}
          <div className="flex items-center space-x-3 text-xs">
            
            {/* Quick Overdue Alert Bell */}
            <div className="relative cursor-pointer" onClick={() => setShowOverdueModal(true)}>
              <span className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                overdueCount > 0 ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
                <BellRing className={`h-4.5 w-4.5 ${overdueCount > 0 ? 'animate-bounce' : ''}`} />
              </span>
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-slate-900 shadow-sm animate-pulse">
                  {overdueCount}
                </span>
              )}
            </div>

            {/* Quick Profile display & User swapper dropdown */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl select-none">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <p className="font-semibold text-[11px] text-slate-200">
                {currentUser.displayName} <span className="text-[10px] text-slate-400 font-normal uppercase">({currentUser.role})</span>
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* Quick Switch Profiles banner on top of Content */}
      <div id="quick-role-banner" className="bg-slate-900 text-slate-300 px-4 py-2 text-[11px] md:text-xs border-t border-slate-800 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/30 font-bold px-2 py-0.5 rounded uppercase text-[9px]">Phân quyền Đang bật:</span>
            <p>Bạn đang đăng nhập với vai trò <span className="text-white font-bold underline">{currentUser.displayName}</span></p>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <p className="hidden md:inline">Ngày kiểm toán hệ thống: <span className="font-semibold text-slate-200">{currentDateString}</span></p>
            <button 
              id="switch-to-settings-tab"
              onClick={() => setActiveTab('settings')}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
            >
              Đổi vai trò phân quyền
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Container with Tab View */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 pb-24 md:pb-8 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Solid Sidebar Navigator (For larger screens) */}
        <aside id="desktop-sidebar-nav" className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 text-slate-300 p-5 rounded-3xl border border-slate-800 shadow-xl justify-between">
          <div className="space-y-1.5 w-full">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3.5">Menu chức năng</p>
            
            <button 
              id="desktop-nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/45'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Bảng Điều Khiển</span>
            </button>

            <button 
              id="desktop-nav-tasks"
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center space-x-3 px-4.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/45'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Danh Sách Hồ Sơ</span>
              {overdueCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {overdueCount} Trễ
                </span>
              )}
            </button>

            <button 
              id="desktop-nav-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-4.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/45'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Thống Kê Nhật Ký</span>
            </button>

            <button 
              id="desktop-nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/45'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Settings2 className="h-4 w-4" />
              <span>Phân Quyền & Sao Lưu</span>
            </button>
          </div>

          {/* Quick performance widget */}
          <div id="sidebar-info-widget" className="bg-slate-800/60 border border-slate-800 p-4.5 rounded-2xl space-y-2.5 mt-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-300">Trạng thái hệ thống</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Sao lưu ngoại tuyến: tự động hoạt động trên trình duyệt.
            </p>
          </div>
        </aside>

        {/* Right Side: Tab panel contents panel */}
        <section id="tab-content-panel" className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard 
              tasks={tasks} 
              onNavigateToTasks={(filters) => {
                setActiveTab('tasks');
              }}
              currentDateString={currentDateString}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskList 
              tasks={tasks}
              currentUser={currentUser}
              onAddNewTask={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsFormOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              currentDateString={currentDateString}
              surveyStaff={surveyStaff}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics tasks={tasks} surveyStaff={surveyStaff} />
          )}

          {activeTab === 'settings' && (
            <Settings 
              currentUser={currentUser}
              onUserChange={setCurrentUser}
              tasks={tasks}
              onRestoreBackup={(restoredTasks) => {
                saveTasksState(restoredTasks);
              }}
              onResetDatabase={handleResetDatabase}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleToggleNotifications}
              backupHistory={backupHistory}
              onManualBackup={handleManualBackup}
              users={users}
              onUpdateUsers={handleUpdateUsers}
              surveyStaff={surveyStaff}
              onUpdateSurveyStaff={handleUpdateSurveyStaff}
              drawingStaff={drawingStaff}
              onUpdateDrawingStaff={handleUpdateDrawingStaff}
            />
          )}
        </section>

      </main>

      {/* 3. Bottom Tabs Navigation Bar (Hidden on desktop, perfect navigation flow on Android / iPhone) */}
      <nav id="mobile-bottom-tabs" className="md:hidden fixed bottom-1 left-2 right-2 bg-slate-900/95 backdrop-blur-md text-slate-400 border border-slate-800 py-2.5 rounded-2xl flex items-center justify-around z-40 select-none shadow-xl">
        
        <button 
          id="mobile-nav-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-1 transition text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-white font-extrabold scale-102' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Bảng tin</span>
        </button>

        <button 
          id="mobile-nav-tasks"
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center space-y-1 transition text-[10px] font-bold relative ${
            activeTab === 'tasks' ? 'text-white font-extrabold scale-102' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span>Hồ sơ</span>
          {overdueCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {overdueCount}
            </span>
          )}
        </button>

        <button 
          id="mobile-nav-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center space-y-1 transition text-[10px] font-bold ${
            activeTab === 'analytics' ? 'text-white font-extrabold scale-102' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Thống kê</span>
        </button>

        <button 
          id="mobile-nav-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center space-y-1 transition text-[10px] font-bold ${
            activeTab === 'settings' ? 'text-white font-extrabold scale-102' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Settings2 className="h-5 w-5" />
          <span>Phân quyền</span>
        </button>

      </nav>

      {/* 4. Overdue Details Notification Box / Modal */}
      {showOverdueModal && (
        <div id="overdue-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div id="overdue-modal" className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-rose-600 text-white p-4 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 animate-bounce" />
                <h3 className="font-bold text-sm md:text-base">Hồ Sơ Đang Quá Hạn Phục Hồi!</h3>
              </div>
              <button 
                id="close-overdue-modal"
                onClick={() => setShowOverdueModal(false)}
                className="text-white/80 hover:text-white hover:bg-rose-700 p-1.5 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 max-h-96 overflow-y-auto">
              <p className="text-xs text-slate-500">
                Các hồ sơ dưới đây đang ở trạng thái đo đạc thô hoặc làm CAD dang dở nhưng đã quá ngày hạn cam kết hoàn thành đối chiếu:
              </p>

              {tasks.filter(t => t.status !== 'HOAN_THANH' && t.status !== 'HUY' && t.deadlineDate < currentDateString).map((task) => (
                <div 
                  key={task.id}
                  onClick={() => {
                    setEditingTask(task);
                    setIsFormOpen(true);
                    setShowOverdueModal(false);
                  }}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition duration-150 cursor-pointer text-left space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-extrabold">{task.id}</span>
                    <span className="text-slate-400 font-semibold">{task.deadlineDate}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{task.customerName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{task.address}</p>
                  <p className="text-[10px] text-slate-400 font-bold">Cán bộ phụ trách: <span className="text-slate-700">{task.surveyor}</span></p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                id="btn-close-overdue-modal-bottom"
                onClick={() => setShowOverdueModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Đã kiểm soát được
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Toast welcome banner informing overdue elements on launch */}
      {showWelcomeAlert && (
        <div id="toast-welcome-overdue" className="fixed bottom-18 md:bottom-6 right-4 left-4 md:left-auto md:w-80 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-50 flex items-start space-x-3.5 animate-slide-in">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-full animate-pulse mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Cảnh Báo Ngày Làm Việc</h4>
              <button 
                id="close-welcome-toast"
                onClick={() => setShowWelcomeAlert(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Chào bạn! Hệ thống phát hiện <strong className="text-rose-400">{overdueCount} hồ sơ đo đạc</strong> đang bị quá hạn cam kết bàn giao. Hãy bấm vào nút thông báo để kiểm tra danh mục.
            </p>
            <div className="pt-1">
              <button 
                id="btn-view-alert-toast"
                onClick={() => {
                  setShowOverdueModal(true);
                  setShowWelcomeAlert(false);
                }}
                className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg"
              >
                Kiểm tra ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Embedded Fullscreen Slide Form Component */}
      {isFormOpen && (
        <TaskForm 
          task={editingTask}
          currentUser={currentUser}
          onSave={handleSaveTask}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          currentDateString={currentDateString}
          surveyStaff={surveyStaff}
          drawingStaff={drawingStaff}
        />
      )}

    </div>
  );
}
