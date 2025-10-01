import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { FileUpload } from './ui/FileUpload';
import { Dog } from '../types';
import { PlusCircle, Edit, Camera } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';


export const DogProfile: React.FC = () => {
  const { dogs, createDog, updateDog, currentDog, setCurrentDog } = useApp();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    microchipId: '',
    licenseNumber: '',
  });

  const handleCreateDog = () => {
    setEditingDog(null);
    setProfileFiles([]);
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      microchipId: '',
      licenseNumber: '',
    });
    setIsModalOpen(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setProfileFiles([]);
    setFormData({
      name: dog.name,
      breed: dog.breed,
      age: dog.age.toString(),
      weight: dog.weight.toString(),
      microchipId: dog.microchipId || '',
      licenseNumber: dog.licenseNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Handle profile picture upload
    let profilePictureUrl = editingDog?.profilePicture;
    if (profileFiles.length > 0) {
      // In a real app, you would upload the file to a storage service
      // For now, we'll create a local URL
      profilePictureUrl = URL.createObjectURL(profileFiles[0]);
    }
    
    const dogData = {
      name: formData.name,
      breed: formData.breed,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      profilePicture: profilePictureUrl,
      microchipId: formData.microchipId || undefined,
      licenseNumber: formData.licenseNumber || undefined,
    };

    try {
      if (editingDog) {
        const updatedDog = await updateDog(editingDog.id, dogData);
        if (currentDog?.id === editingDog.id) {
          setCurrentDog(updatedDog);
        }
      } else {
        const newDog = await createDog(dogData);
        if (!currentDog) {
          setCurrentDog(newDog);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving dog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDog = (dog: Dog) => {
    setCurrentDog(dog);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Dogs</h2>
        <Button onClick={handleCreateDog} size="sm">
          <PlusCircle size={16} className="mr-1" />
          {t('Add Dog')}
        </Button>
      </div>

      {dogs.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <Camera size={48} className="mx-auto mb-2 text-gray-300" />
            <p>{t('nodogs')||'No dogs added yet'}</p>
            <p className="text-sm">{t('createdog')}</p>
          </div>
          <Button onClick={handleCreateDog}>{t('addfirstdog')}</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {dogs.map((dog) => (
            <Card
              key={dog.id}
              className={`${currentDog?.id === dog.id ? 'ring-2 ring-blueblue-500' : ''}`}
              onClick={() => handleSelectDog(dog)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {dog.profilePicture ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${dog.profile_picture}`}
                        alt={dog.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {dog.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dog.name}</h3>
                    <p className="text-sm text-gray-600">{dog.breed}</p>
                    <p className="text-xs text-gray-500">
                      {dog.age} years • {dog.weight} kg
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDog(dog);
                  }}
                >
                  <Edit size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDog ? t('Edit Dog Profile') : t('Add New Dog')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Age (years)')}
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
            <Input
              label={t('Weight (kgs)')}
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
            />
          </div>
          <Input
            label={t('Microchip ID (optional)')}
            value={formData.microchipId}
            onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
          />
          <Input
            label={t('License Number (optional)')}
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          />
          <FileUpload
            label={t('Profile Picture (optional)')}
            files={profileFiles}
            onFilesChange={setProfileFiles}
            accept="image/*"
            multiple={false}
            maxFiles={1}
          />
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
             {t('Cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('Saving...') : (editingDog ? t('Update Dog') : t('Add Dog'))}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};