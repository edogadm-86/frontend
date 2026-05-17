import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';

// Dog hero images — taken directly from the design files
const IMG_LOGIN_LIGHT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvMFDV927fBRHVj3bx94UJGZhUwa7rGVxHLv70DMcDFRNXfhZJCpwkytR4-5uO8npBnum21lzIRDHvQFMqMKO5wEu1M9j8syK2D04sUcyYbzmIVM5L0QisqXrXwtFjGldtchK3UmWtspSdQqffF3jFwUpP3MsaeeZfal8GnlDGDtZGwjyz-76BmuCj-agDpdbfciIuuBe98yvhraVfGuasisql1MBZfogvrJouxugdJYNpHGZmaW0yvrpCq8eD7GqdZorImliufANk';
const IMG_LOGIN_DARK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCCkdARRrxiLVPZAMZ1drqXh14osQznA_dzvRJf_JcFmK1XFAh7LuCuHBV-diJQA1ixYb0-8ZUbOwgLi0cqINwgB82ytkEbWLcZI8iqC4ksoSQVXtzRISOb5HNVguJMM4pvFRR_bg97E8PVTw0wAO6Jbofll2I3HV6oFRjvM161WNf048fa2gadbzNK2aj8xKgCY8moSJEA6lvVw4RJSVodsuNtfmFYuwhb-f3mO8qkbfRGaKWrGq_m9mSzV3LjRJknFcZUMFJwEjR6';
const IMG_SIGNUP_LIGHT =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCEvlr_WGpPnL4fFbzYVtLP3L9ebcPtJMyhDuKoUkLP-WbkaEMMfyMdoeMrecezFzDPkwJRhJuIX6KOcwfxb0tSiCxGd2j2sXEG1BTT9VNvbdNee8J0zj8W79AN2_e7G3XlmiM4zihW95yiLJCr6cIVxgImLkQIVn0uOeagknP1XBxucxXZBPkAjeoN7ZBnbAu6FQG97e2GPV1rl2ndzhbD4bMXDfLxJyi7l5zA27_ZhFauF5veYcAo3uO9llcsC70oh43SmMunosVZ';
const IMG_SIGNUP_DARK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAyjawrlHcuo2wFXALTTMQEZR9yeLB0KMlpkiKL6ISi2b8rEy8mRX4zeHz7He--zGBIIlth4cCAdpAWnz4tEYyweGaRrJ4gAhcWE0EIv3nD7E-j8d4671Km59tYGnFa0HVi6W-dwPkpmKhU8sTWvGdbgikOzt-Yt1F5zBEz6Hx2lYYNQsixEW53U81uVBviNhx2Y51GSqOnzFBch5h6S9ZMvGNS1Oqc5OE5bflgIJOmTBsABBKp7PzDSAT3Q0PXIB04ZiEIsuUv2h2y';

interface AuthProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<void>;
  onRegister: (userData: { name: string; email: string; password: string }) => Promise<void>;
}


export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const { t, i18n } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (formData.password.length < 8) throw new Error(t('passwordTooShort'));
        await onRegister({ name: formData.name, email: formData.email, password: formData.password });
      } else {
        await onLogin({ email: formData.email, password: formData.password });
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setFormData({ name: '', email: '', password: '' });
    setShowPassword(false);
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

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (!isSignUp) {
    return (
      <div className="min-h-screen flex font-jakarta overflow-hidden bg-[#fbf9f8] dark:bg-[#111316]">

        {/* Left hero */}
        <aside className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 overflow-hidden">
          {/* Dog photo — light mode */}
          <img
            src={IMG_LOGIN_LIGHT}
            alt="Golden retriever in a sunlit room"
            className="absolute inset-0 w-full h-full object-cover block dark:hidden"
          />
          {/* Dog photo — dark mode */}
          <img
            src={IMG_LOGIN_DARK}
            alt="Golden retriever cinematic portrait"
            className="absolute inset-0 w-full h-full object-cover hidden dark:block opacity-80"
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
                    required
                    placeholder="name@example.com"
                    className={`${inputClass} pl-11 pr-4`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-semibold text-[#414751] dark:text-[#c1c7d3]">
                    {t('password')}
                  </label>
                  <button type="button" className="text-xs font-medium text-[#005da7] dark:text-[#a4c9ff] hover:underline">
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-[#717783] dark:text-[#8b919d] text-[20px] pointer-events-none select-none">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
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
                disabled={loading}
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
        {/* Dog photo — light mode */}
        <img
          src={IMG_SIGNUP_LIGHT}
          alt="Happy golden retriever in a bright interior"
          className="absolute inset-0 w-full h-full object-cover block dark:hidden"
        />
        {/* Dog photo — dark mode */}
        <img
          src={IMG_SIGNUP_DARK}
          alt="Majestic golden retriever in a misty forest"
          className="absolute inset-0 w-full h-full object-cover hidden dark:block opacity-80"
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
                  required
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
                  required
                  placeholder="name@example.com"
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
                  required
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

            <button
              type="submit"
              disabled={loading}
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
