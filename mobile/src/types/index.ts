export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  profilePicture?: string;
  microchipId?: string;
  licenseNumber?: string;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'license' | 'microchip' | 'health' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface Vaccination {
  vaccination: any;
  id: string;
  dogId: string;
  vaccineName: string;
  vaccineType: string;
  dateGiven: Date;
  nextDueDate?: Date;
  veterinarian: string;
  batchNumber?: string;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  dogId: string;
  date: Date;
  type: 'vet-visit' | 'medication' | 'illness' | 'injury' | 'other';
  title: string;
  description: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  documents: Document[];
}

export interface Appointment {
  id: string;
  dogId: string;
  title: string;
  type: 'vet' | 'grooming' | 'training' | 'walk' | 'feeding' | 'other';
  date: Date;
  time: string;
  location?: string;
  notes?: string;
  reminder: boolean;
  reminderTime: number; // minutes before
}

export interface TrainingSession {
  id: string;
  dogId: string;
  date: Date;
  duration: number; // minutes
  commands: string[];
  progress: 'excellent' | 'good' | 'fair' | 'needs-work';
  notes: string;
  behaviorNotes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: 'vet' | 'emergency-vet' | 'poison-control' | 'other';
  phone: string;
  address?: string;
  available24h: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dogs: Dog[];
  emergencyContacts: EmergencyContact[];
}
export interface Nutrition {
  id: string;
  dogId: string;
  foodName: string;
  brand: string;
  type: string;
  quantity: string;
  frequency: string;
  notes?: string;
  createdAt: Date;
}
