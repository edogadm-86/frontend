import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';
import { EmergencyContact } from '../types';
import { PlusCircle, Phone, Clock, MapPin, AlertTriangle, Heart } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const EmergencyInfo: React.FC = () => {
  const { user, createEmergencyContact } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'vet' as EmergencyContact['type'],
    phone: '',
    address: '',
    available24h: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!user) return;

    const contactData = {
      name: formData.name,
      type: formData.type,
      phone: formData.phone,
      address: formData.address || undefined,
      available24h: formData.available24h,
    };

    try {
      await createEmergencyContact(contactData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'vet',
        phone: '',
        address: '',
        available24h: false,
      });
    } catch (error) {
      console.error('Error creating emergency contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: EmergencyContact['type']) => {
    switch (type) {
      case 'vet': return <Heart size={20} className="text-blue-500" />;
      case 'emergency-vet': return <AlertTriangle size={20} className="text-red-500" />;
      case 'poison-control': return <Phone size={20} className="text-orange-500" />;
      default: return <Phone size={20} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type: EmergencyContact['type']) => {
    switch (type) {
      case 'vet': return 'Veterinarian';
      case 'emergency-vet': return 'Emergency Vet';
      case 'poison-control': return 'Poison Control';
      default: return 'Other';
    }
  };

  const firstAidTips = [
    {
      title: 'Choking',
      description: 'Open mouth, remove visible objects. For small dogs, hold upside down and give firm back blows.',
    },
    {
      title: 'Bleeding',
      description: 'Apply direct pressure with clean cloth. Elevate wound if possible. Seek immediate vet care.',
    },
    {
      title: 'Poisoning',
      description: 'Contact poison control immediately. Do NOT induce vomiting unless instructed by professional.',
    },
    {
      title: 'Heatstroke',
      description: 'Move to cool area, apply cool water to paws and belly. Offer small amounts of water.',
    },
    {
      title: 'Seizures',
      description: 'Keep dog safe from injury. Do not put hands near mouth. Time the seizure and contact vet.',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Emergency Information</h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <PlusCircle size={16} className="mr-1" />
          Add Contact
        </Button>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
        {(!user?.emergencyContacts || user.emergencyContacts.length === 0) ? (
          <Card className="text-center py-8">
            <Phone size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 mb-4">No emergency contacts added</p>
            <Button onClick={() => setIsModalOpen(true)}>Add First Contact</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {user?.emergencyContacts?.map((contact) => (
              <Card key={contact.id}>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTypeIcon(contact.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                      {contact.available24h && (
                        <span className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Clock size={12} />
                          <span>24/7</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{getTypeLabel(contact.type)}</p>
                    <div className="flex items-center space-x-1 text-sm text-gray-700 mb-1">
                      <Phone size={14} />
                      <a href={`tel:${contact.phone}`} className="hover:text-blueblue-500">
                        {contact.phone}
                      </a>
                    </div>
                    {contact.address && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{contact.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* First Aid Tips */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">First Aid Tips</h3>
        <div className="space-y-3">
          {firstAidTips.map((tip, index) => (
            <Card key={index}>
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Numbers */}
      <Card className="bg-red-50 border-red-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle size={24} className="text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Important Numbers</h3>
            <div className="space-y-1 text-sm">
              <p className="text-red-800">
                <strong>ASPCA Poison Control:</strong>{' '}
                <a href="tel:1-888-426-4435" className="underline hover:no-underline">
                  1-888-426-4435
                </a>
              </p>
              <p className="text-red-800">
                <strong>Pet Poison Helpline:</strong>{' '}
                <a href="tel:1-855-764-7661" className="underline hover:no-underline">
                  1-855-764-7661
                </a>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Emergency Contact"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., City Animal Hospital"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueblue-500 focus:border-transparent"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as EmergencyContact['type'] })}
              required
            >
              <option value="vet">Veterinarian</option>
              <option value="emergency-vet">Emergency Vet</option>
              <option value="poison-control">Poison Control</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
            required
          />
          <Input
            label="Address (optional)"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, City, State"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available24h"
              checked={formData.available24h}
              onChange={(e) => setFormData({ ...formData, available24h: e.target.checked })}
              className="rounded border-gray-300 text-blueblue-500 focus:ring-blueblue-500"
            />
            <label htmlFor="available24h" className="text-sm text-gray-700">
              Available 24/7
            </label>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};