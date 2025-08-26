import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact } from '../types';
import { API_BASE_URL } from '../config';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
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
    return this.request<{ dogs: any[] }>('/dogs');
  }

  async createDog(dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) {
    return this.request<{ dog: any }>('/dogs', {
      method: 'POST',
      body: JSON.stringify({
        name: dogData.name,
        breed: dogData.breed,
        age: dogData.age,
        weight: dogData.weight,
        profile_picture: dogData.profilePicture,
        microchip_id: dogData.microchipId,
        license_number: dogData.licenseNumber,
      }),
    });
  }

  async updateDog(dogId: string, dogData: Partial<Dog>) {
    return this.request<{ dog: any }>(`/dogs/${dogId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: dogData.name,
        breed: dogData.breed,
        age: dogData.age,
        weight: dogData.weight,
        profile_picture: dogData.profilePicture,
        microchip_id: dogData.microchipId,
        license_number: dogData.licenseNumber,
      }),
    });
  }

  async deleteDog(dogId: string) {
    return this.request(`/dogs/${dogId}`, { method: 'DELETE' });
  }

  // Other endpoints (vaccinations, health records, etc.)
  async getVaccinations(dogId: string) {
    return this.request<{ vaccinations: any[] }>(`/vaccinations/dog/${dogId}`);
  }

  async getHealthRecords(dogId: string) {
    return this.request<{ healthRecords: any[] }>(`/health/dog/${dogId}`);
  }

  async getAppointments(dogId: string) {
    return this.request<{ appointments: any[] }>(`/appointments/dog/${dogId}`);
  }

  async getTrainingSessions(dogId: string) {
    return this.request<{ trainingSessions: any[] }>(`/training/dog/${dogId}`);
  }

  async getEmergencyContacts() {
    return this.request<{ emergencyContacts: any[] }>('/emergency');
  }
}

export const apiClient = new ApiClient();