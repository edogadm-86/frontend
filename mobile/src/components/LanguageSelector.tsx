import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Globe size={16} className="text-gray-600" />
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blueblue-500"
        >
          <option value="en">{t('english')}</option>
          <option value="bg">{t('bulgarian')}</option>
        </select>
      </div>
    </div>
  );
};