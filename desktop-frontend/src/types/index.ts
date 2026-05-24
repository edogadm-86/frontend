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
  is_admin?: boolean;
  role?: string;
  walk_competition_opted_in?: boolean | null;
}

export interface WalkLeaderboardEntry {
  dog_id: string;
  dog_name: string;
  profile_picture?: string;
  owner_id: string;
  owner_name: string;
  walk_count: number;
  total_distance_meters: number;
  rank?: number;
}

export interface WalkLeaderboardResponse {
  leaderboard: WalkLeaderboardEntry[];
  my_entry: WalkLeaderboardEntry | null;
  last_week_winner: WalkLeaderboardEntry | null;
  week_start: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  dog_count: number;
  post_count?: number;
  is_active: boolean;
  recently_active?: boolean;
  last_seen?: string;
  is_admin?: boolean;
}

export interface AdminStats {
  total_users: number;
  new_users_today: number;
  new_users_this_week: number;
  total_dogs: number;
  total_posts: number;
  total_events: number;
  active_users_today?: number;
}

export interface AdminDog {
  id: string;
  name: string;
  breed: string;
  sex?: string;
  date_of_birth?: string;
  weight?: number | string;
  profile_picture?: string;
  microchip_id?: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
}

export interface AdminReportedPost {
  id: string;
  post_id: string;
  reason: string;
  reported_at: string;
  reporter_name: string;
  post_title: string;
  post_content: string;
  post_author: string;
  post_author_id: string;
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
  user_reaction?: string | null;
  bookmarked_by_user?: boolean;
  reaction_counts?: Record<string, number>;
  location_name?: string;
  is_resolved?: boolean;
}

export interface Comment {
  id: string;
  post_id?: string;
  event_id?: string;
  user_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at?: string;
  parent_id?: string | null;
}

export interface WeightEntry {
  id: string;
  dog_id: string;
  weight: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface MedicationReminder {
  id: string;
  dog_id: string;
  user_id: string;
  name: string;
  frequency_days: number;
  last_given_date?: string;
  next_due_date: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory = 'food' | 'medical' | 'gear' | 'training' | 'other';

export interface Expense {
  id: string;
  dog_id: string;
  user_id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  vendor?: string;
  amount: number;
  notes?: string;
  recur_monthly?: boolean;
  recur_source_id?: string;
  receipt_photo?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  currentTotal: number;
  prevTotal: number;
  percentChange: number | null;
  categoryBreakdown: { category: ExpenseCategory; total: number }[];
  weeklyData: { dow: number; total: number }[];
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
  comments_count: number;
  image_url?: string;
  is_public: boolean;
  organizer_name: string;
  created_at: string;
}