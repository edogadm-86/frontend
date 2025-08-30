import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Calendar, 
  User, 
  MapPin, 
  Phone,
  FileText,
  Download,
  Printer as Print, 
  Star,
  Heart,
  Award
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { formatDate } from '../lib/utils';
import { apiClient } from '../lib/api';

interface PetPassportProps {
  dog: any;
  onClose: () => void;
}

export const PetPassport: React.FC<PetPassportProps> = ({ dog, onClose }) => {
  const { t } = useTranslation();
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassportData();
  }, [dog.id]);

  const loadPassportData = async () => {
    try {
      const [vaccinationsRes, healthRes] = await Promise.all([
        apiClient.getVaccinations(dog.id),
        apiClient.getHealthRecords(dog.id),
      ]);
      setVaccinations(vaccinationsRes.vaccinations);
      setHealthRecords(healthRes.healthRecords);
    } catch (error) {
      console.error('Error loading passport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate PDF download
    alert('PDF download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading passport data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Passport Header */}
        <div className="passport-header relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <img src="/logo.png" alt="EU Logo" className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EUROPEAN UNION</h1>
                <p className="text-blue-100">Pet Passport</p>
                <p className="text-xs text-blue-200">Regulation (EU) No 576/2013</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="glass" size="sm" onClick={handlePrint} icon={<Print size={16} />}>
                Print
              </Button>
              <Button variant="glass" size="sm" onClick={handleDownload} icon={<Download size={16} />}>
                Download
              </Button>
              <Button variant="glass" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Section I: Details of the pet */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <FileText className="mr-2" />
              I. Details of the pet
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                    <p className="text-lg font-bold text-gray-900">{dog.name}</p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Species</label>
                    <p className="text-lg text-gray-900">Canis familiaris</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Breed</label>
                    <p className="text-lg text-gray-900">{dog.breed}</p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sex</label>
                    <p className="text-lg text-gray-900">Not specified</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date of birth</label>
                    <p className="text-lg text-gray-900">
                      {new Date(new Date().getFullYear() - dog.age, 0, 1).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Colour</label>
                    <p className="text-lg text-gray-900">Not specified</p>
                  </div>
                </div>
                
                <div className="passport-field">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notable or discernible features</label>
                  <p className="text-gray-900">Weight: {dog.weight} kg</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photograph of the pet</label>
                <div className="passport-photo bg-gray-100 flex items-center justify-center">
                  {dog.profile_picture ? (
                    <img src={dog.profile_picture} alt={dog.name} className="passport-photo" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Heart size={32} className="mx-auto mb-2" />
                      <p className="text-sm">No photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section II: Marking of the pet */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <Shield className="mr-2" />
              II. Marking of the pet
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Transponder (microchip) code
                </label>
                <p className="text-xl font-mono font-bold text-gray-900">
                  {dog.microchip_id || 'Not registered'}
                </p>
                <p className="text-xs text-gray-500 mt-1">ISO 11784/11785 compliant</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location of transponder
                </label>
                <p className="text-gray-900">Left side of neck (standard)</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of application or reading of transponder
                </label>
                <p className="text-gray-900">{formatDate(dog.created_at)}</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tattoo (if no transponder)
                </label>
                <p className="text-gray-900">N/A</p>
              </div>
            </div>
          </div>

          {/* Section III: Rabies vaccination */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <Shield className="mr-2" />
              III. Rabies vaccination
            </h2>
            
            {vaccinations.filter(v => v.vaccine_name.toLowerCase().includes('rabies')).length > 0 ? (
              <div className="space-y-4">
                {vaccinations
                  .filter(v => v.vaccine_name.toLowerCase().includes('rabies'))
                  .map((vaccination, index) => (
                    <div key={vaccination.id} className="passport-field">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block font-semibold text-gray-700">Vaccine</label>
                          <p className="text-gray-900">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Date</label>
                          <p className="text-gray-900">{formatDate(vaccination.date_given)}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Valid until</label>
                          <p className="text-gray-900">
                            {vaccination.next_due_date ? formatDate(vaccination.next_due_date) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Veterinarian</label>
                          <p className="text-gray-900">{vaccination.veterinarian}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <Shield size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No rabies vaccination recorded</p>
              </div>
            )}
          </div>

          {/* Section IV: Other vaccinations */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <Heart className="mr-2" />
              IV. Other vaccinations
            </h2>
            
            {vaccinations.filter(v => !v.vaccine_name.toLowerCase().includes('rabies')).length > 0 ? (
              <div className="space-y-3">
                {vaccinations
                  .filter(v => !v.vaccine_name.toLowerCase().includes('rabies'))
                  .map((vaccination) => (
                    <div key={vaccination.id} className="passport-field">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block font-semibold text-gray-700">Vaccine</label>
                          <p className="text-gray-900">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Date</label>
                          <p className="text-gray-900">{formatDate(vaccination.date_given)}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Valid until</label>
                          <p className="text-gray-900">
                            {vaccination.next_due_date ? formatDate(vaccination.next_due_date) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700">Veterinarian</label>
                          <p className="text-gray-900">{vaccination.veterinarian}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <Heart size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No other vaccinations recorded</p>
              </div>
            )}
          </div>

          {/* Section V: Health information */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <User className="mr-2" />
              V. Health information
            </h2>
            
            {healthRecords.length > 0 ? (
              <div className="space-y-3">
                {healthRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="passport-field">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="block font-semibold text-gray-700">Date</label>
                        <p className="text-gray-900">{formatDate(record.date)}</p>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700">Type</label>
                        <p className="text-gray-900 capitalize">{record.type.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700">Details</label>
                        <p className="text-gray-900">{record.title}</p>
                      </div>
                    </div>
                    {record.veterinarian && (
                      <div className="mt-2 text-xs text-gray-600">
                        Veterinarian: {record.veterinarian}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <User size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">No health records available</p>
              </div>
            )}
          </div>

          {/* Section VI: Owner details */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <User className="mr-2" />
              VI. Details of owner/holder
            </h2>
            
            <div className="passport-field">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <p className="text-lg text-gray-900">Owner Name</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900">Sofia, Bulgaria</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telephone</label>
                  <p className="text-gray-900">+359 XXX XXX XXX</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">owner@example.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passport Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Issued by: Bulgarian Food Safety Agency</p>
                <p className="text-xs opacity-75">Date of issue: {formatDate(dog.created_at)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-300" size={16} />
                <span className="text-sm">Valid for EU travel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};