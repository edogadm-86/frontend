import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, X } from 'lucide-react';
import { apiClient } from '../lib/api';
import { useApp } from '../context/AppContext';

interface WalkCompetitionOptInProps {
  onDismiss: () => void;
}

export const WalkCompetitionOptIn: React.FC<WalkCompetitionOptInProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const { setUserOptIn } = useApp();
  const [loading, setLoading] = useState(false);

  const handleChoice = async (opted_in: boolean) => {
    setLoading(true);
    try {
      await apiClient.updateWalkCompetitionOptIn(opted_in);
      setUserOptIn(opted_in);
    } catch { /* silent — local state already updated */ }
    finally {
      setLoading(false);
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-[#1e2023] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#005da7] to-[#003d73] p-6 text-white">
          <button
            onClick={() => handleChoice(false)}
            disabled={loading}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
            <Trophy size={24} className="text-amber-300" />
          </div>
          <h2 className="text-lg font-extrabold leading-snug">{t('competitionOptInTitle')}</h2>
          <p className="text-sm text-white/80 mt-1">{t('competitionOptInSubtitle')}</p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-[#8b919d] leading-relaxed">
            {t('competitionOptInDescription')}
          </p>

          <ul className="space-y-2">
            {['competitionPerk1', 'competitionPerk2', 'competitionPerk3'].map(key => (
              <li key={key} className="flex items-start gap-2 text-sm text-gray-700 dark:text-[#e2e2e6]">
                <span className="text-amber-500 mt-0.5">✦</span>
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-400 dark:text-[#8b919d]">{t('competitionPrivacyNote')}</p>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => handleChoice(true)}
              disabled={loading}
              className="w-full py-3 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Trophy size={16} />
              {t('joinCompetition')}
            </button>
            <button
              onClick={() => handleChoice(false)}
              disabled={loading}
              className="w-full py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#8b919d] rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-all"
            >
              {t('skipForNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
