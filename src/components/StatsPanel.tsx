import React, { useState } from 'react';
import { Customer, TimeFilter } from '../types';
import { Users, Wrench, DollarSign, Calendar, TrendingUp, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { RevenueTrendChart } from './stats/RevenueTrendChart';
import { CategoryPieChart } from './stats/CategoryPieChart';

interface StatsPanelProps {
  customers: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ customers, onSelectCustomer }) => {
  const [filter, setFilter] = useState<TimeFilter>('month');

  // Filter calculation function based on date string YYYY-MM-DD
  const isDateInFilter = (dateStr: string, timeFilter: TimeFilter): boolean => {
    if (timeFilter === 'all') return true;

    const recordDate = new Date(dateStr);
    const now = new Date();
    // Normalize to midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeFilter === 'today') {
      return recordDate >= today;
    }

    if (timeFilter === 'month') {
      return recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth();
    }

    if (timeFilter === '3months') {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return recordDate >= threeMonthsAgo;
    }

    if (timeFilter === '6months') {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return recordDate >= sixMonthsAgo;
    }

    if (timeFilter === 'year') {
      return recordDate.getFullYear() === now.getFullYear();
    }

    return true;
  };

  // Flatten repairs in filter
  const allFilteredRepairs: {
    customer: Customer;
    customerName: string;
    phone: string;
    repair: Customer['repairs'][0];
  }[] = [];
  const activeCustomerIds = new Set<string>();
  let totalRevenue = 0;
  let completedCount = 0;
  let pendingCount = 0;

  customers.forEach((customer) => {
    customer.repairs.forEach((repair) => {
      if (isDateInFilter(repair.date, filter)) {
        allFilteredRepairs.push({
          customer,
          customerName: customer.name,
          phone: customer.phone,
          repair,
        });
        activeCustomerIds.add(customer.id);
        totalRevenue += repair.price;
        if (repair.status === 'completed') {
          completedCount++;
        } else {
          pendingCount++;
        }
      }
    });
  });

  return (
    <div className="space-y-6 fade-in">
      {/* Time Filter Tabs */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">統計時段切換</h2>
        </div>

        <div className="flex flex-wrap bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs gap-1">
          {(
            [
              { key: 'today', label: '今日' },
              { key: 'month', label: '當月' },
              { key: '3months', label: '近三個月' },
              { key: '6months', label: '半年內' },
              { key: 'year', label: '今年一整年' },
              { key: 'all', label: '全紀錄' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                filter === item.key
                  ? 'bg-gradient-to-r from-sky-500/30 to-emerald-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-mono text-slate-200 font-semibold">累積總客戶數</p>
            <h3 className="text-2xl font-black font-mono text-white mt-1">
              {customers.length} <span className="text-xs font-normal text-slate-200">位</span>
            </h3>
            <p className="text-[11px] text-slate-300 font-mono mt-1">
              時段活躍：{activeCustomerIds.size} 位
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center border border-sky-500/30">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Repairs Count */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-mono text-slate-200 font-semibold">指定時段維修次數</p>
            <h3 className="text-2xl font-black font-mono text-white mt-1">
              {allFilteredRepairs.length} <span className="text-xs font-normal text-slate-200">次</span>
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-mono mt-1">
              <span className="text-emerald-300 font-semibold">✅ {completedCount} 完成</span>
              <span className="text-amber-300 font-semibold">⏳ {pendingCount} 待取</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-2 text-white">
          <div>
            <p className="text-xs font-mono text-slate-200 font-semibold">指定時段營業額</p>
            <h3 className="text-3xl font-black font-mono text-emerald-400 mt-1">
              NT$ {totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-200 font-mono mt-1">
              平均單筆金額：NT${' '}
              {allFilteredRepairs.length > 0
                ? Math.round(totalRevenue / allFilteredRepairs.length).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/40 shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Business Visualizations: Revenue Trend & Category Breakdown Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueTrendChart repairs={allFilteredRepairs} filter={filter} />
        <CategoryPieChart repairs={allFilteredRepairs} />
      </div>

      {/* Repairs Table Breakdown */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-mono font-bold tracking-wider text-sky-400 uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> 該時段維修明細列表 ({allFilteredRepairs.length} 筆)
          </h3>
          <span className="text-xs text-slate-200 flex items-center gap-1 font-sans font-medium">
            💡 提示：點擊任一客戶欄位可直接進入該客戶詳細資訊
          </span>
        </div>

        {allFilteredRepairs.length === 0 ? (
          <div className="text-center py-8 text-slate-300 text-sm">此統計時段內尚無維修紀錄。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-white font-bold font-mono">
                  <th className="py-2.5 px-3">日期</th>
                  <th className="py-2.5 px-3">客戶姓名</th>
                  <th className="py-2.5 px-3">維修項目描述</th>
                  <th className="py-2.5 px-3">狀態</th>
                  <th className="py-2.5 px-3 text-right">費用 (NT$)</th>
                  <th className="py-2.5 px-3 text-center w-12">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {allFilteredRepairs.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectCustomer && onSelectCustomer(item.customer)}
                    className="hover:bg-sky-500/10 hover:border-sky-500/30 transition-all cursor-pointer group"
                    title={`點擊查看 ${item.customerName} 的客戶與維修詳細資訊`}
                  >
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {item.repair.date}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100 whitespace-nowrap group-hover:text-sky-300 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                        <span>{item.customerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 group-hover:text-slate-100 transition-colors">
                      {item.repair.item}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.repair.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> 4. 完工待取{item.repair.isPickedUp ? ' (已取件)' : ''}
                        </span>
                      ) : item.repair.status === 'repairing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                          <Clock className="w-3 h-3" /> 3. 維修更換
                        </span>
                      ) : item.repair.status === 'diagnosing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          <Clock className="w-3 h-3" /> 2. 故障檢測
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                          <Clock className="w-3 h-3" /> 1. 收件建檔
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sky-400 whitespace-nowrap">
                      ${item.repair.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 group-hover:text-sky-400 transition-colors whitespace-nowrap">
                      <ChevronRight className="w-4 h-4 mx-auto group-hover:translate-x-0.5 transition-transform" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
