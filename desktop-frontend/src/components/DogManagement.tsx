import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { Dog } from '../types';
import { normalizeUploadUrl } from '../utils/urlHelpers';
import { cn } from '../lib/utils';

interface DogManagementProps {
  dogs: Dog[];
  onCreateDog: (dogData: Partial<Dog>) => Promise<Dog>;
  onUpdateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  onDeleteDog: (dogId: string) => Promise<void>;
  onSelectDog: (dog: Dog | null) => void;
  currentDog: Dog | null;
}

const cardCls = 'bg-white dark:bg-[#1e2023] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden';
const inputCls = 'w-full px-3 py-2 text-sm bg-white dark:bg-[#1a1c1f] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-[#e2e2e6] placeholder-gray-400 dark:placeholder-[#414751] focus:outline-none focus:ring-2 focus:ring-[#005da7]/30 dark:focus:ring-[#a4c9ff]/30 transition-colors';
const labelCls = 'block text-xs font-medium text-gray-500 dark:text-[#8b919d] mb-1';

export const DogManagement: React.FC<DogManagementProps> = ({
  dogs,
  onCreateDog,
  onUpdateDog,
  onDeleteDog,
  onSelectDog,
  currentDog,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    dateOfBirth: '',
    weight: '',
    profilePicture: '',
    microchipId: '',
    passportNumber: '',
    sex: '',
    colour: '',
    features: '',
  });

  const calculateAge = (dateOfBirth: Date | string): number => {
    const today = new Date();
    const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleCreateDog = () => {
    setEditingDog(null);
    setFormData({ name: '', breed: '', dateOfBirth: '', weight: '', profilePicture: '', microchipId: '', passportNumber: '', sex: '', colour: '', features: '' });
    setIsModalOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    const dob = dog.dateOfBirth instanceof Date ? dog.dateOfBirth : new Date(dog.dateOfBirth as any);
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed,
      dateOfBirth: isNaN(dob.getTime()) ? '' : dob.toISOString().split('T')[0],
      weight: dog.weight.toString(),
      profilePicture: dog.profilePicture || '',
      microchipId: dog.microchipId || '',
      passportNumber: dog.passportNumber || '',
      sex: dog.sex || '',
      colour: dog.colour || '',
      features: dog.features || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const dogData: Partial<Dog> = {
      name: formData.name,
      breed: formData.breed,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      weight: parseFloat(formData.weight),
      profilePicture: formData.profilePicture || undefined,
      microchipId: formData.microchipId || undefined,
      passportNumber: formData.passportNumber || undefined,
      sex: formData.sex || undefined,
      colour: formData.colour || undefined,
      features: formData.features || undefined,
    };
    try {
      if (editingDog) {
        const updatedDog = await onUpdateDog(editingDog.id, dogData);
        if (currentDog?.id === editingDog.id) onSelectDog(updatedDog);
      } else {
        const newDog = await onCreateDog(dogData);
        if (!currentDog) onSelectDog(newDog);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving dog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDog = async (dog: Dog) => {
    if (window.confirm(t('confirmDeleteDog').replace('{dogName}', dog.name))) {
      try {
        await onDeleteDog(dog.id);
        if (currentDog?.id === dog.id) onSelectDog(dogs.find((d) => d.id !== dog.id) || null);
      } catch (error) {
        console.error('Error deleting dog:', error);
      }
    }
  };

  const handleFileUploaded = (fileUrl: string) => {
    setFormData((prev) => ({ ...prev, profilePicture: normalizeUploadUrl(fileUrl) }));
    setUploadingImage(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6]">{t('myDogs')}</h2>
          <p className="text-sm text-gray-400 dark:text-[#8b919d]">{t('manageDogProfile')}</p>
        </div>
        <button
          onClick={handleCreateDog}
          className="flex items-center gap-2 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px] leading-none">add</span>
          {t('addDog')}
        </button>
      </div>

      {/* Dogs grid */}
      {dogs.length === 0 ? (
        <button
          onClick={handleCreateDog}
          className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-10 flex flex-col items-center gap-3 hover:border-[#005da7] dark:hover:border-[#a4c9ff] hover:bg-[#005da7]/5 dark:hover:bg-[#a4c9ff]/5 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#282a2d] flex items-center justify-center group-hover:bg-[#005da7] dark:group-hover:bg-[#a4c9ff] transition-colors">
            <span className="material-symbols-outlined text-gray-400 dark:text-[#8b919d] group-hover:text-white dark:group-hover:text-[#00315d] text-[24px]">add</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 dark:text-[#c1c7d3]">{t('addDog')}</p>
            <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{t('addFirstDog')}</p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => {
            const isActive = currentDog?.id === dog.id;
            const age = dog.dateOfBirth ? calculateAge(dog.dateOfBirth) : null;
            return (
              <div
                key={dog.id}
                onClick={() => onSelectDog(dog)}
                className={cn(
                  cardCls,
                  'cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-white/10',
                  isActive && 'ring-2 ring-[#005da7] dark:ring-[#a4c9ff]'
                )}
              >
                {/* Photo */}
                <div className="relative h-44 bg-gradient-to-br from-[#005da7] via-[#004f91] to-[#003870] overflow-hidden">
                  {dog.profilePicture ? (
                    <img
                      src={dog.profilePicture}
                      alt={dog.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/30">{dog.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {isActive ? (
                      <span className="px-2.5 py-1 bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] text-xs font-semibold rounded-full">
                        {t('active')}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-black/30 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {t('inactive', 'Inactive')}
                      </span>
                    )}
                  </div>
                  {/* Edit/Delete */}
                  <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditDog(dog); }}
                      className="w-7 h-7 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDog(dog); }}
                      className="w-7 h-7 bg-black/40 backdrop-blur-sm hover:bg-red-500/80 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-[#e2e2e6] truncate">{dog.name}</h3>
                      <p className="text-xs text-gray-400 dark:text-[#8b919d]">
                        {dog.breed}{age !== null ? ` • ${age} ${t('yearsOld')}` : ''}{dog.weight ? ` • ${dog.weight} kg` : ''}
                      </p>
                    </div>
                    <div className="bg-[#005da7]/10 dark:bg-[#a4c9ff]/10 p-1.5 rounded-lg flex-shrink-0">
                      <span className="material-symbols-outlined text-[#005da7] dark:text-[#a4c9ff] text-[18px]">pets</span>
                    </div>
                  </div>

                  {(dog.microchipId || dog.passportNumber) && (
                    <div className="space-y-1 mb-3">
                      {dog.microchipId && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#8b919d]">
                          <span className="material-symbols-outlined text-[14px]">chip</span>
                          {dog.microchipId}
                        </div>
                      )}
                      {dog.passportNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#8b919d]">
                          <span className="material-symbols-outlined text-[14px]">badge</span>
                          {dog.passportNumber}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditDog(dog); }}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-[#282a2d] text-gray-700 dark:text-[#c1c7d3] hover:bg-[#005da7] dark:hover:bg-[#a4c9ff] hover:text-white dark:hover:text-[#00315d] transition-colors"
                    >
                      {t('editDog')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectDog(dog); }}
                      className={cn(
                        'flex-1 py-2 text-xs font-semibold rounded-lg transition-colors',
                        isActive
                          ? 'bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d]'
                          : 'bg-gray-100 dark:bg-[#282a2d] text-gray-700 dark:text-[#c1c7d3] hover:bg-[#005da7] dark:hover:bg-[#a4c9ff] hover:text-white dark:hover:text-[#00315d]'
                      )}
                    >
                      {isActive ? t('selected', 'Selected') : t('select', 'Select')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Pet card */}
          <button
            onClick={handleCreateDog}
            className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl min-h-[280px] flex flex-col items-center justify-center gap-3 hover:border-[#005da7] dark:hover:border-[#a4c9ff] hover:bg-[#005da7]/5 dark:hover:bg-[#a4c9ff]/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#282a2d] flex items-center justify-center group-hover:bg-[#005da7] dark:group-hover:bg-[#a4c9ff] transition-colors">
              <span className="material-symbols-outlined text-gray-400 dark:text-[#8b919d] group-hover:text-white dark:group-hover:text-[#00315d] text-[24px]">add</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-[#c1c7d3]">{t('addDog')}</p>
              <p className="text-xs text-gray-400 dark:text-[#8b919d] mt-0.5">{t('addFirstDog', 'Register a new profile')}</p>
            </div>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDog ? t('editDog') : t('addDog')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <label className={labelCls}>{t('profilePicture')}</label>
            <FileUpload
              variant="avatar"
              acceptedTypes="image/*"
              maxSize={5}
              dogId={editingDog?.id}
              documentType="profile_image"
              onFileUploaded={handleFileUploaded}
              onUploadStart={() => setUploadingImage(true)}
              currentImage={formData.profilePicture}
              className="mx-auto"
            />
            {uploadingImage && (
              <p className="mt-2 text-xs text-[#005da7] dark:text-[#a4c9ff]">Uploading…</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('name')} *</label>
              <input className={inputCls} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>{t('breed')} *</label>
              <input className={inputCls} value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('dateOfBirth')} *</label>
              <input type="date" className={inputCls} value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>{t('weight')} (kg) *</label>
              <input type="number" step="0.1" className={inputCls} value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('sex')} *</label>
            <select className={inputCls} value={formData.sex} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} required>
              <option value="">{t('selectOption')}</option>
              <option value="Мъж">{t('male')}</option>
              <option value="Жена">{t('female')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('microchipId')} ({t('optional')})</label>
              <input className={inputCls} value={formData.microchipId} onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{t('passportNumber')} ({t('optional')})</label>
              <input className={inputCls} value={formData.passportNumber} onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t('colour')}</label>
              <input className={inputCls} value={formData.colour} onChange={(e) => setFormData({ ...formData, colour: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>{t('notableFeatures')} ({t('optional')})</label>
              <input className={inputCls} value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-[#c1c7d3] hover:bg-gray-50 dark:hover:bg-[#282a2d] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#005da7] dark:bg-[#a4c9ff] text-white dark:text-[#00315d] hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
