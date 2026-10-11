import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfServiceModal } from './TermsOfServiceModal';

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
}

// Landing copy lives here (like the policy modals) instead of the shared locale files,
// so marketing text can change without touching app translations.
const COPY = {
  bg: {
    login: 'Вход',
    register: 'Регистрация',
    badge: 'Безплатно · Работи на телефон и компютър',
    heroTitle: 'Здравето на кучето ти.',
    heroHighlight: 'Винаги под ръка.',
    heroSubtitle:
      'eDog пази ваксините, прегледите, лекарствата и паспорта на кучето ти на едно място — и ти напомня навреме, преди да е станало късно.',
    ctaPrimary: 'Започни безплатно',
    ctaSecondary: 'Вече имам профил',
    trust: ['Без кредитна карта', 'Регистрация за 1 минута', 'На български'],
    mock: {
      name: 'Макс',
      breed: 'Бигъл · 3 г.',
      reminder: 'Ваксина срещу бяс',
      reminderWhen: 'след 5 дни',
      walk: 'Разходка днес',
      walkValue: '3.2 км · 41 мин',
      weight: 'Тегло',
      weightValue: '12.4 кг',
      passport: 'Паспорт',
      passportValue: 'Актуален',
    },
    featuresTitle: 'Всичко за кучето ти — без тетрадки и забравени дати',
    featuresSubtitle: 'Един профил, който расте заедно с твоя любимец.',
    features: [
      { icon: 'notifications_active', title: 'Напомняния навреме', text: 'Ваксини, обезпаразитяване и лекарства — eDog ти напомня, преди да изтече срокът.' },
      { icon: 'badge', title: 'Дигитален паспорт', text: 'Всички данни, ваксини и микрочип в един паспорт. Изтегли го като PDF за пътуване или ветеринар.' },
      { icon: 'qr_code_2', title: 'QR код за изгубено куче', text: 'Сложи QR кода на нашийника — който намери кучето, вижда как да се свърже с теб.' },
      { icon: 'route', title: 'GPS разходки', text: 'Записвай разходките, разстоянието и активността и следи дали кучето се движи достатъчно.' },
      { icon: 'monitor_heart', title: 'Здравна история', text: 'Прегледи, алергии, тегло и хранене — винаги под ръка, когато ветеринарят пита.' },
      { icon: 'receipt_long', title: 'Разходи', text: 'Колко харчиш за храна, ветеринар и аксесоари — по месеци и категории.' },
    ],
    stepsTitle: 'Как работи',
    steps: [
      { title: 'Създай профил', text: 'Безплатна регистрация с имейл — отнема минута.' },
      { title: 'Добави кучето си', text: 'Име, порода, снимка и ваксините от паспорта.' },
      { title: 'Спокойствие', text: 'eDog ти напомня за всичко важно навреме.' },
    ],
    lostTitle: 'Ако кучето се изгуби, всяка минута е важна',
    lostText:
      'Всяко куче в eDog има публичен профил с QR код. Принтирай го или го сложи на медальона — човекът, който го намери, сканира с телефона си и веднага вижда кой е стопанинът.',
    lostCta: 'Създай QR профил',
    faqTitle: 'Често задавани въпроси',
    faq: [
      { q: 'eDog безплатно ли е?', a: 'Да. Регистрацията и всички функции за грижа за кучето са безплатни.' },
      { q: 'Трябва ли да инсталирам приложение?', a: 'Не е задължително — eDog работи в браузъра на телефон и компютър. Можеш да го добавиш на началния екран като приложение с едно докосване.' },
      { q: 'Мога ли да добавя повече от едно куче?', a: 'Да. Можеш да добавиш всичките си кучета и да превключваш между тях.' },
      { q: 'Какво става с данните ми?', a: 'Данните ти се пазят защитено и не се споделят с трети страни. Само публичният QR профил на кучето е видим за други — и то само ако го споделиш.' },
      { q: 'Мога ли да ползвам eDog за пътуване в чужбина?', a: 'Да — дигиталният паспорт събира ваксините и микрочипа на едно място и може да се изтегли като PDF.' },
    ],
    finalTitle: 'Започни да се грижиш по-лесно още днес',
    finalText: 'Безплатно е и отнема по-малко от минута.',
    privacy: 'Поверителност',
    terms: 'Условия за ползване',
    rights: 'Всички права запазени.',
    breedsLink: 'Породи кучета',
    articlesLink: 'Статии',
  },
  en: {
    login: 'Log in',
    register: 'Sign up',
    badge: 'Free · Works on phone and desktop',
    heroTitle: "Your dog's health.",
    heroHighlight: 'Always at hand.',
    heroSubtitle:
      "eDog keeps your dog's vaccinations, vet visits, medication and passport in one place — and reminds you before anything is overdue.",
    ctaPrimary: 'Get started free',
    ctaSecondary: 'I already have an account',
    trust: ['No credit card', 'Sign up in 1 minute', 'Bulgarian & English'],
    mock: {
      name: 'Max',
      breed: 'Beagle · 3 y',
      reminder: 'Rabies vaccine',
      reminderWhen: 'in 5 days',
      walk: 'Walk today',
      walkValue: '3.2 km · 41 min',
      weight: 'Weight',
      weightValue: '12.4 kg',
      passport: 'Passport',
      passportValue: 'Up to date',
    },
    featuresTitle: 'Everything about your dog — no notebooks, no missed dates',
    featuresSubtitle: 'One profile that grows with your companion.',
    features: [
      { icon: 'notifications_active', title: 'Timely reminders', text: 'Vaccines, deworming and medication — eDog reminds you before they are due.' },
      { icon: 'badge', title: 'Digital passport', text: 'Details, vaccines and microchip in one passport. Download it as a PDF for travel or the vet.' },
      { icon: 'qr_code_2', title: 'Lost-dog QR code', text: "Put the QR code on the collar — whoever finds your dog sees how to reach you." },
      { icon: 'route', title: 'GPS walks', text: 'Track walks, distance and activity and make sure your dog moves enough.' },
      { icon: 'monitor_heart', title: 'Health history', text: 'Vet visits, allergies, weight and nutrition — ready whenever the vet asks.' },
      { icon: 'receipt_long', title: 'Expenses', text: 'See what you spend on food, vet and accessories by month and category.' },
    ],
    stepsTitle: 'How it works',
    steps: [
      { title: 'Create an account', text: 'Free email sign-up — takes a minute.' },
      { title: 'Add your dog', text: 'Name, breed, photo and the vaccines from the passport.' },
      { title: 'Relax', text: 'eDog reminds you about everything important on time.' },
    ],
    lostTitle: 'If your dog gets lost, every minute counts',
    lostText:
      "Every dog in eDog gets a public profile with a QR code. Print it or put it on the tag — whoever finds your dog scans it with their phone and immediately sees who the owner is.",
    lostCta: 'Create a QR profile',
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'Is eDog free?', a: 'Yes. Sign-up and all dog-care features are free.' },
      { q: 'Do I need to install an app?', a: 'No — eDog runs in the browser on phone and desktop. You can add it to your home screen like an app with one tap.' },
      { q: 'Can I add more than one dog?', a: 'Yes. Add all your dogs and switch between them.' },
      { q: 'What happens to my data?', a: "Your data is stored securely and never shared with third parties. Only your dog's public QR profile is visible to others — and only if you share it." },
      { q: 'Can I use eDog when travelling abroad?', a: 'Yes — the digital passport keeps vaccines and microchip in one place and can be downloaded as a PDF.' },
    ],
    finalTitle: 'Start caring the easy way today',
    finalText: 'It is free and takes less than a minute.',
    privacy: 'Privacy',
    terms: 'Terms of use',
    rights: 'All rights reserved.',
    breedsLink: 'Dog breeds (BG)',
    articlesLink: 'Articles (BG)',
  },
};

const HERO_IMG = '/auth-login-light.png';

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{name}</span>
);

const primaryBtn =
  'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#005da7]/20';

export const Landing: React.FC<LandingProps> = ({ onLogin, onRegister }) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === 'en' ? 'en' : 'bg';
  const c = COPY[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbf9f8] dark:bg-[#111316] text-[#1b1c1b] dark:text-[#e2e2e6] font-jakarta overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#fbf9f8]/85 dark:bg-[#111316]/85 backdrop-blur border-b border-[#e4e2e1]/60 dark:border-[#2a2d31]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo-header.png" alt="" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-[#005da7] dark:text-[#a4c9ff]">eDog</span>
          </a>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => i18n.changeLanguage(lang === 'bg' ? 'en' : 'bg')}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg text-[#414751] dark:text-[#c1c7d3] hover:bg-[#f0eeed] dark:hover:bg-[#1e2023]"
              aria-label="Language"
            >
              {lang === 'bg' ? 'EN' : 'БГ'}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg text-[#005da7] dark:text-[#a4c9ff] hover:bg-[#005da7]/5"
            >
              {c.login}
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="px-3 sm:px-4 py-2 text-sm font-bold rounded-lg bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:brightness-110"
            >
              {c.register}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0d3556] dark:bg-[#0c1622] text-white">
          {/* Dog photo: right half on desktop, full background on mobile. Anchored to the
              bottom and slightly scaled so the stray AI text at the top of the image is cropped. */}
          <div className="absolute inset-y-0 right-0 w-full md:w-[62%]" aria-hidden="true">
            <img src={HERO_IMG} alt="" className="w-full h-full object-cover object-bottom scale-[1.15] origin-bottom" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d3556]/80 via-[#0d3556]/70 to-[#0d3556]/95 dark:from-[#0c1622]/85 dark:via-[#0c1622]/75 dark:to-[#0c1622]/95 md:hidden" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#0d3556] from-[38%] via-[#0d3556]/70 via-[55%] to-transparent dark:from-[#0c1622] dark:via-[#0c1622]/70" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d3556]/60 dark:from-[#0c1622]/70 to-transparent" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 items-center md:min-h-[620px]">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-bold mb-6 backdrop-blur">
                <Icon name="pets" className="text-[16px]" />
                {c.badge}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
                {c.heroTitle}
                <br />
                <span className="text-[#a4c9ff]">{c.heroHighlight}</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl">{c.heroSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  type="button"
                  onClick={onRegister}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffffff] text-[#005da7] font-bold text-sm hover:brightness-95 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
                >
                  {c.ctaPrimary}
                  <Icon name="arrow_forward" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/25 hover:bg-white/15 backdrop-blur transition-colors"
                >
                  {c.ctaSecondary}
                </button>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
                {c.trust.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Icon name="check_circle" className="text-[18px] text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Floating app "notifications" over the photo (illustrative data, no real user) */}
            <div className="relative hidden md:block h-full min-h-[420px]" aria-hidden="true">
              <div className="absolute right-0 top-4 flex items-center gap-3 rounded-2xl bg-white/95 dark:bg-[#1a1c1f]/95 text-[#1b1c1b] dark:text-[#e2e2e6] shadow-2xl shadow-black/25 px-4 py-3 backdrop-blur">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd798] to-[#f0a640] flex items-center justify-center">
                  <Icon name="pets" className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">{c.mock.name}</p>
                  <p className="text-xs text-[#717783] dark:text-[#8b919d]">{c.mock.breed}</p>
                </div>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                  {c.mock.passport}: {c.mock.passportValue}
                </span>
              </div>

              <div className="absolute left-0 bottom-24 w-72 rounded-2xl bg-white/95 dark:bg-[#1a1c1f]/95 text-[#1b1c1b] dark:text-[#e2e2e6] shadow-2xl shadow-black/25 p-4 flex items-center gap-3 backdrop-blur">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                  <Icon name="vaccines" className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{c.mock.reminder}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">{c.mock.reminderWhen}</p>
                </div>
                <Icon name="notifications_active" className="text-amber-600 dark:text-amber-400" />
              </div>

              <div className="absolute right-6 bottom-4 rounded-2xl bg-white/95 dark:bg-[#1a1c1f]/95 text-[#1b1c1b] dark:text-[#e2e2e6] shadow-2xl shadow-black/25 px-4 py-3 flex items-center gap-3 backdrop-blur">
                <Icon name="route" className="text-[#005da7] dark:text-[#a4c9ff]" />
                <div>
                  <p className="text-xs text-[#717783] dark:text-[#8b919d]">{c.mock.walk}</p>
                  <p className="font-bold text-sm">{c.mock.walkValue}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#15171a] border-y border-[#e4e2e1]/70 dark:border-[#2a2d31]/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{c.featuresTitle}</h2>
              <p className="text-lg text-[#414751] dark:text-[#c1c7d3]">{c.featuresSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {c.features.map((f) => (
                <article
                  key={f.title}
                  className="rounded-2xl p-6 bg-[#fbf9f8] dark:bg-[#1a1c1f] border border-[#e4e2e1]/70 dark:border-[#2a2d31]"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 flex items-center justify-center mb-4">
                    <Icon name={f.icon} className="text-[#005da7] dark:text-[#a4c9ff]" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-[#414751] dark:text-[#c1c7d3] leading-relaxed">{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Steps ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">{c.stepsTitle}</h2>
          <ol className="grid md:grid-cols-3 gap-5">
            {c.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="shrink-0 w-10 h-10 rounded-full bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-[#414751] dark:text-[#c1c7d3]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Lost dog / QR ──────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
          <div className="rounded-3xl bg-gradient-to-br from-[#005da7] to-[#003a6b] text-white p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{c.lostTitle}</h2>
              <p className="text-white/80 leading-relaxed max-w-2xl mb-6">{c.lostText}</p>
              <button
                type="button"
                onClick={onRegister}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffffff] text-[#005da7] font-bold text-sm hover:brightness-95"
              >
                <Icon name="qr_code_2" className="text-[18px]" />
                {c.lostCta}
              </button>
            </div>
            <div className="hidden md:flex w-36 h-36 rounded-3xl bg-white/10 items-center justify-center">
              <Icon name="qr_code_scanner" className="text-[80px] text-white/90" />
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-[#15171a] border-y border-[#e4e2e1]/70 dark:border-[#2a2d31]/70">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">{c.faqTitle}</h2>
            <div className="divide-y divide-[#e4e2e1] dark:divide-[#2a2d31]">
              {c.faq.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold"
                    >
                      {item.q}
                      <Icon name={open ? 'remove' : 'add'} className="text-[#005da7] dark:text-[#a4c9ff] shrink-0" />
                    </button>
                    {open && <p className="pb-5 -mt-1 text-[#414751] dark:text-[#c1c7d3] leading-relaxed">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{c.finalTitle}</h2>
          <p className="text-lg text-[#414751] dark:text-[#c1c7d3] mb-8">{c.finalText}</p>
          <button type="button" onClick={onRegister} className={primaryBtn}>
            {c.ctaPrimary}
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </section>
      </main>

      <footer className="border-t border-[#e4e2e1] dark:border-[#2a2d31]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#717783] dark:text-[#8b919d]">
          <p>© {new Date().getFullYear()} eDog. {c.rights}</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {/* Plain links to the static SEO pages (also helps search engines discover them) */}
            <a href="/porodi/" className="hover:text-[#005da7] dark:hover:text-[#a4c9ff]">{c.breedsLink}</a>
            <a href="/statii/" className="hover:text-[#005da7] dark:hover:text-[#a4c9ff]">{c.articlesLink}</a>
            <button type="button" onClick={() => setShowPrivacy(true)} className="hover:text-[#005da7] dark:hover:text-[#a4c9ff]">{c.privacy}</button>
            <button type="button" onClick={() => setShowTerms(true)} className="hover:text-[#005da7] dark:hover:text-[#a4c9ff]">{c.terms}</button>
          </div>
        </div>
      </footer>

      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsOfServiceModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};
