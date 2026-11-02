import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sun,
  Moon,
  LogOut,
  Shield,
  Search,
} from 'lucide-react';
import { FixFlowLogo } from './common/FixFlowLogo';
import { useAuth } from '../contexts/AuthContext';
import { getRoleLabel, getRoleStyle, isAdmin } from '../config/roles';

interface HeaderProps {
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAccountManagement?: () => void;
  onOpenCustomerTracking?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  themeMode,
  onToggleTheme,
  onOpenAccountManagement,
  onOpenCustomerTracking,
}) => {
  const { user, profile, signOut } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    if (window.confirm('確定要登出 FixFlow 電腦維修管理系統嗎？')) {
      await signOut();
    }
  };

  const roleStyle = getRoleStyle(profile?.role_code);
  const displayName = profile?.name || user?.email?.split('@')[0] || '維修工程師';
  const roleName = getRoleLabel(profile?.role_code);
  const userIsAdmin = isAdmin(profile?.role_code);

  return (
    <header className="workspace-header flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-[#334155] gap-3 sm:gap-4">
      {/* Brand Section */}
      <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-xl bg-slate-800 p-2 sm:p-2.5 flex items-center justify-center text-slate-100 font-bold shadow-sm shrink-0 transition-transform">
            <FixFlowLogo className="w-full h-full text-slate-100" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wider text-slate-100 flex items-center gap-1.5 sm:gap-2">
                <span className="text-slate-100 font-semibold tracking-normal">
                  FixFlow
                </span>
                <span className="truncate">電腦維修管理系統</span>
              </h1>

            </div>
            <p className="hidden sm:block text-xs text-slate-400 font-mono mt-0.5">
              客戶、維修與門市營運
            </p>
          </div>
        </div>
      </div>

      {/* Right User & Tools Section */}
      <div className="flex flex-col items-end gap-2 sm:gap-2.5 w-full lg:w-auto shrink-0">
        {/* 上方同一行：時間 + 系統管理員 / 使用者卡片 */}
        <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
          {/* 時間區塊 */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-sky-400 bg-slate-800/90 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-700/80 shadow-md whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
            <span>{timeStr}</span>
          </div>

          {/* 系統管理員 / 使用者卡片 */}
          {user && (
            <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-md shrink-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  background: roleStyle.bg,
                  color: roleStyle.color,
                  border: `1px solid ${roleStyle.border}`,
                }}
              >
                {displayName.slice(0, 1)}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 max-w-[100px] sm:max-w-[140px] truncate whitespace-nowrap">
                    {displayName}
                  </span>
                  <span
                    className={`text-[calc(9px*var(--ui-text-scale))] sm:text-[calc(10px*var(--ui-text-scale))] px-1.5 py-0.5 rounded-md font-semibold border whitespace-nowrap ${roleStyle.badgeClass}`}
                  >
                    {roleName}
                  </span>
                </div>
                <span className="text-[calc(10px*var(--ui-text-scale))] sm:text-[calc(11px*var(--ui-text-scale))] text-slate-400 font-mono truncate max-w-[120px] sm:max-w-[180px] whitespace-nowrap">
                  {user.email}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 下方同一行：剩下四個區塊 (帳號管理、顧客查詢頁、風格切換、登出) */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-end whitespace-nowrap">
          {/* 1. 帳號管理 */}
          {userIsAdmin && onOpenAccountManagement && (
            <button
              type="button"
              onClick={onOpenAccountManagement}
              className="btn-account-mgmt flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40 hover:bg-purple-500/25 hover:border-purple-400 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="帳號與身分權限管理（管理員專屬）"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
              <span>帳號管理</span>
            </button>
          )}

          {/* 2. 顧客查詢頁 */}
          {onOpenCustomerTracking && (
            <button
              type="button"
              onClick={onOpenCustomerTracking}
              className="btn-customer-tracking flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/40 hover:bg-sky-500/25 hover:border-sky-400 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="前往顧客專屬免登入維修進度查詢頁"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
              <span>顧客查詢頁</span>
            </button>
          )}

          {/* 3. 風格切換 */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-md cursor-pointer whitespace-nowrap shrink-0 ${
              themeMode === 'dark'
                ? 'bg-slate-800/90 text-amber-400 border-amber-500/40 hover:bg-slate-700/90 hover:border-amber-400'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200/90'
            }`}
            title="切換淺色或深色模式"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>淺色模式</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 shrink-0" />
                <span>深色模式</span>
              </>
            )}
          </button>

          {/* 4. 登出 */}
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-400 shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="安全登出系統"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>登出</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
