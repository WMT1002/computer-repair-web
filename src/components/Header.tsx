import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Cloud,
  Sun,
  Moon,
  LogOut,
  Shield,
} from 'lucide-react';
import { FixFlowLogo } from './common/FixFlowLogo';
import { useAuth } from '../contexts/AuthContext';
import { getRoleLabel, getRoleStyle, isAdmin } from '../config/roles';

interface HeaderProps {
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAccountManagement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  themeMode,
  onToggleTheme,
  onOpenAccountManagement,
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
    if (window.confirm('確定要登出 FixFlow 智慧電腦維修管理系統嗎？')) {
      await signOut();
    }
  };

  const roleStyle = getRoleStyle(profile?.role_code);
  const displayName = profile?.name || user?.email?.split('@')[0] || '維修工程師';
  const roleName = getRoleLabel(profile?.role_code);
  const userIsAdmin = isAdmin(profile?.role_code);

  return (
    <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 mb-6 border-b border-[#334155] gap-4">
      {/* Brand Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-2.5 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-sky-500/25 shrink-0 transition-transform hover:scale-105">
          <FixFlowLogo className="w-full h-full text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black tracking-wider text-slate-100 flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 font-extrabold tracking-normal">
                FixFlow
              </span>
              <span>智慧電腦維修管理系統</span>
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 正式版
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-sky-400" /> Supabase 雲端已同步
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FIXFLOW PRO • VITE + REACT + TYPESCRIPT + SUPABASE AUTH & CLOUD
          </p>
        </div>
      </div>

      {/* Right User & Tools Section */}
      <div className="flex items-center gap-3 self-stretch lg:self-center justify-between lg:justify-end flex-wrap">
        {/* User Profile Card (if logged in) */}
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-md">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
              style={{
                background: roleStyle.bg,
                color: roleStyle.color,
                border: `1px solid ${roleStyle.border}`,
              }}
            >
              {displayName.slice(0, 1)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 max-w-[120px] truncate">
                  {displayName}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${roleStyle.badgeClass}`}
                >
                  {roleName}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Admin Account Management Button */}
        {userIsAdmin && onOpenAccountManagement && (
          <button
            onClick={onOpenAccountManagement}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 hover:border-purple-400 shadow-md transition-all cursor-pointer"
            title="帳號與身分權限管理（管理員專屬）"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>帳號管理</span>
          </button>
        )}

        {/* Theme Switch Button */}
        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-md cursor-pointer ${
            themeMode === 'dark'
              ? 'bg-slate-800/90 text-amber-400 border-amber-500/40 hover:bg-slate-700/90 hover:border-amber-400'
              : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200/90'
          }`}
          title="按此可切換「黑暗風」或「明亮風」風格"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">明亮風 ☀️</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">黑暗風 🌙</span>
            </>
          )}
        </button>

        {/* Sign Out Button */}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-400 shadow-md transition-all cursor-pointer"
            title="安全登出系統"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出</span>
          </button>
        )}

        {/* System Time */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-sky-400 bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/60 shadow-inner">
          <Clock className="w-4 h-4 animate-pulse text-sky-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
};
