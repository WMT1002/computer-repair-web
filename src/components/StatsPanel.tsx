import React, { useState } from 'react';
import { Customer, TimeFilter } from '../types';
import { Users, Wrench, DollarSign, Calendar, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface StatsPanelProps {
  customers: Customer[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ customers }) => {
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
  const allFilteredRepairs: { customerName: string; phone: string; repair: Customer['repairs'][0] }[] = [];
  const activeCustomerIds = new Set<string>();
  let totalRevenue = 0;
  let completedCount = 0;
  let pendingCount = 0;

  customers.forEach((customer) => {
    customer.repairs.forEach((repair) => {
      if (isDateInFilter(repair.date, filter)) {
        allFilteredRepairs.push({
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
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">累積總客戶數</p>
            <h3 className="text-2xl font-black font-mono text-slate-100 mt-1">
              {customers.length} <span className="text-xs font-normal text-slate-400">位</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              時段活躍：{activeCustomerIds.size} 位
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Repairs Count */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400">指定時段維修次數</p>
            <h3 className="text-2xl font-black font-mono text-slate-100 mt-1">
              {allFilteredRepairs.length} <span className="text-xs font-normal text-slate-400">次</span>
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-mono mt-1">
              <span className="text-emerald-400">✅ {completedCount} 完成</span>
              <span className="text-amber-400">⏳ {pendingCount} 待取</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-2">
          <div>
            <p className="text-xs font-mono text-slate-400">指定時段營業額</p>
            <h3 className="text-3xl font-black font-mono text-emerald-400 mt-1">
              NT$ {totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              平均單筆金額：NT${' '}
              {allFilteredRepairs.length > 0
                ? Math.round(totalRevenue / allFilteredRepairs.length).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Repairs Table Breakdown */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-lg">
        <h3 className="text-sm font-mono font-bold tracking-wider text-sky-400 uppercase mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> 該時段維修明細列表 ({allFilteredRepairs.length} 筆)
        </h3>

        {allFilteredRepairs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">此統計時段內尚無維修紀錄。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">日期</th>
                  <th className="py-2.5 px-3">客戶姓名</th>
                  <th className="py-2.5 px-3">維修項目描述</th>
                  <th className="py-2.5 px-3">狀態</th>
                  <th className="py-2.5 px-3 text-right">費用 (NT$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {allFilteredRepairs.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/30 transition">
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {item.repair.date}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-100 whitespace-nowrap">
                      {item.customerName}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.repair.item}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.repair.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> 已完成
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3 animate-pulse" /> 待取件
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sky-400 whitespace-nowrap">
                      ${item.repair.price.toLocaleString()}
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
