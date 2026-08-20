import { Customer, ShopInfo, PriceItem, RepairRecord } from '../types';
import { supabase } from './supabaseClient';

const CUSTOMERS_KEY = 'repair_shop_customers_v1';
const SHOP_INFO_KEY = 'repair_shop_info_v1';
const PRICE_LIST_KEY = 'repair_shop_pricelist_v1';

export const DEFAULT_SHOP_INFO: ShopInfo = {
  name: '極速電腦維修中心',
  phone: '02-2345-6789 / 0912-345-678',
  address: '彰化縣鹿港鎮',
  notice: '憑此單取件。完成修復通知後請於 14 日內領回，逾期 30 日恕不負保管責任。硬體保固 30 天，軟體無保固。',
};

export const INITIAL_PRICE_ITEMS: PriceItem[] = [
  {
    id: 'PRICE-001',
    name: '更換作業系統 (Windows 10/11 重裝 + 驅動程式 + 基本軟體)',
    category: '系統軟體',
    price: 1000,
    note: '含資料備份與還原',
  },
  {
    id: 'PRICE-002',
    name: '桌上型電腦全機內部除塵清潔 + 更換高階散熱膏',
    category: '清潔保養',
    price: 600,
    note: '有效降低 CPU/GPU 運作溫度 10~15 度',
  },
  {
    id: 'PRICE-003',
    name: '500GB M.2 NVMe SSD 固態硬碟升級 + 系統複製移轉',
    category: '硬體升級',
    price: 1800,
    note: '含威剛/美光 500G 固態硬碟三年保固與安裝',
  },
  {
    id: 'PRICE-004',
    name: '1TB M.2 NVMe SSD 固態硬碟升級 + 系統複製移轉',
    category: '硬體升級',
    price: 2600,
    note: '含大容量固態硬碟與系統轉移',
  },
  {
    id: 'PRICE-005',
    name: '電腦電源供應器 (650W 銅牌) 更換安裝',
    category: '硬體維修',
    price: 2200,
    note: '解決通電無反應、開機自動斷電重開問題',
  },
  {
    id: 'PRICE-006',
    name: '電腦無法開機 / 死機藍屏硬體深度檢測查修',
    category: '檢測診斷',
    price: 500,
    note: '若確定維修可全額折抵維修工資',
  },
  {
    id: 'PRICE-007',
    name: '筆記型電腦螢幕面板更換 (15.6吋 FHD 144Hz)',
    category: '筆電維修',
    price: 3500,
    note: '含全新 A+ 級面板與拆裝工資',
  },
];

export const INITIAL_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-2026-001',
    name: '陳小明',
    phone: '0912-345-678',
    createdAt: '2026-07-28',
    repairs: [
      {
        id: 'REP-2026-001',
        date: '2026-07-28',
        item: '桌上型電腦清潔保養 + 更換散熱膏 + 500GB SSD 升級安裝',
        dueDate: '2026-07-30',
        price: 2800,
        status: 'completed',
        note: '已測試開機正常，溫度控制於 45 度以下',
      },
    ],
  },
  {
    id: 'CUST-2026-002',
    name: '林美玲',
    phone: '0928-765-432',
    createdAt: '2026-07-29',
    repairs: [
      {
        id: 'REP-2026-002',
        date: '2026-07-29',
        item: 'ASUS 筆電無法開機，藍屏死機代碼 0x0000007B，重裝 Windows 11',
        dueDate: '2026-07-31',
        price: 1500,
        status: 'pending',
        note: '已備份 C 槽桌面重要資料',
      },
    ],
  },
  {
    id: 'CUST-2026-003',
    name: '張家豪',
    phone: '0933-112-233',
    createdAt: '2026-07-30',
    repairs: [
      {
        id: 'REP-2026-003',
        date: '2026-07-30',
        item: 'RTX 4070 顯卡風扇異常異音檢測與更換',
        dueDate: '2026-08-01',
        price: 3200,
        status: 'pending',
        note: '等待原廠零組件到貨',
      },
    ],
  },
];

// Local Storage Handlers
export function getStoredCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_MOCK_CUSTOMERS));
      return INITIAL_MOCK_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse customers from localStorage', err);
    return INITIAL_MOCK_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error('Failed to save customers to localStorage', err);
  }
}

export function getStoredShopInfo(): ShopInfo {
  try {
    const raw = localStorage.getItem(SHOP_INFO_KEY);
    if (!raw) {
      localStorage.setItem(SHOP_INFO_KEY, JSON.stringify(DEFAULT_SHOP_INFO));
      return DEFAULT_SHOP_INFO;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_SHOP_INFO;
  }
}

export function saveShopInfo(info: ShopInfo): void {
  try {
    localStorage.setItem(SHOP_INFO_KEY, JSON.stringify(info));
  } catch (err) {
    console.error('Failed to save shop info', err);
  }
}

export function getStoredPriceList(): PriceItem[] {
  try {
    const raw = localStorage.getItem(PRICE_LIST_KEY);
    if (!raw) {
      localStorage.setItem(PRICE_LIST_KEY, JSON.stringify(INITIAL_PRICE_ITEMS));
      return INITIAL_PRICE_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse price list from localStorage', err);
    return INITIAL_PRICE_ITEMS;
  }
}

export function savePriceList(items: PriceItem[]): void {
  try {
    localStorage.setItem(PRICE_LIST_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save price list to localStorage', err);
  }
}

// Supabase Cloud Sync Operations
export async function fetchCloudCustomers(): Promise<Customer[] | null> {
  try {
    const { data: custData, error: custErr } = await supabase
      .from('repair_customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (custErr || !custData) return null;

    const { data: repData, error: repErr } = await supabase
      .from('repair_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (repErr || !repData) return null;

    const customers: Customer[] = custData.map((c) => {
      const repairs: RepairRecord[] = repData
        .filter((r) => r.customer_id === c.id)
        .map((r) => ({
          id: r.id,
          date: r.date,
          item: r.item,
          dueDate: r.due_date || '',
          price: Number(r.price) || 0,
          status: r.status as 'pending' | 'completed',
          note: r.note || '',
        }));

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        createdAt: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        repairs,
      };
    });

    saveCustomers(customers);
    return customers;
  } catch (err) {
    console.error('Failed to fetch customers from Supabase:', err);
    return null;
  }
}

export async function syncCloudCustomers(customers: Customer[]): Promise<void> {
  try {
    for (const c of customers) {
      await supabase.from('repair_customers').upsert({
        id: c.id,
        name: c.name,
        phone: c.phone,
      });

      for (const r of c.repairs) {
        await supabase.from('repair_records').upsert({
          id: r.id,
          customer_id: c.id,
          date: r.date,
          item: r.item,
          due_date: r.dueDate,
          price: r.price,
          status: r.status,
          note: r.note,
        });
      }
    }
  } catch (err) {
    console.error('Failed to sync customers to Supabase:', err);
  }
}

export async function fetchCloudPriceList(): Promise<PriceItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('repair_price_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    const items: PriceItem[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      note: item.note || '',
    }));

    savePriceList(items);
    return items;
  } catch (err) {
    console.error('Failed to fetch price list from Supabase:', err);
    return null;
  }
}

export async function syncCloudPriceList(items: PriceItem[]): Promise<void> {
  try {
    for (const item of items) {
      await supabase.from('repair_price_items').upsert({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        note: item.note,
      });
    }
  } catch (err) {
    console.error('Failed to sync price list to Supabase:', err);
  }
}

export async function deleteCloudPriceItem(id: string): Promise<void> {
  try {
    await supabase.from('repair_price_items').delete().eq('id', id);
  } catch (err) {
    console.error('Failed to delete price item from Supabase:', err);
  }
}

export async function deleteCloudCustomer(id: string): Promise<void> {
  try {
    await supabase.from('repair_customers').delete().eq('id', id);
  } catch (err) {
    console.error('Failed to delete customer from Supabase:', err);
  }
}

export async function deleteCloudRepairRecord(id: string): Promise<void> {
  try {
    await supabase.from('repair_records').delete().eq('id', id);
  } catch (err) {
    console.error('Failed to delete repair record from Supabase:', err);
  }
}
