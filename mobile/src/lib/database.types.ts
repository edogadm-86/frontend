export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dogs: {
        Row: {
          id: string
          user_id: string
          name: string
          breed: string
          age: number
          weight: number
          profile_picture: string | null
          microchip_id: string | null
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          breed: string
          age: number
          weight: number
          profile_picture?: string | null
          microchip_id?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          breed?: string
          age?: number
          weight?: number
          profile_picture?: string | null
          microchip_id?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          phone: string
          address: string | null
          available_24h: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          phone: string
          address?: string | null
          available_24h?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          phone?: string
          address?: string | null
          available_24h?: boolean
          created_at?: string
        }
      }
      vaccinations: {
        Row: {
          id: string
          dog_id: string
          vaccine_name: string
          vaccine_type: string
          date_given: string
          next_due_date: string | null
          veterinarian: string
          batch_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          vaccine_name: string
          vaccine_type: string
          date_given: string
          next_due_date?: string | null
          veterinarian: string
          batch_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          vaccine_name?: string
          vaccine_type?: string
          date_given?: string
          next_due_date?: string | null
          veterinarian?: string
          batch_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          dog_id: string
          date: string
          type: string
          title: string
          description: string
          veterinarian: string | null
          medication: string | null
          dosage: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          date: string
          type: string
          title: string
          description: string
          veterinarian?: string | null
          medication?: string | null
          dosage?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          date?: string
          type?: string
          title?: string
          description?: string
          veterinarian?: string | null
          medication?: string | null
          dosage?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          dog_id: string
          title: string
          type: string
          date: string
          time: string
          location: string | null
          notes: string | null
          reminder: boolean
          reminder_time: number
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          title: string
          type: string
          date: string
          time: string
          location?: string | null
          notes?: string | null
          reminder?: boolean
          reminder_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          title?: string
          type?: string
          date?: string
          time?: string
          location?: string | null
          notes?: string | null
          reminder?: boolean
          reminder_time?: number
          created_at?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          dog_id: string
          date: string
          duration: number
          commands: string[]
          progress: string
          notes: string
          behavior_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dog_id: string
          date: string
          duration: number
          commands?: string[]
          progress: string
          notes: string
          behavior_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dog_id?: string
          date?: string
          duration?: number
          commands?: string[]
          progress?: string
          notes?: string
          behavior_notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}