export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  dateOfBirth?: Date;
  weight: number | string;
  profilePicture?: string;
  microchipId?: string;
  passportNumber?: string;
  sex?: string;
  colour?: string;
  features?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
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
export interface Post {
  id: string;
  user_id: string;
  dog_id?: string;
  title: string;
  content: string;
  post_type: 'story' | 'question' | 'tip' | 'event' | 'photo' | 'video' | 'lost_dog';
  image_url?: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_public: boolean;
  created_at: string;
  author_name: string;
  dog_name?: string;
  liked_by_user?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_type: 'meetup' | 'training' | 'competition' | 'adoption' | 'fundraiser' | 'other';
  location?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date?: string;
  max_participants?: number;
  current_participants: number;
  participants_count: number;
  image_url?: string;
  is_public: boolean;
  organizer_name: string;
  created_at: string;
}

export interface Nutrition {
  id: string;
  dog_id: string;
  date: string;
  food_brand: string;
  food_type: string;
  daily_amount: number;
  calories_per_day: number;
  protein_percentage: number;
  fat_percentage: number;
  carb_percentage: number;
  supplements: string[];
  notes?: string;
  weight_at_time: number;
  created_at: string;
};