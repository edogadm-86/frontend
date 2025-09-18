import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact } from '../types';
import { API_BASE_URL } from '../config';

//const API_BASE_URL = 'http://localhost:3001/api';
//const API_BASE_URL =import.meta.env.BACKEND_URL;

class ApiClient {
  private token: string | null = null;
  
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string> | undefined),
    };

    const config: RequestInit = { ...options, headers };
   

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; password: string; phone?: string }) {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Dog endpoints
  async getDogs() {
    return this.request<{ dogs: Dog[] }>('/dogs');
  }

   async createDog(dogData: Partial<Dog>) {
        const payload = {
          name: dogData.name,
          breed: dogData.breed,
          date_of_birth: dogData.dateOfBirth,
          weight: dogData.weight,
          profile_picture: dogData.profilePicture,
          microchip_id: dogData.microchipId,
          passport_number: dogData.passportNumber,
          sex: dogData.sex,
          colour: dogData.colour,
          features: dogData.features,
        };
        return this.request('/dogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      async updateDog(dogId: string, dogData: Partial<Dog>) {
        const payload = {
          name: dogData.name,
          breed: dogData.breed,
          date_of_birth: dogData.dateOfBirth,
          weight: dogData.weight,
          profile_picture: dogData.profilePicture,
          microchip_id: dogData.microchipId,
          passport_number: dogData.passportNumber,
          sex: dogData.sex,
          colour: dogData.colour,
          features: dogData.features,
        };
        return this.request(`/dogs/${dogId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          
        });
      }


  async deleteDog(dogId: string) {
    return this.request(`/dogs/${dogId}`, { method: 'DELETE' });
  }


  
  // Health status endpoint
  async getDogHealthStatus(dogId: string) {
    return this.request<{
      hasEnoughData: boolean;
      score: number;
      status: string;
      statusColor: string;
      nextAction: string;
      factors: string[];
      summary: any;
    }>(`/dogs/${dogId}/health-status`);
  }



  // Health record endpoints
  async getHealthRecords(dogId: string) {
    return this.request<{ healthRecords: HealthRecord[] }>(`/health/dog/${dogId}`);
  }
  async createHealthRecord(dogId: string, recordData: Omit<HealthRecord, 'id' | 'documents'>) {
    return this.request<{ healthRecord: HealthRecord }>(`/health/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify({
        date: recordData.date.toISOString().split('T')[0],
        type: recordData.type,
        title: recordData.title,
        description: recordData.description,
        veterinarian: recordData.veterinarian,
        medication: recordData.medication,
        dosage: recordData.dosage,
      }),
    });
  }
  
   // Vaccination endpoints

  async getVaccinations(dogId: string) {
    return this.request<{ vaccinations: Vaccination[] }>(`/vaccinations/dog/${dogId}`);
  }

   // Vaccination endpoints
  async createVaccination(dogId: string, vaccinationData: Omit<Vaccination, 'id'>) {
  return this.request<{ vaccination: Vaccination }>(`/vaccinations/dog/${dogId}`, {
    method: 'POST',
    body: JSON.stringify({
      vaccine_name: vaccinationData.vaccineName,
      vaccine_type: vaccinationData.vaccineType,
      date_given: vaccinationData.dateGiven,        // 👈 already string
      next_due_date: vaccinationData.nextDueDate || null,
      veterinarian: vaccinationData.veterinarian,
      batch_number: vaccinationData.batchNumber,
      notes: vaccinationData.notes,
    }),
  });
}

  async updateVaccination(dogId: string, vaccinationId: string, vaccinationData: any) {
    return this.request<{ vaccination: any }>(`/vaccinations/dog/${dogId}/${vaccinationId}`, {
      method: 'PUT',
      body: JSON.stringify(vaccinationData),
    });
  }

  async deleteVaccination(dogId: string, vaccinationId: string) {
    return this.request(`/vaccinations/dog/${dogId}/${vaccinationId}`, { method: 'DELETE' });
  }


  // Appointment endpoints
  async getAppointments(dogId: string) {
    return this.request<{ appointments: Appointment[] }>(`/appointments/dog/${dogId}`);
  }

  async createAppointment(dogId: string, appointmentData: Omit<Appointment, 'id'>) {
    return this.request<{ appointment: Appointment }>(`/appointments/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify({
        title: appointmentData.title,
        type: appointmentData.type,
        date: appointmentData.date.toISOString().split('T')[0],
        time: appointmentData.time,
        location: appointmentData.location,
        notes: appointmentData.notes,
        reminder: appointmentData.reminder,
        reminder_time: appointmentData.reminderTime,
      }),
    });
  }

  async updateAppointment(dogId: string, appointmentId: string, appointmentData: any) {
    return this.request<{ appointment: any }>(`/appointments/dog/${dogId}/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

    async deleteAppointment(dogId: string, appointmentId: string) {
    return this.request(`/appointments/dog/${dogId}/${appointmentId}`, {
      method: 'DELETE',
    });
  }


  // Health record endpoints

  async updateHealthRecord(dogId: string, recordId: string, healthData: any) {
    return this.request<{ healthRecord: any }>(`/health/dog/${dogId}/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
  }

// Training session endpoints

  async getTrainingSessions(dogId: string) {
    return this.request<{ trainingSessions: any[] }>(`/training/dog/${dogId}`);
  }

  async createTrainingSession(dogId: string, sessionData: any) {
    return this.request<{ trainingSession: any }>(`/training/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async updateTrainingSession(dogId: string, sessionId: string, sessionData: any) {
    return this.request<{ trainingSession: any }>(`/training/dog/${dogId}/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async deleteTrainingSession(dogId: string, sessionId: string) {
    return this.request(`/training/dog/${dogId}/${sessionId}`, { method: 'DELETE' });
  }


  // Emergency contact endpoints
  async getEmergencyContacts() {
    return this.request<{ emergencyContacts: EmergencyContact[] }>('/emergency');
  }

  async createEmergencyContact(contactData: Omit<EmergencyContact, 'id'>) {
    return this.request<{ emergencyContact: EmergencyContact }>('/emergency', {
      method: 'POST',
      body: JSON.stringify({
        name: contactData.name,
        type: contactData.type,
        phone: contactData.phone,
        address: contactData.address,
        available_24h: contactData.available24h,
      }),
    });
  }

  async deleteHealthRecord(dogId: string, recordId: string) {
    return this.request(`/health/dog/${dogId}/${recordId}`, {
      method: 'DELETE',
    });
  }



  async deleteEmergencyContact(contactId: string) {
    return this.request(`/emergency/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/auth/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/auth/notifications/${notificationId}/read`, { method: 'PUT' });
  }
  // File upload endpoints
async uploadFile(
  file: File,
  metadata: { dogId?: string; vaccinationId?: string; healthRecordId?: string; documentType?: string }
) {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata.dogId) formData.append('dogId', metadata.dogId);
  if (metadata.vaccinationId) formData.append('vaccinationId', metadata.vaccinationId);
  if (metadata.healthRecordId) formData.append('healthRecordId', metadata.healthRecordId);
  if (metadata.documentType) formData.append('documentType', metadata.documentType);

  return this.request<{ document: any; fileUrl: string }>('/uploads/upload', {
    method: 'POST',
    body: formData,
  });
}

async getDocuments(dogId: string) {
  return this.request<{ documents: any[] }>(`/uploads/dog/${dogId}`);
}

async deleteDocument(documentId: string) {
  return this.request(`/uploads/${documentId}`, { method: 'DELETE' });
}

// Nutrition endpoints
async getNutritionRecords(dogId: string) {
  return this.request<{ nutritionRecords: any[] }>(`/nutrition/dog/${dogId}/records`);
}

async createNutritionRecord(dogId: string, data: any) {
  return this.request<{ nutritionRecord: any }>(`/nutrition/dog/${dogId}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async updateNutritionRecord(dogId: string, recordId: string, data: any) {
  return this.request<{ nutritionRecord: any }>(`/nutrition/dog/${dogId}/records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async deleteNutritionRecord(dogId: string, recordId: string) {
  return this.request(`/nutrition/dog/${dogId}/records/${recordId}`, { method: 'DELETE' });
}

// Meal Plan endpoints
async getMealPlan(dogId: string) {
  return this.request<{ mealPlan: any[] }>(`/nutrition/dog/${dogId}/meal-plan`);
}

async createMealPlan(dogId: string, mealData: any) {
  return this.request<{ mealPlan: any }>(`/nutrition/dog/${dogId}/meal-plan`, {
    method: 'POST',
    body: JSON.stringify(mealData),
  });
}

async updateMealPlan(dogId: string, mealId: string, mealData: any) {
  return this.request<{ mealPlan: any }>(`/nutrition/dog/${dogId}/meal-plan/${mealId}`, {
    method: 'PUT',
    body: JSON.stringify(mealData),
  });
}

async deleteMealPlan(dogId: string, mealId: string) {
  return this.request(`/nutrition/dog/${dogId}/meal-plan/${mealId}`, { method: 'DELETE' });
}


async getNutritionStats(dogId: string) {
  return this.request<{
    latestRecord: any;
    mealPlan: any[];
    dailyTotals: { amount: number; calories: number };
    nutritionHistory: any[];
    hasData: boolean;
  }>(`/nutrition/dog/${dogId}/stats`);
}




}


export const apiClient = new ApiClient();