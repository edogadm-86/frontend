import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
    const printContent = document.getElementById('passport-content');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printContents = printContent.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>Pet Passport - ${dog.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .passport-page { background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
              .passport-header { background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .passport-field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
              .passport-photo { width: 128px; height: 128px; border: 4px solid white; border-radius: 8px; object-fit: cover; }
              @media print { body { margin: 0; } .no-print { display: none; } }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `;
      
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleDownload = async () => {
    const passportElement = document.getElementById('passport-content');
    if (!passportElement) return;

    try {
      // Create canvas from the passport content
      const canvas = await html2canvas(passportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: passportElement.scrollWidth,
        height: passportElement.scrollHeight,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${dog.name}-pet-passport.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
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
      <div className="bg-white dark:bg-gray-900 max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
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
                {t('download')}
              </Button>
              <Button variant="glass" size="sm" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          </div>
        </div>

        <div id="passport-content" className="p-8 space-y-8">
          {/* Section I: Details of the pet */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <FileText className="mr-2" />
              I. {t('petDetails')}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{dog.name}</p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('species')}</label>
                    <p className="text-lg text-gray-900 dark:text-white">Canis familiaris</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('breed')}</label>
                    <p className="text-lg text-gray-900 dark:text-white">{dog.breed}</p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('sex')}</label>
                    <p className="text-lg text-gray-900 dark:text-white">{t('notSpecified')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('dateOfBirth')}</label>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {new Date(new Date().getFullYear() - dog.age, 0, 1).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="passport-field">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('colour')}</label>
                    <p className="text-lg text-gray-900 dark:text-white">{t('notSpecified')}</p>
                  </div>
                </div>
                
                <div className="passport-field">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('notableFeatures')}</label>
                  <p className="text-gray-900 dark:text-white">{t('weight')}: {dog.weight} kg</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('petPhotograph')}</label>
                <div className="passport-photo bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {dog.profile_picture ? (
                    <img src={dog.profile_picture} alt={dog.name} className="passport-photo" />
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Heart size={32} className="mx-auto mb-2" />
                      <p className="text-sm">{t('noPhoto')}</p>
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
              II. {t('petMarking')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('microchipCode')}
                </label>
                <p className="text-xl font-mono font-bold text-gray-900">
                  {dog.microchip_id || t('notRegistered')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">ISO 11784/11785 compliant</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('microchipLocation')}
                </label>
                <p className="text-gray-900 dark:text-white">{t('microchipLocationStandard')}</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('microchipDate')}
                </label>
                <p className="text-gray-900 dark:text-white">{formatDate(dog.created_at)}</p>
              </div>
              
              <div className="passport-field">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t('tattoo')}
                </label>
                <p className="text-gray-900 dark:text-white">N/A</p>
              </div>
            </div>
          </div>

          {/* Section III: Rabies vaccination */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <Shield className="mr-2" />
              III. {t('rabiesVaccination')}
            </h2>
            
            {vaccinations.filter(v => v.vaccine_name.toLowerCase().includes('rabies')).length > 0 ? (
              <div className="space-y-4">
                {vaccinations
                  .filter(v => v.vaccine_name.toLowerCase().includes('rabies'))
                  .map((vaccination, index) => (
                    <div key={vaccination.id} className="passport-field">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('vaccine')}</label>
                          <p className="text-gray-900 dark:text-white">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('date')}</label>
                          <p className="text-gray-900 dark:text-white">{formatDate(vaccination.date_given)}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('validUntil')}</label>
                          <p className="text-gray-900 dark:text-white">
                            {vaccination.next_due_date ? formatDate(vaccination.next_due_date) : t('notApplicable')}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('veterinarian')}</label>
                          <p className="text-gray-900 dark:text-white">{vaccination.veterinarian}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <Shield size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">{t('noRabiesVaccination')}</p>
              </div>
            )}
          </div>

          {/* Section IV: Other vaccinations */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <Heart className="mr-2" />
              IV. {t('otherVaccinations')}
            </h2>
            
            {vaccinations.filter(v => !v.vaccine_name.toLowerCase().includes('rabies')).length > 0 ? (
              <div className="space-y-3">
                {vaccinations
                  .filter(v => !v.vaccine_name.toLowerCase().includes('rabies'))
                  .map((vaccination) => (
                    <div key={vaccination.id} className="passport-field">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('vaccine')}</label>
                          <p className="text-gray-900 dark:text-white">{vaccination.vaccine_name}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('date')}</label>
                          <p className="text-gray-900 dark:text-white">{formatDate(vaccination.date_given)}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('validUntil')}</label>
                          <p className="text-gray-900 dark:text-white">
                            {vaccination.next_due_date ? formatDate(vaccination.next_due_date) : t('notApplicable')}
                          </p>
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('veterinarian')}</label>
                          <p className="text-gray-900 dark:text-white">{vaccination.veterinarian}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <Heart size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">{t('noOtherVaccinations')}</p>
              </div>
            )}
          </div>

          {/* Section V: Health information */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <User className="mr-2" />
              V. {t('healthInformation')}
            </h2>
            
            {healthRecords.length > 0 ? (
              <div className="space-y-3">
                {healthRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="passport-field">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('date')}</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(record.date)}</p>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('type')}</label>
                        <p className="text-gray-900 dark:text-white capitalize">{record.type.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300">{t('details')}</label>
                        <p className="text-gray-900 dark:text-white">{record.title}</p>
                      </div>
                    </div>
                    {record.veterinarian && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {t('veterinarian')}: {record.veterinarian}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="passport-field text-center py-8">
                <User size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">{t('noHealthRecords')}</p>
              </div>
            )}
          </div>

          {/* Section VI: Owner details */}
          <div className="passport-page p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
              <User className="mr-2" />
              VI. {t('ownerDetails')}
            </h2>
            
            <div className="passport-field">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                  <p className="text-lg text-gray-900 dark:text-white">{t('ownerName')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
                  <p className="text-gray-900 dark:text-white">Sofia, Bulgaria</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('telephone')}</label>
                  <p className="text-gray-900 dark:text-white">+359 XXX XXX XXX</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                  <p className="text-gray-900 dark:text-white">owner@example.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passport Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{t('issuedBy')}: {t('bulgarianFoodSafetyAgency')}</p>
                <p className="text-xs opacity-75">{t('dateOfIssue')}: {formatDate(dog.created_at)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-300" size={16} />
                <span className="text-sm">{t('validForEUTravel')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};