import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Printer,
  Cloud,
  FileSpreadsheet,
} from 'lucide-react';
import { FixFlowLogo } from '../common/FixFlowLogo';
import { supabase } from '../../utils/supabaseClient';

interface LoginPageProps {}

function authErrorMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email 或密碼不正確，請重新確認。';
  }
  if (lower.includes('email not confirmed')) {
    return '此帳號尚未完成 Email 驗證，請先至信箱完成驗證後再登入。';
  }
  if (lower.includes('rate limit')) {
    return '登入嘗試次數過多，請稍後再試。';
  }
  return message || '登入失敗，請稍後再試。';
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSent(false);

    if (!validateEmail(email)) {
      setErrorMsg('請輸入有效的電子郵件地址 (Email)。');
      return;
    }

    setLoading(true);

    if (isResetMode) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}`,
        });
        setLoading(false);
        if (error) {
          setErrorMsg(authErrorMessage(error.message));
        } else {
          setResetSent(true);
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || '重設密碼請求失敗。');
      }
      return;
    }

    if (!password) {
      setLoading(false);
      setErrorMsg('請輸入密碼。');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(authErrorMessage(error.message));
      }
      // Success will automatically be picked up by AuthContext onAuthStateChange listener
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || '登入過程中發生異常。');
    }
  };

  const leaveResetMode = () => {
    setIsResetMode(false);
    setResetSent(false);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#0b1329] relative overflow-x-hidden overflow-y-auto">
      {/* Background Cyber Glow */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative w-full max-w-[1080px] my-auto grid lg:grid-cols-[1fr_1.15fr] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Feature Showcase Card */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-[#0d1f38] to-[#122847] border-r border-slate-700/60 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-2.5 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/25">
              <FixFlowLogo className="w-full h-full text-slate-950" />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">FixFlow</span>
                <span>智慧維修系統</span>
              </div>
              <div className="text-xs text-sky-300 font-mono">SUPABASE CLOUD SECURED</div>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> 雲端身分認證入口
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              數位化維修流程
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                提升工程師與門市效率
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              整合維修收件、案件進度、零件報價清單、A4 雙聯顧客取件收據及營業額即時統計分析。
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-2 !text-sky-400 text-sky-400 text-xs font-bold mb-1">
                  <Cloud className="w-4 h-4" /> 雲端即時同步
                </div>
                <div className="text-[11px] font-medium !text-white text-white login-feature-subtext" style={{ color: '#ffffff' }}>
                  PostgreSQL 雲端自動儲存
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-2 !text-emerald-400 text-emerald-400 text-xs font-bold mb-1">
                  <Printer className="w-4 h-4" /> A4 二聯單列印
                </div>
                <div className="text-[11px] font-medium !text-white text-white login-feature-subtext" style={{ color: '#ffffff' }}>
                  顧客聯與店家存根聯
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-2 !text-amber-400 text-amber-400 text-xs font-bold mb-1">
                  <FileSpreadsheet className="w-4 h-4" /> 零件價格表
                </div>
                <div className="text-[11px] font-medium !text-white text-white login-feature-subtext" style={{ color: '#ffffff' }}>
                  快速套用與標準化報價
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-2 !text-purple-400 text-purple-400 text-xs font-bold mb-1">
                  <Sparkles className="w-4 h-4" /> 角色權限分流
                </div>
                <div className="text-[11px] font-medium !text-white text-white login-feature-subtext" style={{ color: '#ffffff' }}>
                  管理員與工程師專屬權限
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4 font-mono">
            <span>© 2026 FixFlow 智慧維修管理系統</span>
            <span className="text-emerald-400">● 系統連線就緒</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto">
          {resetSent ? (
            /* Reset Link Sent Screen */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 mb-2">密碼重設信已寄出</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                我們已將重設密碼連結發送至 <strong className="text-sky-400 font-mono">{email}</strong>。
                請點擊信中連結設定新密碼。
              </p>
              <button
                type="button"
                onClick={leaveResetMode}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                返回登入頁面
              </button>
            </div>
          ) : (
            /* Login or Forgot Password Form */
            <div>
              {/* Mobile Brand Header */}
              <div className="flex lg:hidden items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-2 flex items-center justify-center text-slate-950 shadow-md shadow-sky-500/20 shrink-0">
                  <FixFlowLogo className="w-full h-full text-slate-950" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-wider text-white flex items-center gap-1">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">FixFlow</span>
                    <span>智慧維修系統</span>
                  </div>
                  <div className="text-[10px] text-sky-300 font-mono">SUPABASE CLOUD SECURED</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isResetMode ? '找回帳號密碼' : '安全使用者登入'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-1">
                  {isResetMode ? '重設您的密碼' : '登入維修系統'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isResetMode
                    ? '請輸入註冊時使用的 Email，我們將發送安全重設連結'
                    : '請使用工程師或管理員帳號密碼以存取後台'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                  <div className="font-bold shrink-0">⚠️ 錯誤：</div>
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    電子郵件 (Email 帳號) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-base sm:text-sm outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password (if not reset mode) */}
                {!isResetMode && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        密碼 <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setErrorMsg('');
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer py-1"
                      >
                        忘記密碼？
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="請輸入密碼"
                        className="w-full pl-10 pr-11 py-3 sm:py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-base sm:text-sm outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer p-1.5"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-base sm:text-sm min-h-[48px] shadow-lg shadow-sky-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>{isResetMode ? '正在發送重設信…' : '正在安全登入…'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isResetMode ? '寄送重設密碼連結' : '進入系統'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                {isResetMode && (
                  <button
                    type="button"
                    onClick={leaveResetMode}
                    className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    ← 返回帳號密碼登入
                  </button>
                )}
              </form>

              {/* Account Provision Notice */}
              {!isResetMode && (
                <div className="mt-8 pt-5 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                    如需開通或新增後台帳號，請聯繫系統管理員
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
