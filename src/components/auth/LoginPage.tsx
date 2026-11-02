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
  if (lower.includes('fetch') || lower.includes('network')) {
    return '目前無法連線至登入服務，請稍後再試。若持續發生，請聯繫管理員確認服務狀態。';
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
        setErrorMsg(authErrorMessage(err.message));
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
      setErrorMsg(authErrorMessage(err.message));
    }
  };

  const leaveResetMode = () => {
    setIsResetMode(false);
    setResetSent(false);
    setErrorMsg('');
  };

  return (
    <div className="auth-page min-h-[100dvh] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#0b1329] relative overflow-x-hidden overflow-y-auto">
      <div className="auth-card relative w-full max-w-[960px] my-auto grid lg:grid-cols-[0.9fr_1.1fr] border rounded-xl overflow-hidden">
        <aside className="auth-intro hidden lg:flex flex-col justify-between p-10 border-r">
          <div className="flex items-center gap-3">
            <FixFlowLogo className="w-8 h-8" />
            <span className="text-xl font-semibold tracking-tight">FixFlow</span>
          </div>
          <div className="py-16">
            <p className="text-xs tracking-widest mb-4 auth-muted">電腦維修管理系統</p>
            <h1 className="text-3xl font-semibold leading-relaxed mb-5">每一筆維修，<br />清楚掌握。</h1>
            <p className="text-sm leading-7 auth-muted">從收件、報價到交付，<br />集中管理客戶資料與維修進度。</p>
            <div className="mt-8 pt-6 border-t text-sm auth-muted">維修紀錄 <span className="mx-2">/</span> 零件保固 <span className="mx-2">/</span> 營業報表</div>
          </div>
          <p className="text-xs auth-muted">FixFlow · 門市工作平台</p>
        </aside>

        {/* Right Form Card */}
        <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto">
          {resetSent ? (
            /* Reset Link Sent Screen */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-100 mb-2">密碼重設信已寄出</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                我們已將重設密碼連結發送至 <strong className="text-sky-400 font-mono">{email}</strong>。
                請點擊信中連結設定新密碼。
              </p>
              <button
                type="button"
                onClick={leaveResetMode}
                className="primary-button w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-100 text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                返回登入頁面
              </button>
            </div>
          ) : (
            /* Login or Forgot Password Form */
            <div>
              {/* Mobile Brand Header */}
              <div className="flex lg:hidden items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
                <div className="w-10 h-10 rounded-xl bg-slate-800 p-2 flex items-center justify-center text-slate-100 shadow-md shrink-0">
                  <FixFlowLogo className="w-full h-full text-slate-100" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wider text-white flex items-center gap-1">
                    <span className="text-slate-100">FixFlow</span>
                    <span>維修管理系統</span>
                  </div>
                  <div className="text-[calc(10px*var(--ui-text-scale))] text-sky-300 font-mono">電腦維修管理系統</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isResetMode ? '找回帳號密碼' : '員工登入'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100 mb-1">
                  {isResetMode ? '重設您的密碼' : '登入維修系統'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {isResetMode
                    ? '請輸入註冊時使用的 Email，我們將發送安全重設連結'
                    : '使用您的工作帳號登入。'}
                </p>
              </div>

              {errorMsg && (
                <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                  <div className="font-bold shrink-0">登入提示</div>
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-slate-300 mb-1.5">
                    電子郵件 (Email 帳號) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      id="login-email"
                      autoComplete="username"
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
                      <label htmlFor="login-password" className="text-xs font-bold text-slate-300">
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
                        id="login-password"
                        autoComplete="current-password"
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
                        aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                        aria-pressed={showPassword}
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
                  className="primary-button w-full mt-4 py-3 px-4 rounded-xl bg-slate-800 active:scale-[0.98] text-slate-100 font-bold text-base sm:text-sm min-h-[48px] shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>{isResetMode ? '正在發送重設信…' : '登入中…'}</span>
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
