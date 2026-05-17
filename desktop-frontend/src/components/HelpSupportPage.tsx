import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, HelpCircle, Heart, Shield, Users, Book, Mail, Clock, ChevronDown, ExternalLink, Zap } from 'lucide-react';

interface HelpSupportPageProps {
  onClose: () => void;
}

const FAQ_DATA = (t: (k: string) => string) => [
  { q: t('howToAddDog'),          a: t('howToAddDogAnswer') },
  { q: t('howToExportData'),      a: t('howToExportDataAnswer') },
  { q: t('howToChangeLanguage'),  a: t('howToChangeLanguageAnswer') },
  { q: t('howToSetReminders'),    a: t('howToSetRemindersAnswer') },
  { q: t('howToGeneratePassport'),a: t('howToGeneratePassportAnswer') },
];

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-white dark:bg-[#1e2023] hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800 dark:text-[#e2e2e6]">{question}</span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 dark:text-[#8b919d] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 py-3 bg-gray-50/60 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
          <p className="text-sm text-gray-600 dark:text-[#8b919d] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onClose }) => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('gettingStarted'),
      icon: Book,
      color: 'bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 text-[#005da7] dark:text-[#a4c9ff]',
      items: [
        { title: t('addFirstDog'),          desc: t('addFirstDogDesc') },
        { title: t('setupProfile'),          desc: t('setupProfileDesc') },
        { title: t('recordVaccinations'),    desc: t('recordVaccinationsDesc') },
        { title: t('scheduleAppointments'),  desc: t('scheduleAppointmentsDesc') },
      ],
    },
    {
      title: t('healthManagement'),
      icon: Heart,
      color: 'bg-red-50 dark:bg-red-500/10 text-red-500',
      items: [
        { title: t('trackVaccinations'),    desc: t('trackVaccinationsDesc') },
        { title: t('manageHealthRecords'),  desc: t('manageHealthRecordsDesc') },
        { title: t('nutritionTracking'),    desc: t('nutritionTrackingDesc') },
        { title: t('generatePassport'),     desc: t('generatePassportDesc') },
      ],
    },
    {
      title: t('trainingFeatures'),
      icon: Shield,
      color: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
      items: [
        { title: t('aiTrainingAssistant'),  desc: t('aiTrainingAssistantDesc') },
        { title: t('trackProgress'),        desc: t('trackProgressDesc') },
        { title: t('trainingVideos'),       desc: t('trainingVideosDesc') },
        { title: t('behaviorNotes'),        desc: t('behaviorNotesDesc') },
      ],
    },
    {
      title: t('communityFeatures'),
      icon: Users,
      color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
      items: [
        { title: t('shareStories'),    desc: t('shareStoriesDesc') },
        { title: t('joinEvents'),      desc: t('joinEventsDesc') },
        { title: t('askQuestions'),    desc: t('askQuestionsDesc') },
        { title: t('connectOwners'),   desc: t('connectOwnersDesc') },
      ],
    },
  ];

  const faqs = FAQ_DATA(t);

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="font-jakarta bg-[#fbf9f8] dark:bg-[#111316] w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white dark:bg-[#1e2023] border-b border-gray-100 dark:border-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <HelpCircle size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-[#e2e2e6] leading-tight">{t('helpSupport')}</h2>
            <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t('helpSupportSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 dark:text-[#8b919d] hover:bg-gray-100 dark:hover:bg-[#282a2d] hover:text-gray-700 dark:hover:text-[#e2e2e6] transition-all flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* About */}
          <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-[#005da7] dark:text-[#a4c9ff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-1">{t('aboutEDog')}</h3>
                <p className="text-sm text-gray-500 dark:text-[#8b919d] leading-relaxed mb-3">{t('aboutEDogDescription')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Zap,    color: 'text-[#005da7] dark:text-[#a4c9ff]', label: t('comprehensiveHealthTracking') },
                    { icon: Shield, color: 'text-green-500',                      label: t('euCompliantPassports') },
                    { icon: Users,  color: 'text-purple-500',                     label: t('communitySupport') },
                    { icon: Heart,  color: 'text-red-500',                        label: t('aiPoweredInsights') },
                  ].map(({ icon: Icon, color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-xs text-gray-500 dark:text-[#8b919d]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}>
                      <Icon size={17} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">{section.title}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {section.items.map(item => (
                      <div key={item.title} className="pl-3 border-l-2 border-gray-100 dark:border-white/5">
                        <p className="text-xs font-semibold text-gray-700 dark:text-[#c1c7d3]">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-3">{t('frequentlyAskedQuestions')}</h3>
            <div className="space-y-2">
              {faqs.map(faq => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6] mb-4">{t('needMoreHelp')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50/60 dark:bg-white/[0.02] rounded-xl">
                <Mail size={22} className="text-[#005da7] dark:text-[#a4c9ff] mb-2" />
                <p className="text-xs font-semibold text-gray-700 dark:text-[#c1c7d3] mb-1">{t('emailSupport')}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b919d] mb-2">{t('emailSupportDesc')}</p>
                <a
                  href="mailto:edog.adm@gmail.com"
                  className="inline-flex items-center gap-1 text-xs text-[#005da7] dark:text-[#a4c9ff] font-medium hover:opacity-80"
                >
                  edog.adm@gmail.com <ExternalLink size={11} />
                </a>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50/60 dark:bg-white/[0.02] rounded-xl">
                <Clock size={22} className="text-[#005da7] dark:text-[#a4c9ff] mb-2" />
                <p className="text-xs font-semibold text-gray-700 dark:text-[#c1c7d3] mb-1">{t('responseTime')}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b919d] mb-2">{t('responseTimeDesc')}</p>
                <span className="text-xs font-semibold text-[#005da7] dark:text-[#a4c9ff]">{t('within24Hours')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50/60 dark:bg-white/[0.02] rounded-xl">
                <HelpCircle size={22} className="text-[#005da7] dark:text-[#a4c9ff] mb-2" />
                <p className="text-xs font-semibold text-gray-700 dark:text-[#c1c7d3] mb-1">{t('documentation')}</p>
                <p className="text-xs text-gray-400 dark:text-[#8b919d] mb-2">{t('documentationDesc')}</p>
                <span className="text-xs text-gray-400 dark:text-[#414751]">{t('within24Hours')}</span>
              </div>
            </div>
          </div>

          {/* App info */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-gray-400 dark:text-[#414751]">eDog v1.0.0 · 2025 · EU</span>
            <span className="text-xs text-gray-400 dark:text-[#414751]">edog.dogpass.net</span>
          </div>

        </div>
      </div>
    </div>
  );
};
