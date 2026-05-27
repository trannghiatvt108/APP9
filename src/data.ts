import { Task, UserProfile } from './types';

export const SURVEY_STAFF = [
  "Lê Tiến Thành",
  "Văn Văn Kha",
  "Trần Chí Công",
  "Lê Quốc Thiệu",
  "Nguyễn Trung Tính",
  "Trần Trọng Nghĩa",
  "Hứa Trung Hậu",
  "Kim Hoàng Phước",
  "Phạm Đình Tân",
  "Phạm Minh Hiện"
];

export const DRAWING_STAFF = [
  "Nguyễn Hoài Phong",
  "Trần Trọng Nghĩa",
  "Hứa Trung Hậu",
  "Kim Hoàng Phước",
  "Phạm Đình Tân"
];

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  CHUA_DO: { label: "Chưa đo", color: "text-slate-600", bg: "bg-slate-100 border-slate-200" },
  DANG_DO: { label: "Đang đo đạc", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  VE_BAN_VE: { label: "Đang vẽ bản vẽ", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  HOAN_THANH: { label: "Đã hoàn thành", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  HUY: { label: "Đã hủy hồ sơ", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  BB_HC_L1: { label: "Biên bản L1 (HC)", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" }
};

export const MOCK_USERS: UserProfile[] = [
  { id: 'admin', username: 'admin', displayName: 'Quản lý (Admin)', role: 'ADMIN', employeeName: 'Hệ thống' },
  { id: 'thanh', username: 'thanh', displayName: 'Lê Tiến Thành (Đo)', role: 'SURVEYOR', employeeName: 'Lê Tiến Thành' },
  { id: 'kha', username: 'kha', displayName: 'Văn Văn Kha (Đo)', role: 'SURVEYOR', employeeName: 'Văn Văn Kha' },
  { id: 'cong', username: 'cong', displayName: 'Trần Chí Công (Đo)', role: 'SURVEYOR', employeeName: 'Trần Chí Công' },
  { id: 'thieu', username: 'thieu', displayName: 'Lê Quốc Thiệu (Đo)', role: 'SURVEYOR', employeeName: 'Lê Quốc Thiệu' },
  { id: 'phuoc', username: 'phuoc_ve', displayName: 'Kim Hoàng Phước (Vẽ)', role: 'DRAWER', employeeName: 'Kim Hoàng Phước' }
];

// Seed initial tasks matching the overall proportions of the sheet
export const INITIAL_TASKS: Task[] = [
  // Lê Tiến Thành
  {
    id: "HS-2026-001",
    contractId: "HĐ-TT-892",
    customerName: "Nguyễn Văn Đạt",
    customerPhone: "0901234567",
    address: "124/5 Đường Cách Mạng Tháng 8, Phường 10, Quận 3, TP.HCM",
    surveyor: "Lê Tiến Thành",
    drawer: "Nguyễn Hoài Phong",
    status: "HOAN_THANH",
    receivedDate: "2026-04-01",
    deadlineDate: "2026-04-10",
    completedDate: "2026-04-08",
    contractValue: 5500000,
    notes: "Đo đạc hiện trạng nhà cấp 4, hoàn thành xuất sắc bản vẽ đống mốc ranh lộ giới.",
    notesHistory: [
      { id: "1", date: "2026-04-02", author: "Lê Tiến Thành", text: "Đã tiến hành đo thực địa, ranh mốc ổn định không tranh chấp." },
      { id: "2", date: "2026-04-08", author: "Nguyễn Hoài Phong", text: "Hoàn thiện bản vẽ kỹ thuật, gửi khách hàng ký duyệt." }
    ]
  },
  {
    id: "HS-2026-002",
    contractId: "HĐ-TT-911",
    customerName: "Trần Thị Hồng",
    customerPhone: "0918765432",
    address: "B2-14 Khu đô thị Sala, Quận 2, TP.HCM",
    surveyor: "Lê Tiến Thành",
    drawer: "Trần Trọng Nghĩa",
    status: "HOAN_THANH",
    receivedDate: "2026-04-15",
    deadlineDate: "2026-04-20",
    completedDate: "2026-04-19",
    contractValue: 12000000,
    notes: "Đo đạc phục vụ chuyển mục đích sử dụng đất diện tích 450m2.",
    notesHistory: []
  },
  {
    id: "HS-2026-003",
    contractId: "HĐ-TT-940",
    customerName: "Lê Minh Trí",
    customerPhone: "0987332211",
    address: "Số 45 Đường Hoàng Diệu, Quận Phú Nhuận, TP.HCM",
    surveyor: "Lê Tiến Thành",
    drawer: "Hứa Trung Hậu",
    status: "DANG_DO",
    receivedDate: "2026-05-20",
    deadlineDate: "2026-05-30",
    completedDate: null,
    contractValue: 4800000,
    notes: "Đo đạc tranh chấp lối đi chung với hộ liền kề.",
    notesHistory: [
      { id: "1", date: "2026-05-22", author: "Lê Tiến Thành", text: "Xung đột ranh giới mốc chưa rõ ràng, cần mời phường hòa giải trước khi đo đạc chi tiết." }
    ]
  },
  // Văn Văn Kha
  {
    id: "HS-2026-004",
    contractId: "HĐ-VK-102",
    customerName: "Hoàng Văn Nam",
    customerPhone: "0934556677",
    address: "710 Lũy Bán Bích, Phường Tân Thành, Quận Tân Phú, TP.HCM",
    surveyor: "Văn Văn Kha",
    drawer: "Kim Hoàng Phước",
    status: "HOAN_THANH",
    receivedDate: "2026-04-10",
    deadlineDate: "2026-04-18",
    completedDate: "2026-04-17",
    contractValue: 6200000,
    notes: "Đo đạc tách thửa đất 250m2.",
    notesHistory: []
  },
  {
    id: "HS-2026-005",
    contractId: "HĐ-VK-128",
    customerName: "Nguyễn Thị Phương",
    customerPhone: "0965112233",
    address: "Kiệt 12 Hẻm 45, Đường Thống Nhất, Gò Vấp, TP.HCM",
    surveyor: "Văn Văn Kha",
    drawer: "Phạm Đình Tân",
    status: "VE_BAN_VE",
    receivedDate: "2026-05-18",
    deadlineDate: "2026-05-28",
    completedDate: null,
    contractValue: 3500000,
    notes: "Đã đo đạc xong, bàn giao cho nhân viên vẽ Phong hoàn thiện sơ đồ.",
    notesHistory: [
      { id: "1", date: "2026-05-21", author: "Văn Văn Kha", text: "Trích xuất tệp CAD thô từ máy RTK, mốc tọa độ chính xác VN-2000." }
    ]
  },
  // Trần Chí Công
  {
    id: "HS-2026-006",
    contractId: "HĐ-CC-204",
    customerName: "Phạm Thanh Tùng",
    customerPhone: "0909887766",
    address: "Số 88 Song Hành, Thảo Điền, Quận 2, TP.HCM",
    surveyor: "Trần Chí Công",
    drawer: "Hứa Trung Hậu",
    status: "HOAN_THANH",
    receivedDate: "2026-04-05",
    deadlineDate: "2026-04-12",
    completedDate: "2026-04-11",
    contractValue: 15000000,
    notes: "Biệt thự cao cấp, yêu cầu độ chính xác cao để phục vụ thiết kế xây dựng.",
    notesHistory: []
  },
  {
    id: "HS-2026-007",
    contractId: "HĐ-CC-225",
    customerName: "Bùi Thị Mai",
    customerPhone: "0974559900",
    address: "15 Trương Công Định, Phường 14, Quận Tân Bình, TP.HCM",
    surveyor: "Trần Chí Công",
    drawer: "Nguyễn Hoài Phong",
    status: "HOAN_THANH",
    receivedDate: "2026-05-01",
    deadlineDate: "2026-05-10",
    completedDate: "2026-05-09",
    contractValue: 4000000,
    notes: "Yêu cầu đo gộp thửa.",
    notesHistory: []
  },
  {
    id: "HS-2026-008",
    contractId: "HĐ-CC-302",
    customerName: "Trương Quốc Huy",
    customerPhone: "0908112244",
    address: "Chung cư Phú Mỹ Hưng, Tòa MD5, Quận 7, TP.HCM",
    surveyor: "Trần Chí Công",
    drawer: "Trần Trọng Nghĩa",
    status: "BB_HC_L1",
    receivedDate: "2026-05-05",
    deadlineDate: "2026-05-14",
    completedDate: null,
    contractValue: 8000000,
    notes: "Hồ sơ đang bị vướng biên bản do sai lệch mốc với bản vẽ cũ năm 2012.",
    notesHistory: [
      { id: "1", date: "2026-05-10", author: "Trần Chí Công", text: "Ký mốc biên giới chưa đồng thuận giữa bên mua và bên bán." }
    ]
  },
  // Lê Quốc Thiệu
  {
    id: "HS-2026-009",
    contractId: "HĐ-QT-303",
    customerName: "Đỗ Minh Khang",
    customerPhone: "0921113355",
    address: "Ấp 3, Xã Bình Chánh, Huyện Bình Chánh, TP.HCM",
    surveyor: "Lê Quốc Thiệu",
    drawer: "Kim Hoàng Phước",
    status: "HOAN_THANH",
    receivedDate: "2026-04-02",
    deadlineDate: "2026-04-15",
    completedDate: "2026-04-14",
    contractValue: 9500000,
    notes: "Diện tích rộng 1.2 hố, đo đạc phục vụ phân lô đất nông nghiệp.",
    notesHistory: []
  },
  // Nguyễn Trung Tính
  {
    id: "HS-2026-010",
    contractId: "HĐ-TT-501",
    customerName: "Vũ Hoàng Hải",
    customerPhone: "0933445566",
    address: "Xã Thới Tam Thôn, Huyện Hóc Môn, TP.HCM",
    surveyor: "Nguyễn Trung Tính",
    drawer: "Phạm Đình Tân",
    status: "HOAN_THANH",
    receivedDate: "2026-04-18",
    deadlineDate: "2026-04-28",
    completedDate: "2026-04-27",
    contractValue: 7000000,
    notes: "Đo đạc cắm mốc ranh quy hoạch lộ giới.",
    notesHistory: []
  },
  {
    id: "HS-2026-011",
    contractId: "HĐ-TT-520",
    customerName: "Ngô Quốc Việt",
    customerPhone: "0944005511",
    address: "Số 9 Hoàng Diệu, Quận 4, TP.HCM",
    surveyor: "Nguyễn Trung Tính",
    drawer: "Kim Hoàng Phước",
    status: "HUY",
    receivedDate: "2026-05-02",
    deadlineDate: "2026-05-12",
    completedDate: null,
    contractValue: 3000000,
    notes: "Chủ đất xin hủy hợp đồng do thỏa thuận bán đất bất thành với người mua.",
    notesHistory: [
      { id: "1", date: "2026-05-05", author: "Nguyễn Trung Tính", text: "Khách gọi điện hủy lịch hẹn đo và xin rút tiền đặt cọc." }
    ]
  },
  // Trần Trọng Nghĩa
  {
    id: "HS-2026-012",
    contractId: "HĐ-TN-711",
    customerName: "Đặng Thị Vân",
    customerPhone: "0982233445",
    address: "220 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM",
    surveyor: "Trần Trọng Nghĩa",
    drawer: "Trần Trọng Nghĩa",
    status: "HOAN_THANH",
    receivedDate: "2026-04-20",
    deadlineDate: "2026-04-30",
    completedDate: "2026-04-28",
    contractValue: 5000000,
    notes: "Đo nhà chung cư thực tế đối chiếu chủ quyền hồng.",
    notesHistory: []
  },
  // Hứa Trung Hậu
  {
    id: "HS-2026-013",
    contractId: "HĐ-TH-822",
    customerName: "Lâm Thành Nam",
    customerPhone: "0912123123",
    address: "99 Phạm Thế Hiển, Phường 4, Quận 8, TP.HCM",
    surveyor: "Hứa Trung Hậu",
    drawer: "Hứa Trung Hậu",
    status: "HOAN_THANH",
    receivedDate: "2026-04-25",
    deadlineDate: "2026-05-05",
    completedDate: "2026-05-04",
    contractValue: 5600000,
    notes: "Đo đạc kiểm tra chỉ giới quy hoạch sông rạch lấn chiếm.",
    notesHistory: []
  },
  // Kim Hoàng Phước
  {
    id: "HS-2026-014",
    contractId: "HĐ-KP-920",
    customerName: "Hồ Văn Long",
    customerPhone: "0977223399",
    address: "Khu công nghiệp Vĩnh Lộc, Bình Tân, TP.HCM",
    surveyor: "Kim Hoàng Phước",
    drawer: "Kim Hoàng Phước",
    status: "HOAN_THANH",
    receivedDate: "2026-05-10",
    deadlineDate: "2026-05-20",
    completedDate: "2026-05-18",
    contractValue: 24000000,
    notes: "Đo hạ tầng kỹ thuật nhà xưởng 2500m2 bảo hiểm phòng cháy.",
    notesHistory: []
  },
  // Phạm Đình Tân
  {
    id: "HS-2026-015",
    contractId: "HĐ-PT-405",
    customerName: "Tạ Minh Châu",
    customerPhone: "0903322114",
    address: "Khu dân cư Trung Sơn, Bình Chánh, TP.HCM",
    surveyor: "Phạm Đình Tân",
    drawer: "Phạm Đình Tân",
    status: "HOAN_THANH",
    receivedDate: "2026-05-05",
    deadlineDate: "2026-05-15",
    completedDate: "2026-05-14",
    contractValue: 8800000,
    notes: "Tách thửa kết hợp tặng cho con cái quyền sử dụng đất.",
    notesHistory: []
  },
  // Phạm Minh Hiện
  {
    id: "HS-2026-016",
    contractId: "HĐ-MH-606",
    customerName: "Nguyễn Hoàng Minh",
    customerPhone: "0969888777",
    address: "Số 1 Tân Sơn Nhất, Phường 2, Tân Bình, TP.HCM",
    surveyor: "Phạm Minh Hiện",
    drawer: "Nguyễn Hoài Phong",
    status: "HOAN_THANH",
    receivedDate: "2026-05-12",
    deadlineDate: "2026-05-22",
    completedDate: "2026-05-20",
    contractValue: 10500000,
    notes: "Đo đạc thẩm định tòa nhà văn phòng cho thuê.",
    notesHistory: []
  },

  // Overdue Tasks! (Hạn hoàn thành trước ngày 2026-05-27 và chưa HOAN_THANH / HUY)
  {
    id: "HS-2026-017",
    contractId: "HĐ-VK-130",
    customerName: "Trần Văn Sỹ",
    customerPhone: "0955998877",
    address: "15/4 Hẻm Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
    surveyor: "Văn Văn Kha",
    drawer: "Trần Trọng Nghĩa",
    status: "DANG_DO",
    receivedDate: "2026-05-01",
    deadlineDate: "2026-05-10", // TRỄ HẠN!
    completedDate: null,
    contractValue: 7000000,
    notes: "Hồ sơ trễ hạn vướng tranh chấp lối đi chung khá gay gắt.",
    notesHistory: [
      { id: "1", date: "2026-05-08", author: "Văn Văn Kha", text: "Đã đo đạc nhưng hàng xóm liền kề ngăn cản không cho đóng ranh." },
      { id: "2", date: "2026-05-15", author: "Admin", text: "Yêu cầu đo ranh thô và làm văn bản tường trình xin lệnh can thiệp của UBND Phường." }
    ]
  },
  {
    id: "HS-2026-018",
    contractId: "HĐ-TT-942",
    customerName: "Vương Đức Tuấn",
    customerPhone: "0983111222",
    address: "Hẻm 30 Đường 12, Phường Bình An, Quận 2, TP.HCM",
    surveyor: "Lê Tiến Thành",
    drawer: "Nguyễn Hoài Phong",
    status: "CHUA_DO",
    receivedDate: "2026-05-08",
    deadlineDate: "2026-05-18", // TRỄ HẠN!
    completedDate: null,
    contractValue: 4500000,
    notes: "Cán bộ chưa liên hệ được chủ đất để mở cửa hàng rào đo tọa độ.",
    notesHistory: [
      { id: "1", date: "2026-05-12", author: "Lê Tiến Thành", text: "Gia chủ đi công tác nước ngoài chưa về cắt cử người mở khóa." }
    ]
  },
  {
    id: "HS-2026-019",
    contractId: "HĐ-QT-319",
    customerName: "Nguyễn Kim Ngân",
    customerPhone: "0971221155",
    address: "Đường Tên Lửa, Phường Bình Trị Đông B, Bình Tân, TP.HCM",
    surveyor: "Lê Quốc Thiệu",
    drawer: "Phạm Đình Tân",
    status: "VE_BAN_VE",
    receivedDate: "2026-05-05",
    deadlineDate: "2026-05-15", // TRỄ HẠN!
    completedDate: null,
    contractValue: 9000000,
    notes: "Hồ sơ đang ở khâu vẽ đồ họa nhưng vẽ sai hiện trạng hầm tự hoại, cần vẽ sửa lại.",
    notesHistory: [
      { id: "1", date: "2026-05-14", author: "Phạm Đình Tân", text: "Bản vẽ hoàn thiện bị trả về do mâu thuẫn ranh phía lộ giới của đường sắt." }
    ]
  },
  {
    id: "HS-2026-020",
    contractId: "HĐ-NT-512",
    customerName: "Lý Gia Kiệt",
    customerPhone: "0904001122",
    address: "Xã Bà Điểm, Huyện Hóc Môn, TP.HCM",
    surveyor: "Nguyễn Trung Tính",
    drawer: "Kim Hoàng Phước",
    status: "CHUA_DO",
    receivedDate: "2026-05-10",
    deadlineDate: "2026-05-22", // TRỄ HẠN!
    completedDate: null,
    contractValue: 5000000,
    notes: "Chưa đo đạc vì máy đo RTK đột ngột mất sóng vệ tinh khu vực đó do vướng trạm biến áp.",
    notesHistory: []
  }
];
