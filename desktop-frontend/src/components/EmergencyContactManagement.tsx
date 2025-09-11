import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Phone, MapPin, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { apiClient } from '../lib/api';

interface EmergencyContact {
  id: string;
  name: string;
  type: 'vet' | 'emergency-vet' | 'poison-control' | 'other';
  phone: string;
  address?: string;
  available_24h: boolean;
}

export const EmergencyContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'vet' as EmergencyContact['type'],
    phone: '',
    address: '',
    available_24h: false,
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await apiClient.getEmergencyContacts();
      setContacts(response.emergencyContacts);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const handleCreate = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      type: 'vet',
      phone: '',
      address: '',
      available_24h: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      phone: contact.phone,
      address: contact.address || '',
      available_24h: contact.available_24h,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingContact) {
        await apiClient.updateEmergencyContact(editingContact.id, formData);
      } else {
        await apiClient.createEmergencyContact(formData);
      }
      await loadContacts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      try {
        await apiClient.deleteEmergencyContact(contactId);
        await loadContacts();
      } catch (error) {
        console.error('Error deleting emergency contact:', error);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vet': return 'bg-blue-100 text-blue-800';
      case 'emergency-vet': return 'bg-red-100 text-red-800';
      case 'poison-control': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency-vet': return '🚨';
      case 'poison-control': return '☠️';
      case 'vet': return '🏥';
      default: return '📞';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('emergencyContacts')}
          </h3>
          <p className="text-gray-600">{t('manageEmergencyContacs')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          {t('addContacts')}
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="text-center py-16">
          <Phone size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4"> {t('noEmergencyContacts')}</p>
          <Button onClick={handleCreate}>
            {t('addEmergencyContact')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-xl">
                    {getTypeIcon(contact.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(contact.type)}`}>
                        {contact.type.replace('-', ' ')}
                      </span>
                      {contact.available_24h && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <Clock size={12} className="mr-1" />
                          24/7
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                          {contact.phone}
                        </a>
                      </div>
                      {contact.address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          {contact.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? t('Edit Emergency Contact') : t('addEmergencyContact')}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EmergencyContact['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="vet">{t('veterinarian')}</option>
              <option value="emergency-vet">{t('emergencyVet')}</option>
              <option value="poison-control">{t('poisonControl')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>
          <Input
            label={t('phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label={t('address')}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.available_24h}
              onChange={(e) => setFormData({ ...formData, available_24h: e.target.checked })}
              className="mr-2"
            />
            {t('available 24/7')}
          </label>
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