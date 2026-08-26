export type RepairStatus = 'pending' | 'completed';

export interface RepairRecord {
  id: string;
  date: string;
  item: string;
  dueDate: string;
  price: number;
  status: RepairStatus;
  note?: string;
  hasLeftPanel?: boolean;
  hasRightPanel?: boolean;
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

