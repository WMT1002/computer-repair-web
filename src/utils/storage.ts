import { Customer, ShopInfo, PriceItem, RepairRecord, PartWarrantyRecord } from '../types';
import { supabase } from './supabaseClient';

const CUSTOMERS_KEY = 'repair_shop_customers_v1';
const SHOP_INFO_KEY = 'repair_shop_info_v1';
const PRICE_LIST_KEY = 'repair_shop_pricelist_v1';
const WARRANTY_LIST_KEY = 'repair_shop_warranties_v1';

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
          status: r.status as any,
          isPickedUp: Boolean(r.is_picked_up),
          pickedUpDate: r.picked_up_date || undefined,
          note: r.note || '',
          hasLeftPanel: Boolean(r.has_left_panel),
          hasRightPanel: Boolean(r.has_right_panel),
          photos: Array.isArray(r.photos) ? r.photos : [],
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
          is_picked_up: Boolean(r.isPickedUp),
          picked_up_date: r.pickedUpDate || null,
          note: r.note,
          has_left_panel: Boolean(r.hasLeftPanel),
          has_right_panel: Boolean(r.hasRightPanel),
          photos: r.photos || [],
        });
      }
    }
  } catch (err) {
    console.error('Failed to sync customers to Supabase:', err);
  }
}

export async function syncSingleCloudRepairRecord(
  customerId: string,
  repair: RepairRecord
): Promise<void> {
  try {
    await supabase.from('repair_records').upsert({
      id: repair.id,
      customer_id: customerId,
      date: repair.date,
      item: repair.item,
      due_date: repair.dueDate,
      price: repair.price,
      status: repair.status,
      is_picked_up: Boolean(repair.isPickedUp),
      picked_up_date: repair.pickedUpDate || null,
      note: repair.note,
      has_left_panel: Boolean(repair.hasLeftPanel),
      has_right_panel: Boolean(repair.hasRightPanel),
      photos: repair.photos || [],
    });
  } catch (err) {
    console.error('Failed to sync single repair record to Supabase:', err);
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

export interface PublicTrackingResult {
  customer: Customer;
  repair: RepairRecord;
  shopInfo: ShopInfo;
}

export async function fetchPublicTrackingData(query: string): Promise<PublicTrackingResult[] | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  try {
    const defaultShopInfo = getStoredShopInfo();

    // 1. Try Supabase cloud query
    let { data: repData } = await supabase
      .from('repair_records')
      .select('*')
      .ilike('id', `%${cleanQuery}%`)
      .order('created_at', { ascending: false });

    // Or Query by customer phone or customer ID/name
    let customerIds: string[] = [];
    if (!repData || repData.length === 0) {
      const { data: custData } = await supabase
        .from('repair_customers')
        .select('*')
        .or(`phone.ilike.%${cleanQuery}%,id.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%`);

      if (custData && custData.length > 0) {
        customerIds = custData.map((c) => c.id);
        const { data: matchedRepairs } = await supabase
          .from('repair_records')
          .select('*')
          .in('customer_id', customerIds)
          .order('created_at', { ascending: false });
        repData = matchedRepairs || [];
      }
    }

    if (repData && repData.length > 0) {
      const allCustIds = Array.from(new Set(repData.map((r) => r.customer_id)));
      const { data: allCustData } = await supabase
        .from('repair_customers')
        .select('*')
        .in('id', allCustIds);

      // Fetch shop info from cloud
      const { data: shopData } = await supabase.from('repair_shop_info').select('*').limit(1);
      const activeShopInfo: ShopInfo =
        shopData && shopData.length > 0
          ? {
              name: shopData[0].name,
              phone: shopData[0].phone,
              address: shopData[0].address,
              notice: shopData[0].notice,
            }
          : defaultShopInfo;

      const results: PublicTrackingResult[] = [];
      for (const r of repData) {
        const matchingCust = allCustData?.find((c) => c.id === r.customer_id) || {
          id: r.customer_id,
          name: '客戶',
          phone: '',
          createdAt: r.date,
        };

        const repairRecord: RepairRecord = {
          id: r.id,
          date: r.date,
          item: r.item,
          dueDate: r.due_date || '',
          price: Number(r.price) || 0,
          status: r.status as any,
          isPickedUp: Boolean(r.is_picked_up),
          pickedUpDate: r.picked_up_date || undefined,
          note: r.note || '',
          hasLeftPanel: Boolean(r.has_left_panel),
          hasRightPanel: Boolean(r.has_right_panel),
          photos: Array.isArray(r.photos) ? r.photos : [],
        };

        const customerObj: Customer = {
          id: matchingCust.id,
          name: matchingCust.name,
          phone: matchingCust.phone,
          createdAt: matchingCust.created_at ? matchingCust.created_at.split('T')[0] : r.date,
          repairs: [repairRecord],
        };

        results.push({
          customer: customerObj,
          repair: repairRecord,
          shopInfo: activeShopInfo,
        });
      }

      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn('Public tracking cloud fetch fallback to local:', err);
  }

  // Fallback to LocalStorage
  const localCustomers = getStoredCustomers();
  const localShop = getStoredShopInfo();
  const lowerQuery = cleanQuery.toLowerCase();
  const localResults: PublicTrackingResult[] = [];

  for (const c of localCustomers) {
    for (const r of c.repairs) {
      if (
        r.id.toLowerCase().includes(lowerQuery) ||
        c.phone.toLowerCase().includes(lowerQuery) ||
        c.name.toLowerCase().includes(lowerQuery) ||
        c.id.toLowerCase().includes(lowerQuery)
      ) {
        localResults.push({
          customer: c,
          repair: r,
          shopInfo: localShop,
        });
      }
    }
  }

  return localResults.length > 0 ? localResults : null;
}

export const INITIAL_MOCK_WARRANTIES: PartWarrantyRecord[] = [
  {
    id: 'WAR-2026-001',
    customerId: 'CUST-2026-001',
    customerName: '陳小明',
    customerPhone: '0912-345-678',
    repairId: 'REP-2026-001',
    partName: 'Crucial BX500 500GB 2.5吋 SATA SSD 固態硬碟',
    partCategory: '固態硬碟 (SSD)',
    serialNumber: 'SN-CT500BX500SSD1-2428A',
    warrantyDays: 1095, // 3年保固
    startDate: '2026-07-28',
    supplier: '捷元代理公司貨',
    note: '原廠三年有限保固，外盒與序號貼紙已交付客戶留存',
    createdAt: '2026-07-28',
  },
  {
    id: 'WAR-2026-002',
    customerId: 'CUST-2026-003',
    customerName: '張家豪',
    customerPhone: '0933-112-233',
    repairId: 'REP-2026-003',
    partName: 'ASUS Dual GeForce RTX 4070 顯卡雙滾珠原廠風扇組',
    partCategory: '顯示卡 (GPU)',
    serialNumber: 'SN-ASUS-RTX4070-FN8891',
    warrantyDays: 365, // 1年保固
    supplier: '華碩原廠備品',
    note: '更換原廠全新軸承風扇，門市保固 1 年',
    createdAt: '2026-07-30',
  },
  {
    id: 'WAR-2026-003',
    customerId: 'CUST-2026-004',
    customerName: '黃雅婷',
    customerPhone: '0955-667-788',
    repairId: 'REP-2026-004',
    partName: 'Seasonic Focus GX-650 650W 80Plus 金牌全模組電源',
    partCategory: '電源供應器 (PSU)',
    serialNumber: 'SN-GX650-202607159G',
    warrantyDays: 3650, // 10年保固
    supplier: '海韻原廠代理商 (杰強)',
    note: '十年原廠免費到府收送保固，附發票購買證明影本',
    createdAt: '2026-07-31',
  },
];

export const getStoredWarranties = (): PartWarrantyRecord[] => {
  try {
    const data = localStorage.getItem(WARRANTY_LIST_KEY);
    if (!data) {
      saveWarranties(INITIAL_MOCK_WARRANTIES);
      return INITIAL_MOCK_WARRANTIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load warranties from localStorage:', e);
    return INITIAL_MOCK_WARRANTIES;
  }
};

export const saveWarranties = (warranties: PartWarrantyRecord[]): void => {
  try {
    localStorage.setItem(WARRANTY_LIST_KEY, JSON.stringify(warranties));
  } catch (e) {
    console.error('Failed to save warranties to localStorage:', e);
  }
};

// Supabase Cloud Sync Operations for Warranties
export async function fetchCloudWarranties(): Promise<PartWarrantyRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('repair_warranties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    const warranties: PartWarrantyRecord[] = data.map((w: any) => ({
      id: w.id,
      customerId: w.customer_id || '',
      customerName: w.customer_name,
      customerPhone: w.customer_phone,
      repairId: w.repair_id || undefined,
      partName: w.part_name,
      partCategory: w.part_category,
      serialNumber: w.serial_number,
      warrantyDays: Number(w.warranty_days) || 30,
      startDate: w.start_date || undefined,
      supplier: w.supplier || undefined,
      note: w.note || undefined,
      createdAt: w.created_at || new Date().toISOString().split('T')[0],
    }));

    saveWarranties(warranties);
    return warranties;
  } catch (err) {
    console.error('Failed to fetch warranties from Supabase:', err);
    return null;
  }
}

export async function syncCloudWarranties(warranties: PartWarrantyRecord[]): Promise<void> {
  try {
    for (const w of warranties) {
      await supabase.from('repair_warranties').upsert({
        id: w.id,
        customer_id: w.customerId || null,
        customer_name: w.customerName,
        customer_phone: w.customerPhone,
        repair_id: w.repairId || null,
        part_name: w.partName,
        part_category: w.partCategory,
        serial_number: w.serialNumber,
        warranty_days: w.warrantyDays,
        start_date: w.startDate || null,
        supplier: w.supplier || null,
        note: w.note || null,
        created_at: w.createdAt,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Failed to sync warranties to Supabase:', err);
  }
}

export async function deleteCloudWarranty(id: string): Promise<void> {
  try {
    await supabase.from('repair_warranties').delete().eq('id', id);
  } catch (err) {
    console.error('Failed to delete warranty from Supabase:', err);
  }
}

