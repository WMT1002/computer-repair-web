import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  User,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

const DEFAULT_ROLE_CODE = 1; // 預設為一般工程師

function authMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return '這個 Email 已經註冊過，請直接登入或使用忘記密碼。';
  }
  if (lower.includes('password')) {
    return '密碼不符合系統要求，請確認至少 8 碼並包含英文與數字。';
  }
  if (lower.includes('email')) {
    return 'Email 格式或驗證狀態有問題，請確認後再試。';
  }
  if (lower.includes('rate limit')) {
    return '驗證信寄送太頻繁，請稍後再試。';
  }
  return message || '註冊失敗，請稍後再試。';
}

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function calculatePasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const strength = calculatePasswordStrength(form.password);
  const passwordIssues = useMemo(() => {
    const issues: string[] = [];
    if (form.password.length < 8) issues.push('至少 8 碼');
    if (!/[A-Za-z]/.test(form.password)) issues.push('包含英文字母');
    if (!/[0-9]/.test(form.password)) issues.push('包含數字');
    return issues;
  }, [form.password]);

  const canSubmit =
    form.name.trim().length >= 2 &&
    validateEmail(form.email) &&
    passwordIssues.length === 0 &&
    form.password === form.confirm &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.name.trim().length < 2) {
      setErrorMsg('請輸入至少 2 個字的姓名或工程師稱呼。');
      return;
    }
    if (!validateEmail(form.email)) {
      setErrorMsg('請輸入有效的電子郵件地址 (Email)。');
      return;
    }
    if (passwordIssues.length > 0) {
      setErrorMsg(`密碼需要${passwordIssues.join('、')}。`);
      return;
    }
    if (form.password !== form.confirm) {
      setErrorMsg('兩次輸入的密碼不一致，請再次確認。');
      return;
    }

    setLoading(true);
    const email = form.email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            name: form.name.trim(),
            role_code: DEFAULT_ROLE_CODE,
          },
        },
      });

      setLoading(false);

      if (error) {
        setErrorMsg(authMessage(error.message));
        return;
      }

      setRegisteredEmail(email);

      // If user session is immediately created (e.g. email confirmation disabled in Supabase)
      if (data.session) {
        // Automatically handled by AuthContext listener
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || '註冊過程中發生錯誤，請稍後再試。');
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResending(true);
    setErrorMsg('');
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      setResending(false);
      if (error) {
        setErrorMsg(authMessage(error.message));
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setResending(false);
      setErrorMsg(err.message || '重寄驗證信失敗。');
    }
  };

  const strengthLabels = ['', '強度偏弱', '強度普通', '強度良好', '強度極佳'];
  const strengthColors = ['bg-slate-700', 'bg-red-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0b1329] relative overflow-hidden">
      {/* Background Cyber Accents */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 -bottom-28 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative w-full max-w-[1080px] grid lg:grid-cols-[1fr_1.15fr] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Visual Card */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-950 via-[#0d1f38] to-[#122847] border-r border-slate-700/60 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/25">
              <Wrench className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-white">電腦維修管理系統</div>
              <div className="text-xs text-sky-300 font-mono">REPAIR CLOUD AUTH PLATFORM</div>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> 建立新工程師 / 管理員帳號
            </div>
            <h1 className="text-3xl font-black text-white leading-tight mb-4">
              加入維修管理平台
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                掌握維修單、客戶與報價
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              註冊後自動建立標準工程師權限。系統管理員可在後台指派更高層級的管理與營運權限，確保資料存取安全。
            </p>

            <div className="space-y-3">
              {[
                'Supabase Auth 高安全加密註冊',
                '支援自動 Email 驗證機制',
                '自動建立雲端工程師設定檔 (Profile)',
                '嚴格的角色權限與維修紀錄隔離',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 權限安全防護
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              公開註冊預設為「一般工程師」權限；高階「系統管理員」或「維修主管」角色由後台專用面板審核指派。
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
          {registeredEmail ? (
            /* Registration Success View */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-100 mb-2">註冊信已送出</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
                我們已請 Supabase Auth 寄送驗證信至{' '}
                <strong className="text-sky-400 font-mono">{registeredEmail}</strong>。
                請至您的電子信箱點擊驗證連結以啟用帳號。
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-300 leading-relaxed mb-6">
                💡 <strong>提示：</strong> 若尚未收到信件，請檢查垃圾郵件資料夾，或點擊下方按鈕重新寄送。
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs mb-4">
                  ✅ 驗證信已重新寄出，請稍後檢查信箱。
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs mb-4 text-left">
                  {errorMsg}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCcw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? '寄送中…' : '重寄驗證信'}
                </button>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  前往登入
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> 建立新使用者帳號
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-1">
                  註冊維修系統帳號
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  請填寫基本資訊與密碼以建立登入身分
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                  <div className="font-bold shrink-0">⚠️ 錯誤：</div>
                  <div>{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    使用者姓名 / 工程師名稱 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="例：王大明 / 維修部 Jack"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

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
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-sm outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      設定密碼 <span className="text-red-400">*</span>
                    </label>
                    {form.password && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {strengthLabels[strength]}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="至少 8 碼，包含英文與數字"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-sm outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {form.password && (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            strength >= step ? strengthColors[strength] : 'bg-slate-700/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Password Checklist */}
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        form.password.length >= 8
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Check className="w-3 h-3" /> 至少 8 碼
                    </span>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        /[A-Za-z]/.test(form.password)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Check className="w-3 h-3" /> 英文字母
                    </span>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                        /[0-9]/.test(form.password)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Check className="w-3 h-3" /> 包含數字
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    確認密碼 <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="請再次輸入密碼"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 rounded-xl text-slate-100 text-sm outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-[11px] text-red-400 mt-1">兩次輸入的密碼不相符</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>正在建立帳號…</span>
                    </>
                  ) : (
                    <>
                      <span>完成註冊並送出</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Switch */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  已經有帳號了嗎？{' '}
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sky-400 hover:text-sky-300 font-bold underline ml-1 cursor-pointer"
                  >
                    直接登入
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
