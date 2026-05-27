export type TaskStatus = 'CHUA_DO' | 'DANG_DO' | 'VE_BAN_VE' | 'HOAN_THANH' | 'HUY' | 'BB_HC_L1';

export interface NoteLog {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Task {
  id: string; // Mã hồ sơ
  contractId: string; // Số hợp đồng
  customerName: string; // Tên khách hàng
  customerPhone: string; // Số điện thoại
  address: string; // Địa chỉ đất/nhà thanh tra đo đạc
  surveyor: string; // Cáp bộ đo
  drawer: string; // Nhân viên vẽ
  status: TaskStatus; // Trạng thái
  receivedDate: string; // Ngày nhận hồ sơ (YYYY-MM-DD)
  deadlineDate: string; // Hạn đo đạc hoàn thành (YYYY-MM-DD)
  completedDate: string | null; // Ngày hoàn thành có kết quả (YYYY-MM-DD)
  notes: string; // Ghi chú chung
  notesHistory: NoteLog[]; // Nhật ký công việc nâng cao
  contractValue: number; // Giá trị hợp đồng (VND)
}

export type UserRole = 'ADMIN' | 'SURVEYOR' | 'DRAWER';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  employeeName: string; // Matches staff list in sheet, like "Lê Tiến Thành"
}

export interface AppState {
  tasks: Task[];
  currentUser: UserProfile;
  notificationsEnabled: boolean;
  backupHistory: Array<{ timestamp: string; count: number; filename: string }>;
}
