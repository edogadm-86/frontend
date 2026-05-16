import React from 'react';
import { useTranslation } from 'react-i18next';

interface ShopViewProps {
  onNavigate: (view: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center p-8 min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-[#282a2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-gray-400 dark:text-[#414751] text-[32px]">storefront</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">{t('shopServices')}</h2>
        <p className="text-sm text-gray-500 dark:text-[#8b919d]">{t('comingSoon', 'Coming soon')}</p>
      </div>
    </div>
  );
};
