import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { resolveUploadUrl } from '../lib/uploadUrl';
import { useTranslation } from 'react-i18next';

interface Dog {
  id: string;
  name: string;
  breed: string;
  date_of_birth: string;
  weight: string;
  profile_picture?: string;
  is_lost?: boolean;
}

interface Owner {
  name: string;
  phone: string;
  email?: string;
}

export const PublicDogProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<Dog | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/dog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDog(data.dog);
        setOwner(data.owner);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9fc] dark:bg-[#000a14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#005da7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 dark:text-[#717783] text-sm font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="min-h-screen bg-[#f9f9fc] dark:bg-[#000a14] flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400 text-lg font-medium">{t('dogNotFound')}</p>
      </div>
    );
  }

  const age = calculateAge(dog.date_of_birth);

  const Avatar = ({ size }: { size: 'sm' | 'lg' }) => {
    const cls = size === 'sm'
      ? 'w-full h-full bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center text-white text-xs font-bold'
      : 'w-full h-full bg-gradient-to-br from-[#005da7] to-[#0090e7] flex items-center justify-center text-white text-7xl font-extrabold';
    if (dog.profile_picture) {
      return <img src={resolveUploadUrl(dog.profile_picture)} alt={dog.name} className="w-full h-full object-cover" />;
    }
    return <div className={cls}>{dog.name.charAt(0).toUpperCase()}</div>;
  };

  return (
    <div className="min-h-screen bg-[#f9f9fc] dark:bg-[#000a14] flex flex-col font-jakarta text-gray-900 dark:text-[#f9f9fc]">

      {/* Fixed top nav */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-14 bg-[#f9f9fc]/90 dark:bg-[#000a14]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2D3748]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#005da7] flex-shrink-0">
            <Avatar size="sm" />
          </div>
          <span className="text-base font-bold text-[#005da7]">{dog.name}'s Profile</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-bold text-[#005da7]">{t('profile')}</span>
        </div>
      </nav>

      {/* Main content */}
      <main className="mt-14 flex-grow flex justify-center px-4 md:px-0">
        <div className="w-full max-w-[720px] py-10 flex flex-col gap-8">

          {/* Asymmetric desktop grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Left column: photo + identity card */}
            <div className="md:col-span-7 flex flex-col gap-3">
              {/* Dog photo */}
              <div className="aspect-square w-full rounded-xl overflow-hidden border border-gray-200 dark:border-[#2D3748] bg-gray-100 dark:bg-[#111316]">
                <Avatar size="lg" />
              </div>

              {/* Identity card */}
              <div className="p-6 rounded-xl border border-gray-200 dark:border-[#2D3748] bg-white dark:bg-[#001c39]/30">
                <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-[#f9f9fc] mb-5">
                  {dog.name}
                </h1>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-[#717783] uppercase tracking-wider mb-1">
                      {t('breed')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#f9f9fc]">{dog.breed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-[#717783] uppercase tracking-wider mb-1">
                      {t('age')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#f9f9fc]">
                      {age} {t('years')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-[#717783] uppercase tracking-wider mb-1">
                      {t('weight')}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-[#f9f9fc]">
                      {dog.weight} {t('kg')}
                    </p>
                  </div>
                  {dog.is_lost && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-[#717783] uppercase tracking-wider mb-1">
                        {t('status')}
                      </p>
                      <span className="inline-block mt-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800/40">
                        {t('missing')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: contact + branding */}
            <div className="md:col-span-5 flex flex-col gap-4">

              {/* Emergency contact card */}
              {owner && (
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-[#f0f7ff]/5 border border-gray-200 dark:border-[#2D3748] flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="material-symbols-outlined text-[#005da7]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      contact_emergency
                    </span>
                    <h2 className="text-lg font-bold text-[#005da7]">{t('emergencyContact')}</h2>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-full bg-[#005da7]/10 dark:bg-[#005da7]/20 border border-[#005da7]/20 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-[#005da7]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900 dark:text-[#f9f9fc]">{owner.name}</p>
                      <p className="text-xs text-gray-400 dark:text-[#717783]">{t('primaryOwner')}</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${owner.phone}`}
                    className="flex items-center justify-center gap-2 w-full h-12 bg-[#005da7] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                    {t('callOwner')}
                  </a>

                  {owner.email && (
                    <a
                      href={`mailto:${owner.email}`}
                      className="flex items-center justify-center gap-2 w-full h-12 bg-gray-200 dark:bg-[#2D3748] text-gray-800 dark:text-white font-bold rounded-lg hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                      {t('emailOwner')}
                    </a>
                  )}

                  <div className="text-center mt-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-[#717783]">{owner.phone}</p>
                  </div>
                </div>
              )}

              {/* eDog branding card */}
              <div className="p-5 rounded-xl border border-gray-200 dark:border-[#2D3748] bg-white dark:bg-[#000a14] text-center flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-gradient-to-br from-[#005da7] to-[#0090e7] rounded-xl flex items-center justify-center shadow-sm mb-1">
                  <img src="/logo-header.png" alt="eDog" className="w-6 h-6 object-contain" />
                </div>
                <p className="text-base font-bold text-[#005da7]">eDog</p>
                <p className="text-xs text-gray-400 dark:text-[#717783]">{t('criticalPetInfoHub')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center justify-center gap-1.5 px-4 py-6 border-t border-gray-200 dark:border-[#2D3748] bg-[#f9f9fc] dark:bg-[#000a14]">
        <p className="text-sm font-bold text-[#005da7]">eDog</p>
        <p className="text-xs text-gray-400 dark:text-[#717783]">© 2024 eDog – {t('criticalPetInfoHub')}</p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs text-gray-400 dark:text-[#717783] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors cursor-pointer">
            {t('privacyPolicy')}
          </span>
          <span className="text-xs text-gray-400 dark:text-[#717783] hover:text-[#005da7] dark:hover:text-[#a4c9ff] transition-colors cursor-pointer">
            {t('helpCenter')}
          </span>
        </div>
      </footer>
    </div>
  );
};
