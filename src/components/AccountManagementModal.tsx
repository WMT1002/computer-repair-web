import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Users,
  Shield,
  Search,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ManagedUser } from '../types';
import { ROLE_CODES, getRoleLabel, getRoleStyle, normalizeRoleCode } from '../config/roles';

interface AccountManagementModalProps {
  onClose: () => void;
}

const roleOptions = [
  {
    value: ROLE_CODES.ADMIN,
    label: '系統管理員',
    desc: '可管理所有客戶資料、維修紀錄、報價單及帳號權限。',
  },
  {
    value: ROLE_CODES.MANAGER,
    label: '維修主管',
    desc: '可管理維修單、報價單及營運報表統計。',
  },
  {
    value: ROLE_CODES.STAFF,
    label: '一般工程師',
    desc: '可操作維修案件、新增/修改客戶紀錄及列印取件單。',
  },
];

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({ onClose }) => {
  const { user: currentUser, refreshProfile } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Try RPC first
      const { data, error } = await supabase.rpc('list_repair_users');

      if (!error && data) {
        setUsers(data as ManagedUser[]);
        return;
      }

      // Fallback: Query profiles table directly
      const { data: profileList, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileErr) throw profileErr;

      const fallbackUsers: ManagedUser[] = (profileList || []).map((p: any) => ({
        id: p.id,
        email: p.id === currentUser?.id ? currentUser?.email || '' : `${p.name}@repair.local`,
        name: p.name || '未命名工程師',
        role_code: typeof p.role_code === 'number' ? p.role_code : 1,
        created_at: p.created_at || new Date().toISOString(),
        last_sign_in_at: null,
        email_confirmed: true,
      }));

      setUsers(fallbackUsers);
    } catch (err: any) {
      console.error('Failed to load users list:', err);
      setErrorMsg('載入使用者名單失敗：' + (err.message || '請確認是否已執行 SQL 腳本'));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (targetUser: ManagedUser, newRole: number) => {
    if (targetUser.role_code === newRole) return;

    if (targetUser.id === currentUser?.id && newRole !== ROLE_CODES.ADMIN) {
      alert('為避免系統失去管理員，您不能降級自己的管理員權限！');
      return;
    }

    setSavingUserId(targetUser.id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Try RPC first
      const { error: rpcErr } = await supabase.rpc('set_repair_user_role', {
        p_user_id: targetUser.id,
        p_role_code: newRole,
      });

      if (rpcErr) {
        // Fallback: direct update
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ role_code: newRole, updated_at: new Date().toISOString() })
          .eq('id', targetUser.id);

        if (updateErr) throw updateErr;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role_code: newRole } : u))
      );

      setSuccessMsg(`已成功將「${targetUser.name}」的權限更新為【${getRoleLabel(newRole)}】！`);
      if (targetUser.id === currentUser?.id) {
        await refreshProfile();
      }
    } catch (err: any) {
      console.error('Failed to change user role:', err);
      setErrorMsg('更新權限失敗：' + (err.message || '權限不足或資料庫錯誤'));
    } finally {
      setSavingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        getRoleLabel(u.role_code).toLowerCase().includes(term)
    );
  }, [searchTerm, users]);

  const roleCounts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => normalizeRoleCode(u.role_code) === ROLE_CODES.ADMIN).length,
      manager: users.filter((u) => normalizeRoleCode(u.role_code) === ROLE_CODES.MANAGER).length,
      staff: users.filter((u) => normalizeRoleCode(u.role_code) === ROLE_CODES.STAFF).length,
    };
  }, [users]);

  return (
    <div className="modal-overlay">
      <div className="modal-content !max-w-4xl max-h-[90vh] flex flex-col p-6 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                帳號與權限管理
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
                  管理員專用
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                管理維修系統內所有使用者帳號、指派身分權限與檢視最後登入狀態
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Role Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 shrink-0">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="text-[11px] text-slate-400">總註冊帳號</div>
            <div className="text-lg font-black text-slate-100 font-mono">{roleCounts.total} 位</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-[11px] text-purple-300">系統管理員</div>
            <div className="text-lg font-black text-purple-400 font-mono">{roleCounts.admin} 位</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <div className="text-[11px] text-teal-300">維修主管</div>
            <div className="text-lg font-black text-teal-400 font-mono">{roleCounts.manager} 位</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <div className="text-[11px] text-sky-300">一般工程師</div>
            <div className="text-lg font-black text-sky-400 font-mono">{roleCounts.staff} 位</div>
          </div>
        </div>

        {/* Notification Banners */}
        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋姓名、Email、角色稱呼…"
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 text-xs sm:text-sm focus:border-purple-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => void loadUsers()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>

        {/* Users Table / List */}
        <div className="flex-1 overflow-y-auto border border-slate-700/60 rounded-xl bg-slate-950/40">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCcw className="w-6 h-6 animate-spin text-purple-400" />
              <div className="text-sm font-semibold">正在載入帳號名單…</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Users className="w-8 h-8 opacity-40" />
              <div className="text-sm">查無符合搜尋條件的使用者帳號</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredUsers.map((account) => {
                const style = getRoleStyle(account.role_code);
                const isCurrent = account.id === currentUser?.id;
                const isSaving = savingUserId === account.id;

                return (
                  <div
                    key={account.id}
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-800/40 ${
                      isCurrent ? 'bg-purple-950/20' : ''
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-md"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                      >
                        {account.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-100 text-sm">{account.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                              目前登入中
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${style.badgeClass}`}
                          >
                            {getRoleLabel(account.role_code)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-3 flex-wrap">
                          <span>{account.email || '未設定 Email'}</span>
                          <span className="text-slate-600">•</span>
                          <span>註冊時間：{account.created_at ? account.created_at.split('T')[0] : '未知'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Role Selector Controls */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <span className="text-xs text-slate-400">變更權限：</span>
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
                        {roleOptions.map((opt) => {
                          const isSelected = normalizeRoleCode(account.role_code) === opt.value;
                          return (
                            <button
                              key={opt.value}
                              disabled={isSaving}
                              onClick={() => void handleRoleChange(account, opt.value)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              } disabled:opacity-50`}
                              title={opt.desc}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>💡 提示：若使用 Supabase 後台手動新增使用者，此清單亦可即時同步管理。</div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
