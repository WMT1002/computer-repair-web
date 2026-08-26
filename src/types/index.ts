export type RepairStatus =
  | 'received'    // 1. 收件建檔
  | 'diagnosing'  // 2. 故障檢測
  | 'repairing'   // 3. 維修更換
  | 'completed'   // 4. 完工待取
  | 'pending';    // 相容舊資料 (等同收件建檔)

export const REPAIR_STATUS_OPTIONS: {
  value: RepairStatus;
  label: string;
  stage: number;
  badgeClass: string;
}[] = [
  { value: 'received', label: '【1. 收件建檔】', stage: 1, badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  { value: 'diagnosing', label: '【2. 故障檢測】', stage: 2, badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'repairing', label: '【3. 維修更換】', stage: 3, badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { value: 'completed', label: '【4. 完工待取】', stage: 4, badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
];

export function getStatusStage(status: string | undefined): number {
  if (status === 'completed') return 4;
  if (status === 'repairing') return 3;
  if (status === 'diagnosing') return 2;
  return 1; // 'received' or 'pending' or unknown
}

export function getStatusLabel(status: string | undefined): string {
  if (status === 'completed') return '【4. 完工待取】';
  if (status === 'repairing') return '【3. 維修更換】';
  if (status === 'diagnosing') return '【2. 故障檢測】';
  return '【1. 收件建檔】';
}


export interface RepairPhoto {
  id: string;
  url: string; // Base64 data URL or remote URL
  caption?: string; // e.g. "機殼外觀正面", "左側板刮痕", "風扇灰塵"
  createdAt?: string;
}

export interface RepairRecord {
  id: string;
  date: string;
  item: string;
  dueDate: string;
  price: number;
  status: RepairStatus;
  isPickedUp?: boolean;
  pickedUpDate?: string;
  note?: string;
  hasLeftPanel?: boolean;
  hasRightPanel?: boolean;
  photos?: RepairPhoto[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  repairs: RepairRecord[];
}

export type TimeFilter = 'today' | 'month' | '3months' | '6months' | 'year' | 'all';

export interface ShopInfo {
  name: string;
  phone: string;
  address: string;
  notice: string;
}

export interface PriceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  note?: string;
}

export type UserRoleCode = 0 | 1 | 2; // 0: 系統管理員, 1: 一般工程師, 2: 維修主管

export interface UserProfile {
  id: string;
  name: string;
  role_code: number;
  created_at?: string;
  updated_at?: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role_code: number;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

export interface PartWarrantyRecord {
  id: string; // e.g. "WAR-2026-001"
  customerId: string; // e.g. "CUST-2026-001"
  customerName: string; // e.g. "張家豪"
  customerPhone: string; // e.g. "0933-112-233"
  repairId: string; // e.g. "REP-2026-003"
  partName: string; // e.g. "Micron Crucial T500 1TB PCIe 4.0 SSD"
  partCategory: string; // e.g. "固態硬碟 (SSD)", "記憶體 (RAM)", "電源供應器 (PSU)", "顯示卡 (GPU)", "主機板 (MB)", "處理器 (CPU)", "螢幕面板", "散熱清潔", "其他配件"
  serialNumber: string; // e.g. "SN24080911893X"
  warrantyDays: number; // e.g. 365, 1095, 180, etc.
  startDate?: string; // 保固起算日期 (取件日期 YYYY-MM-DD)
  supplier?: string; // 代理商/經銷原廠 (如：捷元代理公司貨、聯強國際、原廠三年保)
  note?: string; // 備註 (如：含盒裝發票影本)
  createdAt: string;
}
