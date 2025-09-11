import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from './ui/Card';
import { Phone, User, Shield, Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

interface Dog {
  id: string;
  name: string;
  breed: string;
  date_of_birth: string;
  weight: string;
  profile_picture?: string;
}

interface Owner {
  name: string;
  phone: string;
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

  if (loading) {
    return <p className="p-8 text-center text-gray-500">{t('loading')}</p>;
  }

  if (!dog) {
    return <p className="p-8 text-center text-red-500">{t('dogNotFound')}</p>;
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        {/* Dog Info Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-lg mb-4">
            {dog.profile_picture ? (
              <img
                src={dog.profile_picture}
                alt={dog.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-400 text-white text-3xl font-bold">
                {dog.name.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold gradient-text">{dog.name}</h1>
          <p className="text-gray-600 text-lg">{dog.breed}</p>
        </div>

        {/* Dog Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="glass" className="p-4 flex items-center gap-3">
            <Calendar className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">{t('age')}</p>
              <p className="font-semibold text-gray-900">
                {calculateAge(dog.date_of_birth)} {t('years')}
              </p>
            </div>
          </Card>
          <Card variant="glass" className="p-4 flex items-center gap-3">
            <Heart className="text-red-500" />
            <div>
              <p className="text-sm text-gray-500">{t('weight')}</p>
              <p className="font-semibold text-gray-900">{dog.weight} {t('kg')}</p>
            </div>
          </Card>
        </div>

        {/* Owner Info */}
        {owner && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-indigo-500" /> {t('ownerDetails')}
            </h2>
            <Card variant="glass" className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="text-gray-500" size={18} />
                <span className="font-medium text-gray-900">{owner.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-500" size={18} />
                <a
                  href={`tel:${owner.phone}`}
                  className="text-primary-600 hover:underline"
                >
                  {owner.phone}
                </a>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};
