import { Request as ExpressRequest } from 'express';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  profile_picture?: string;
  microchip_id?: string;
  license_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vaccination {
  id: string;
  dog_id: string;
  vaccine_name: string;
  vaccine_type: string;
  date_given: Date;
  next_due_date?: Date;
  veterinarian: string;
  batch_number?: string;
  notes?: string;
  created_at: Date;
}

export interface HealthRecord {
  id: string;
  dog_id: string;
  date: Date;
  type: 'vet-visit' | 'medication' | 'illness' | 'injury' | 'other';
  title: string;
  description: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  created_at: Date;
}

export interface Appointment {
  id: string;
  dog_id: string;
  title: string;
  type: 'vet' | 'grooming' | 'training' | 'walk' | 'feeding' | 'other';
  date: Date;
  time: string;
  location?: string;
  notes?: string;
  reminder: boolean;
  reminder_time: number;
  created_at: Date;
}

export interface TrainingSession {
  id: string;
  dog_id: string;
  date: Date;
  duration: number;
  commands: string[];
  progress: 'excellent' | 'good' | 'fair' | 'needs-work';
  notes: string;
  behavior_notes?: string;
  created_at: Date;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  type: 'vet' | 'emergency-vet' | 'poison-control' | 'other';
  phone: string;
  address?: string;
  available_24h: boolean;
  created_at: Date;
}

export interface AuthRequest extends ExpressRequest  {
  user?: {
    id: string;
    email: string;
  };
}