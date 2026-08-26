import { useState, useEffect } from 'react';
import { Customer, RepairRecord, RepairStatus, ShopInfo, PriceItem, PartWarrantyRecord } from './types';
import {
  getStoredCustomers,
  saveCustomers,
  getStoredShopInfo,
  saveShopInfo,
  getStoredPriceList,
  savePriceList,
  getStoredWarranties,
  saveWarranties,
  fetchCloudCustomers,
  syncCloudCustomers,
  deleteCloudCustomer,
  deleteCloudRepairRecord,
  fetchCloudPriceList,
  syncCloudPriceList,
  deleteCloudPriceItem,
} from './utils/storage';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { CustomerList } from './components/CustomerList';
import { AddCustomerForm } from './components/AddCustomerForm';
import { PriceListManager } from './components/PriceListManager';
import { WarrantyHistoryPanel } from './components/warranty/WarrantyHistoryPanel';
import { AddWarrantyModal } from './components/warranty/AddWarrantyModal';
import { StatsPanel } from './components/StatsPanel';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { EditCustomerModal } from './components/EditCustomerModal';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { AccountManagementModal } from './components/AccountManagementModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { CustomerTrackingPage } from './components/CustomerTrackingPage';
import { useAuth } from './contexts/AuthContext';
import { RefreshCcw, Wrench } from 'lucide-react';

export function App() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Check URL query parameters for public tracking
  const getInitialTrackId = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('track') || params.get('order') || '';
    } catch {
      return '';
    }
  };

  const [trackingOrderId, setTrackingOrderId] = useState<string>(getInitialTrackId());
  const [isTrackingMode, setIsTrackingMode] = useState<boolean>(() => Boolean(getInitialTrackId()));

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo>(getStoredShopInfo());
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [warranties, setWarranties] = useState<PartWarrantyRecord[]>(() => getStoredWarranties());
  const [activeTab, setActiveTab] = useState<TabType>('list');

  // Theme Mode State ('dark' | 'light')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('repair_shop_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('repair_shop_theme', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<{
    customer: Customer;
    targetRepairId?: string;
  } | null>(null);
  const [printTarget, setPrintTarget] = useState<{
    customer: Customer;
    repair: RepairRecord;
  } | null>(null);
  const [quickAddWarrantyFor, setQuickAddWarrantyFor] = useState<{
    customerId: string;
    repairId: string;
  } | null>(null);

  // Initialize customers and price list from LocalStorage then sync Supabase Cloud when logged in
  useEffect(() => {
    if (!user) return;

    const localCust = getStoredCustomers();
    setCustomers(localCust);

    const localPrices = getStoredPriceList();
    setPriceItems(localPrices);

    const localWarranties = getStoredWarranties();
    setWarranties(localWarranties);

    // Async Cloud Fetch
    fetchCloudCustomers().then((cloudCust) => {
      if (cloudCust && cloudCust.length > 0) {
        setCustomers(cloudCust);
      } else {
        syncCloudCustomers(localCust);
      }
    });

    fetchCloudPriceList().then((cloudPrices) => {
      if (cloudPrices && cloudPrices.length > 0) {
        setPriceItems(cloudPrices);
      } else {
        syncCloudPriceList(localPrices);
      }
    });
  }, [user]);

  // Sync state to local storage and Supabase Cloud
  const updateCustomersState = (updated: Customer[]) => {
    setCustomers(updated);
    saveCustomers(updated);
    syncCloudCustomers(updated);

    if (selectedCustomer) {
      const refreshed = updated.find((c) => c.id === selectedCustomer.id);
      setSelectedCustomer(refreshed || null);
    }
  };

  const updatePriceItemsState = (updated: PriceItem[]) => {
    setPriceItems(updated);
    savePriceList(updated);
    syncCloudPriceList(updated);
  };

  const handleAddPriceItem = (newItem: PriceItem) => {
    const updated = [newItem, ...priceItems];
    updatePriceItemsState(updated);
  };

  const handleUpdatePriceItem = (updatedItem: PriceItem) => {
    const updated = priceItems.map((p) => (p.id === updatedItem.id ? updatedItem : p));
    updatePriceItemsState(updated);
  };

  const handleDeletePriceItem = (id: string) => {
    if (!window.confirm('確定要刪除此項報價嗎？')) return;
    const updated = priceItems.filter((p) => p.id !== id);
    updatePriceItemsState(updated);
    deleteCloudPriceItem(id);
  };

  // Actions
  const handleAddCustomer = (newCustomer: Customer, shouldPrint = false) => {
    const updated = [newCustomer, ...customers];
    updateCustomersState(updated);
    setActiveTab('list');

    if (shouldPrint && newCustomer.repairs.length > 0) {
      setPrintTarget({
        customer: newCustomer,
        repair: newCustomer.repairs[0],
      });
    }
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c));
    updateCustomersState(updated);
    setEditingCustomer(null);

    // Synchronize warranty records start date for this customer's repairs
    setWarranties((prev) => {
      let hasChanges = false;
      const updatedWarranties = prev.map((w) => {
        const matchingRepair = updatedCustomer.repairs.find((r) => r.id === w.repairId);
        if (matchingRepair) {
          const isPickedUp = matchingRepair.status === 'completed' && Boolean(matchingRepair.isPickedUp);
          const newStartDate = isPickedUp ? (matchingRepair.pickedUpDate || todayStr) : undefined;
          if (w.startDate !== newStartDate) {
            hasChanges = true;
            return {
              ...w,
              startDate: newStartDate,
            };
          }
        }
        return w;
      });
      if (hasChanges) {
        saveWarranties(updatedWarranties);
        return updatedWarranties;
      }
      return prev;
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (!window.confirm('確定要刪除此客戶的整筆資料與維修歷史嗎？此操作無法復原。')) return;
    const updated = customers.filter((c) => c.id !== customerId);
    updateCustomersState(updated);
    deleteCloudCustomer(customerId);
  };

  const handleToggleStatus = (customerId: string, repairId: string, specificStatus?: RepairStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let shouldSyncWarranties = false;
    let newIsPickedUp = false;

    const updated = customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        repairs: c.repairs.map((r) => {
          if (r.id !== repairId) return r;
          let nextStatus: RepairStatus;
          if (specificStatus) {
            nextStatus = specificStatus;
          } else {
            // 4-stage cycle: received -> diagnosing -> repairing -> completed -> received
            if (r.status === 'received' || r.status === 'pending') nextStatus = 'diagnosing';
            else if (r.status === 'diagnosing') nextStatus = 'repairing';
            else if (r.status === 'repairing') nextStatus = 'completed';
            else nextStatus = 'received';
          }

          const isCompleted = nextStatus === 'completed';
          const isPickedUp = isCompleted ? Boolean(r.isPickedUp) : false;

          if (Boolean(r.isPickedUp) !== isPickedUp) {
            shouldSyncWarranties = true;
            newIsPickedUp = isPickedUp;
          }

          return {
            ...r,
            status: nextStatus,
            isPickedUp,
            pickedUpDate: isPickedUp ? (r.pickedUpDate || todayStr) : undefined,
          };
        }),
      };
    });
    updateCustomersState(updated);

    if (shouldSyncWarranties) {
      setWarranties((prev) => {
        const updatedWarranties = prev.map((w) => {
          if (w.repairId === repairId) {
            return {
              ...w,
              startDate: newIsPickedUp ? (w.startDate || todayStr) : undefined,
            };
          }
          return w;
        });
        saveWarranties(updatedWarranties);
        return updatedWarranties;
      });
    }
  };

  const handleTogglePickedUp = (customerId: string, repairId: string, isPickedUp: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        repairs: c.repairs.map((r) => {
          if (r.id !== repairId) return r;
          return {
            ...r,
            isPickedUp,
            pickedUpDate: isPickedUp ? todayStr : undefined,
          };
        }),
      };
    });
    updateCustomersState(updated);

    // Synchronize warranty records start date for this ticket!
    setWarranties((prev) => {
      const updatedWarranties = prev.map((w) => {
        if (w.repairId === repairId) {
          return {
            ...w,
            startDate: isPickedUp ? (w.startDate || todayStr) : undefined,
          };
        }
        return w;
      });
      saveWarranties(updatedWarranties);
      return updatedWarranties;
    });
  };

  const handleSaveWarranty = (newRecord: PartWarrantyRecord) => {
    setWarranties((prev) => {
      const exists = prev.some((w) => w.id === newRecord.id);
      const updated = exists
        ? prev.map((w) => (w.id === newRecord.id ? newRecord : w))
        : [newRecord, ...prev];
      saveWarranties(updated);
      return updated;
    });
  };

  const handleDeleteWarranty = (warrantyId: string) => {
    setWarranties((prev) => {
      const updated = prev.filter((w) => w.id !== warrantyId);
      saveWarranties(updated);
      return updated;
    });
  };

  const handleAddRepair = (customerId: string, newRepairData: Omit<RepairRecord, 'id'>) => {
    const repairId = `REP-${Date.now().toString().slice(-6)}`;
    const newRepair: RepairRecord = {
      ...newRepairData,
      id: repairId,
    };

    const updated = customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        repairs: [...c.repairs, newRepair],
      };
    });
    updateCustomersState(updated);
  };

  const handleDeleteRepair = (customerId: string, repairId: string) => {
    if (!window.confirm('確定要刪除此筆維修紀錄嗎？')) return;
    const updated = customers.map((c) => {
      if (c.id !== customerId) return c;
      return {
        ...c,
        repairs: c.repairs.filter((r) => r.id !== repairId),
      };
    });
    updateCustomersState(updated);
    deleteCloudRepairRecord(repairId);
  };

  const handleSaveShopInfo = (newInfo: ShopInfo) => {
    setShopInfo(newInfo);
    saveShopInfo(newInfo);
  };

  // Pending count for navigation badge (active repairs in shop not yet picked up)
  const pendingCount = customers.reduce((acc, c) => {
    return (
      acc +
      c.repairs.filter((r) => r.status !== 'completed' || !r.isPickedUp).length
    );
  }, 0);

  // 1. Initial Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1329] text-slate-100 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-xl shadow-sky-500/30 animate-pulse">
          <Wrench className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-sky-400">
          <RefreshCcw className="w-4 h-4 animate-spin" />
          <span>正在連接 Supabase 驗證服務…</span>
        </div>
      </div>
    );
  }

  // 2. Public Customer Tracking View (Bypasses login for QR code scans & customer tracking)
  if (isTrackingMode) {
    return (
      <CustomerTrackingPage
        initialOrderId={trackingOrderId}
        onBackToDashboard={
          user
            ? () => {
                setIsTrackingMode(false);
                // Clean URL param without reload
                if (window.history.pushState) {
                  const newUrl = window.location.pathname;
                  window.history.pushState({ path: newUrl }, '', newUrl);
                }
              }
            : undefined
        }
      />
    );
  }

  // 3. Unauthenticated View (Login / Register)
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onSwitchToRegister={() => setAuthView('register')}
        onGoToTracking={() => {
          setTrackingOrderId('');
          setIsTrackingMode(true);
        }}
      />
    );
  }

  // 4. Authenticated Repair System View
  return (
    <>
      <div className="app-container">
        <Header
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onOpenAccountManagement={() => setShowAccountModal(true)}
          onOpenCustomerTracking={() => {
            setTrackingOrderId('');
            setIsTrackingMode(true);
          }}
        />

        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          customerCount={customers.length}
          pendingCount={pendingCount}
          warrantyCount={warranties.length}
        />

        <main>
          {activeTab === 'list' && (
            <CustomerList
              customers={customers}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
              onEditCustomer={(c) => setEditingCustomer({ customer: c })}
              onPrintCustomer={(c, r) => setPrintTarget({ customer: c, repair: r })}
              onToggleStatus={handleToggleStatus}
              onTogglePickedUp={handleTogglePickedUp}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'add' && (
            <AddCustomerForm
              onAddCustomer={handleAddCustomer}
              onCancel={() => setActiveTab('list')}
              priceItems={priceItems}
            />
          )}

          {activeTab === 'pricelist' && (
            <PriceListManager
              priceItems={priceItems}
              onAddPriceItem={handleAddPriceItem}
              onUpdatePriceItem={handleUpdatePriceItem}
              onDeletePriceItem={handleDeletePriceItem}
            />
          )}

          {activeTab === 'warranty' && (
            <WarrantyHistoryPanel
              warranties={warranties}
              customers={customers}
              shopInfo={shopInfo}
              onSaveWarranty={handleSaveWarranty}
              onDeleteWarranty={handleDeleteWarranty}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          )}

          {activeTab === 'stats' && (
            <StatsPanel
              customers={customers}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
          )}
        </main>
      </div>

      {/* Account Management Modal for Admin */}
      {showAccountModal && (
        <AccountManagementModal onClose={() => setShowAccountModal(false)} />
      )}

      {/* Modals rendered outside main app container for print compatibility */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEditCustomer={(c, rId) => setEditingCustomer({ customer: c, targetRepairId: rId })}
          onAddRepair={handleAddRepair}
          onToggleStatus={handleToggleStatus}
          onTogglePickedUp={handleTogglePickedUp}
          onDeleteRepair={handleDeleteRepair}
          onPrintRepair={(c, r) => setPrintTarget({ customer: c, repair: r })}
          priceItems={priceItems}
          warranties={warranties}
          onAddWarranty={(cId, rId) => setQuickAddWarrantyFor({ customerId: cId, repairId: rId })}
        />
      )}

      {/* Quick Add Warranty Modal from Customer Detail */}
      {quickAddWarrantyFor && (
        <AddWarrantyModal
          isOpen={Boolean(quickAddWarrantyFor)}
          onClose={() => setQuickAddWarrantyFor(null)}
          onSave={handleSaveWarranty}
          customers={customers}
          initialCustomerId={quickAddWarrantyFor.customerId}
          initialRepairId={quickAddWarrantyFor.repairId}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer.customer}
          targetRepairId={editingCustomer.targetRepairId}
          onClose={() => setEditingCustomer(null)}
          onSaveCustomer={handleSaveCustomer}
        />
      )}

      {printTarget && (
        <PrintReceiptModal
          customer={printTarget.customer}
          repair={printTarget.repair}
          shopInfo={shopInfo}
          onClose={() => setPrintTarget(null)}
          onSaveShopInfo={handleSaveShopInfo}
        />
      )}
    </>
  );
}

export default App;
