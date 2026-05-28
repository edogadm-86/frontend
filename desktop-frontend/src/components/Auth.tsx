import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { apiClient } from '../lib/api';
import { useTheme } from '../hooks/useTheme';

// Dog hero images — taken directly from the design files
const IMG_LOGIN_LIGHT  = '/auth-login-light.png';
const IMG_LOGIN_DARK   = '/auth-login-dark.png';
const IMG_SIGNUP_LIGHT = '/auth-signup-light.png';
const IMG_SIGNUP_DARK  = '/auth-signup-dark.png';

interface AuthProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (userData: { name: string; email: string; password: string }) => Promise<void>;
  awaitingVerification?: boolean;
  pendingVerificationEmail?: string | null;
  onResendVerification?: (email: string) => Promise<void>;
  onCancelVerification?: () => void;
}


export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, awaitingVerification, pendingVerificationEmail, onResendVerification, onCancelVerification }) => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const loginDisabled = !formData.email.trim() || !formData.password.trim();
  const registerDisabled = !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignUp) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError(t('allFieldsRequired'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('passwordsDoNotMatch'));
        return;
      }
      if (formData.password.length < 8) {
        setError(t('passwordTooShort'));
        return;
      }
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        setError(t('allFieldsRequired'));
        return;
      }
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await onRegister({ name: formData.name, email: formData.email, password: formData.password });
      } else {
        await onLogin({ email: formData.email, password: formData.password });
      }
    } catch (err: any) {
      setError(isSignUp ? (err.message || t('error')) : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.forgotPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch {
      setError(t('resetLinkError'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setForgotMode(false);
    setError(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openForgot = () => {
    setForgotMode(true);
    setForgotSuccess(false);
    setForgotEmail('');
    setError(null);
  };

  const closeForgot = () => {
    setForgotMode(false);
    setForgotSuccess(false);
    setError(null);
  };

  const inputClass =
    'w-full py-3.5 bg-[#f5f3f2] dark:bg-[#1a1c1f] border-0 rounded-xl text-base text-[#1b1c1b] dark:text-[#e2e2e6] placeholder:text-[#717783] dark:placeholder:text-[#8b919d] focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] outline-none transition-all duration-200';

  const langSelector = (
    <div className="absolute top-6 right-6">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="text-sm bg-[#f5f3f2] dark:bg-[#1e2023] text-[#414751] dark:text-[#c1c7d3] border-0 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] outline-none cursor-pointer"
      >
        <option value="en">{t('english')}</option>
        <option value="bg">{t('bulgarian')}</option>
      </select>
    </div>
  );


  const errorBanner = error && (
    <div className="w-full mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-[#93000a]/20 border border-red-200 dark:border-red-900">
      <p className="text-sm text-red-600 dark:text-[#ffb4ab]">{error}</p>
    </div>
  );

  const ambientGlow = (
    <>
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] opacity-[0.04] dark:opacity-[0.08] blur-[120px] rounded-full bg-[#005da7] dark:bg-[#a4c9ff] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] opacity-[0.03] dark:opacity-[0.05] blur-[100px] rounded-full bg-[#ffd798] pointer-events-none -translate-x-1/2 translate-y-1/2" />
    </>
  );

  // ── VERIFICATION PENDING ────────────────────────────────────────────────
  if (awaitingVerification) {
    const handleResend = async () => {
      if (!pendingVerificationEmail || !onResendVerification) return;
      setResendLoading(true);
      setResendSuccess(false);
      try {
        await onResendVerification(pendingVerificationEmail);
        setResendSuccess(true);
      } finally {
        setResendLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fbf9f8] dark:bg-[#111316] font-jakarta">
        {langSelector}
        {ambientGlow}
        <div className="w-full max-w-[440px] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-[#005da7] dark:text-[#a4c9ff]">mark_email_unread</span>
          </div>
          <h2 className="text-3xl font-bold text-[#1b1c1b] dark:text-[#e2e2e6] mb-3">
            {t('verifyEmailTitle')}
          </h2>
          <p className="text-base text-[#414751] dark:text-[#c1c7d3] mb-2">
            {t('verifyEmailSubtitle')}
          </p>
          {pendingVerificationEmail && (
            <p className="text-sm font-semibold text-[#005da7] dark:text-[#a4c9ff] mb-6">
              {pendingVerificationEmail}
            </p>
          )}
          <p className="text-sm text-[#717783] dark:text-[#8b919d] mb-8">
            {t('verifyEmailHint')}
          </p>
          {resendSuccess && (
            <div className="w-full mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">{t('verifyEmailResent')}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || resendSuccess}
            className="w-full py-4 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
          >
            {resendLoading ? t('loading') : t('verifyEmailResend')}
          </button>
          <button
            type="button"
            onClick={() => { onCancelVerification?.(); switchMode(); }}
            className="text-sm text-[#717783] dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors"
          >
            {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (!isSignUp) {
    return (
      <div className="min-h-screen flex font-jakarta overflow-hidden bg-[#fbf9f8] dark:bg-[#111316]">

        {/* Left hero */}
        <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 overflow-hidden">
          <img
            src={isDark ? IMG_LOGIN_DARK : IMG_LOGIN_LIGHT}
            alt="Golden retriever"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001c39]/80 via-[#001c39]/20 to-transparent dark:from-[#111316]/70 dark:via-[#111316]/10 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#005da7]/30 dark:to-[#111316]/40" />

          <div className="relative z-10 max-w-lg mb-12">
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              {t('heroLoginTitle').replace(t('heroLoginHighlight'), '')}{' '}
              <span className="text-[#a4c9ff]">{t('heroLoginHighlight')}</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              {t('heroLoginSubtitle')}
            </p>
          </div>
        </aside>

        {/* Right form */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 py-12 bg-white dark:bg-[#111316] relative">
          {langSelector}

          <div className="w-full max-w-[440px] flex flex-col items-center">

            {forgotMode ? (
              /* ── FORGOT PASSWORD ── */
              <>
                <div className="mb-8 w-full">
                  <h2 className="text-2xl font-semibold text-[#1b1c1b] dark:text-[#e2e2e6] mb-2">
                    {t('forgotPasswordTitle')}
                  </h2>
                  <p className="text-base text-[#414751] dark:text-[#c1c7d3]">
                    {t('forgotPasswordSubtitle')}
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="w-full px-4 py-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
                    <p className="text-sm text-green-700 dark:text-green-400">{t('resetLinkSent')}</p>
                  </div>
                ) : (
                  <>
                    {errorBanner}
                    <form onSubmit={handleForgotSubmit} className="w-full space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                          {t('email')}
                        </label>
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">mail</span>
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            placeholder={t('emailPlaceholder')}
                            className={`${inputClass} pl-11 pr-4`}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !forgotEmail.trim()}
                        className="w-full py-4 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(0,93,167,0.2)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? t('loading') : t('sendResetLink')}
                      </button>
                    </form>
                  </>
                )}

                <button
                  type="button"
                  onClick={closeForgot}
                  className="mt-6 text-sm font-medium text-[#005da7] dark:text-[#a4c9ff] hover:underline"
                >
                  {t('backToLogin')}
                </button>
              </>
            ) : (
              /* ── LOGIN FORM ── */
              <>
                {/* Brand */}
                <div className="mb-10 w-full text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <img
                      src="/logo.png"
                      alt="eDog"
                      className="w-12 h-12 object-contain rounded-xl"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="text-3xl font-bold tracking-tight text-[#005da7] dark:text-[#a4c9ff]">
                      eDog
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#1b1c1b] dark:text-[#e2e2e6] mb-2">
                    {t('welcomeBack')}
                  </h2>
                  <p className="text-base text-[#414751] dark:text-[#c1c7d3]">
                    {t('loginSubtitle')}
                  </p>
                </div>

                {errorBanner}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                      {t('email')}
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">mail</span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('emailPlaceholder')}
                        className={`${inputClass} pl-11 pr-4`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-semibold text-[#414751] dark:text-[#c1c7d3]">
                        {t('password')}
                      </label>
                      <button type="button" onClick={openForgot} className="text-xs font-medium text-[#005da7] dark:text-[#a4c9ff] hover:underline">
                        {t('forgotPassword')}
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className={`${inputClass} pl-11 pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-[#717783] dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-5 h-5 rounded border-[#c1c7d3] dark:border-[#414751] bg-[#f5f3f2] dark:bg-[#1a1c1f] text-[#005da7] focus:ring-[#005da7] dark:focus:ring-[#a4c9ff] focus:ring-offset-2 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-sm text-[#414751] dark:text-[#c1c7d3] cursor-pointer">
                      {t('keepMeSignedIn')}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || loginDisabled}
                    className="w-full py-4 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(0,93,167,0.2)] dark:shadow-[0_4px_20px_rgba(164,201,255,0.12)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? t('loading') : t('signIn')}
                  </button>
                </form>

                {/* Toggle */}
                <p className="mt-8 text-sm text-[#414751] dark:text-[#c1c7d3]">
                  {t('newToEdog')}{' '}
                  <button type="button" onClick={switchMode} className="font-semibold text-[#005da7] dark:text-[#a4c9ff] hover:underline">
                    {t('signUp')}
                  </button>
                </p>

                {/* Footer */}
                <div className="mt-8 flex gap-6">
                  <button type="button" onClick={() => setShowPrivacy(true)} className="text-xs text-[#717783] dark:text-[#8b919d] hover:text-[#1b1c1b] dark:hover:text-[#e2e2e6] transition-colors">
                    {t('privacyPolicy')}
                  </button>
                  <button type="button" onClick={() => setShowTerms(true)} className="text-xs text-[#717783] dark:text-[#8b919d] hover:text-[#1b1c1b] dark:hover:text-[#e2e2e6] transition-colors">
                    {t('termsOfService')}
                  </button>
                </div>
              </>
            )}
          </div>

          {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
          {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
          {ambientGlow}
        </main>
      </div>
    );
  }

  // ── SIGN-UP ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex font-jakarta overflow-hidden bg-[#fbf9f8] dark:bg-[#111316]">

      {/* Left hero — signup variant */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={isDark ? IMG_SIGNUP_DARK : IMG_SIGNUP_LIGHT}
          alt="Golden retriever"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#005da7]/80 via-[#005da7]/30 to-transparent dark:from-[#001229]/90 dark:via-[#001229]/40 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#003d73]/20 dark:to-[#0c0e11]/30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="eDog"
              className="w-10 h-10 object-contain rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-xl font-bold text-white tracking-tight">eDog</span>
          </div>

          {/* Bottom text + stats */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              {t('heroSignupTitle').replace(t('heroSignupHighlight'), '')}{' '}
              <span className="text-[#a4c9ff]">{t('heroSignupHighlight')}</span>
            </h1>
            <p className="text-lg text-white/75 leading-relaxed mb-10">
              {t('heroSignupSubtitle')}
            </p>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#a4c9ff]">15k+</span>
                <span className="text-xs font-medium text-white/55 uppercase tracking-widest mt-0.5">
                  {t('activePets')}
                </span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#a4c9ff]">4.9/5</span>
                <span className="text-xs font-medium text-white/55 uppercase tracking-widest mt-0.5">
                  {t('userRating')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right form */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 py-12 bg-white dark:bg-[#111316] relative overflow-y-auto">
        {langSelector}

        <div className="w-full max-w-[440px] flex flex-col items-center">

          {/* Heading */}
          <div className="mb-8 w-full">
            <h2 className="text-3xl font-bold text-[#1b1c1b] dark:text-[#e2e2e6] mb-2">
              {t('createAccount')}
            </h2>
            <p className="text-base text-[#414751] dark:text-[#c1c7d3]">
              {t('alreadyHaveAccount')}{' '}
              <button type="button" onClick={switchMode} className="font-semibold text-[#005da7] dark:text-[#a4c9ff] hover:underline">
                {t('signIn')}
              </button>
            </p>
          </div>

          {errorBanner}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                {t('name')}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">person</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className={`${inputClass} pl-11 pr-4`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                {t('email')}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">mail</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                  className={`${inputClass} pl-11 pr-4`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                {t('password')}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`${inputClass} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#717783] dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-[#717783] dark:text-[#8b919d] ml-1 mt-1">
                {t('passwordHint')}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#414751] dark:text-[#c1c7d3] ml-1">
                {t('confirmPassword')}
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">lock</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={`${inputClass} pl-11 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-[#717783] dark:text-[#8b919d] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || registerDisabled}
              className="w-full py-4 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(0,93,167,0.2)] dark:shadow-[0_4px_20px_rgba(164,201,255,0.12)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('createAccount')}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-[#717783] dark:text-[#8b919d] leading-relaxed">
            {t('bySigningUpYouAgree')}{' '}
            <button type="button" onClick={() => setShowTerms(true)} className="text-[#005da7] dark:text-[#a4c9ff] hover:underline font-medium">
              {t('termsOfService')}
            </button>{' '}
            {t('termsAnd')}{' '}
            <button type="button" onClick={() => setShowPrivacy(true)} className="text-[#005da7] dark:text-[#a4c9ff] hover:underline font-medium">
              {t('privacyPolicy')}
            </button>.
          </p>

          {/* Footer */}
          <div className="mt-8 flex gap-6">
            <a href="mailto:edog.adm@gmail.com" className="text-xs text-[#717783] dark:text-[#8b919d] hover:text-[#1b1c1b] dark:hover:text-[#e2e2e6] transition-colors">
              {t('contactSupport')}
            </a>
          </div>
        </div>

        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
        {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
        {ambientGlow}
      </main>
    </div>
  );
};
