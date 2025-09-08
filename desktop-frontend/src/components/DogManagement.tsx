import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Search, Camera } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { Dog } from '../types';
import { normalizeUploadUrl } from '../utils/urlHelpers';


interface DogManagementProps {
  dogs: Dog[];
  onCreateDog: (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Dog>;
  onUpdateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  onDeleteDog: (dogId: string) => Promise<void>;
  onSelectDog: (dog: Dog) => void;
  currentDog: Dog | null;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    dateOfBirth: '',
    weight: '',
    profilePicture: '',
    microchipId: '',
    passportNumber: '',
  });

  const filteredDogs = dogs.filter(dog =>
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dog.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDog = () => {
    setEditingDog(null);
    setFormData({
      name: '',
      breed: '',
      dateOfBirth: '',
      weight: '',
      profilePicture: '',
      microchipId: '',
      passportNumber: '',
    });
    setIsModalOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setFormData({
      name: dog.name,
      breed: dog.breed,
      dateOfBirth: dog.dateOfBirth.toISOString().split('T')[0],
      weight: dog.weight.toString(),
      profilePicture: dog.profilePicture || '',
      microchipId: dog.microchipId || '',
      passportNumber: dog.passportNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setLoading(true);
    
    const dogData = {
      name: formData.name,
      breed: formData.breed,
      dateOfBirth: new Date(formData.dateOfBirth),
      weight: parseFloat(formData.weight),
      profilePicture: formData.profilePicture || undefined,
      microchipId: formData.microchipId || undefined,
      passportNumber: formData.passportNumber || undefined,
    };
console.log("Submitting dog payload:", dogData);

    try {
      if (editingDog) {
        const updatedDog = await onUpdateDog(editingDog.id, dogData);
        if (currentDog?.id === editingDog.id) {
          onSelectDog(updatedDog);
        }
      } else {
        const newDog = await onCreateDog(dogData);
        if (!currentDog) {
          onSelectDog(newDog);
        }
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
        if (currentDog?.id === dog.id) {
          onSelectDog(dogs.find(d => d.id !== dog.id) || null);
        }
      } catch (error) {
        console.error('Error deleting dog:', error);
      }
    }
  };

  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

const handleFileUploaded = (fileUrl: string) => {
  console.log('✅ Final fileUrl from backend:', fileUrl);
  setFormData(prev => ({ ...prev, profilePicture: normalizeUploadUrl(fileUrl) }));
  setUploadingImage(false);
};
  const handleFileUploadStart = () => {
    setUploadingImage(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myDogs')}</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your dog profiles</p>
        </div>
        <Button onClick={handleCreateDog}>
          <Plus size={20} className="mr-2" />
          {t('addDog')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={t('searchDogs')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Dogs Grid */}
      {filteredDogs.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-gray-500 mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Plus size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">No dogs found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create your first dog profile to get started</p>
          </div>
          <Button onClick={handleCreateDog}>
            {t('addDog')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map((dog) => (
            <Card
              key={dog.id}
              className={`cursor-pointer transition-all ${
                currentDog?.id === dog.id ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
              onClick={() => onSelectDog(dog)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {dog.profilePicture ? (
                      <img
                        src={dog.profilePicture}
                        alt={dog.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-600">
                        {dog.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{dog.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{dog.breed}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {calculateAge(dog.dateOfBirth)} {t('yearsOld')} • {dog.weight} kg
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDog(dog);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDog(dog);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {dog.microchipId && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  Microchip: {dog.microchipId}
                </div>
              )}
              
              {dog.passportNumber && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {t('passport')}: {dog.passportNumber}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDog ? t('editDog') : t('addDog')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
            <FileUpload
              variant="avatar"
              acceptedTypes="image/*"
              maxSize={5}
              dogId={editingDog?.id}
              documentType="profile_image"
              onFileUploaded={handleFileUploaded}
              onUploadStart={handleFileUploadStart}
              currentImage={formData.profilePicture}
              className="mx-auto"
            />
            {uploadingImage && (
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Uploading image...</div>
            )}
          </div>
          
          <Input
            label={t('name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label={t('breed')}
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            required
          />
          <Input
            label={t('dateOfBirth')}
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
          <Input
            label={`${t('weight')} (kg)`}
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            required
          />
          <Input
            label={`${t('microchipId')} (${t('optional')})`}
            value={formData.microchipId}
            onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
          />
          <Input
            label={`${t('passportNumber')} (${t('optional')})`}
            value={formData.passportNumber}
            onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
          />
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};