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

  // Vaccination endpoints
  async createVaccination(dogId: string, vaccinationData: any) {
    return this.request<{ vaccination: any }>(`/vaccinations/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify(vaccinationData),
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

  // Health record endpoints
  async createHealthRecord(dogId: string, healthData: any) {
    return this.request<{ healthRecord: any }>(`/health/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify(healthData),
    });
  }

  async updateHealthRecord(dogId: string, recordId: string, healthData: any) {
    return this.request<{ healthRecord: any }>(`/health/dog/${dogId}/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
  }

  async deleteHealthRecord(dogId: string, recordId: string) {
    return this.request(`/health/dog/${dogId}/${recordId}`, { method: 'DELETE' });
  }

  // Appointment endpoints
  async createAppointment(dogId: string, appointmentData: any) {
    return this.request<{ appointment: any }>(`/appointments/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(dogId: string, appointmentId: string, appointmentData: any) {
    return this.request<{ appointment: any }>(`/appointments/dog/${dogId}/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(dogId: string, appointmentId: string) {
    return this.request(`/appointments/dog/${dogId}/${appointmentId}`, { method: 'DELETE' });
  }

  // Training session endpoints
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
  async createEmergencyContact(contactData: any) {
    return this.request<{ emergencyContact: any }>('/emergency', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateEmergencyContact(contactId: string, contactData: any) {
    return this.request<{ emergencyContact: any }>(`/emergency/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteEmergencyContact(contactId: string) {
    return this.request(`/emergency/${contactId}`, { method: 'DELETE' });
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; type?: string; userId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    return this.request<{ posts: any[] }>(`/posts?${queryParams.toString()}`);
  }

  async createPost(postData: any) {
    return this.request<{ post: any }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  }

  // Events endpoints
  async getEvents(params?: { page?: number; limit?: number; type?: string; location?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.location) queryParams.append('location', params.location);
    
    return this.request<{ events: any[] }>(`/events?${queryParams.toString()}`);
  }

  async createEvent(eventData: any) {
    return this.request<{ event: any }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async joinEvent(eventId: string, dogId?: string) {
    return this.request(`/events/${eventId}/join`, {
      method: 'POST',
      body: JSON.stringify({ dog_id: dogId }),
    });
  }

  // Comment endpoints
  async getPostComments(postId: string) {
    return this.request<{ comments: any[] }>(`/posts/${postId}/comments`);
  }

  async addPostComment(postId: string, content: string) {
    return this.request<{ comment: any }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
  // File upload endpoints
  async uploadFile(file: File, metadata: { dogId?: string; vaccinationId?: string; healthRecordId?: string; documentType?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.dogId) formData.append('dogId', metadata.dogId);
    if (metadata.vaccinationId) formData.append('vaccinationId', metadata.vaccinationId);
    if (metadata.healthRecordId) formData.append('healthRecordId', metadata.healthRecordId);
    if (metadata.documentType) formData.append('documentType', metadata.documentType);

    return this.request<{ document: any }>('/uploads/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async getDocuments(dogId: string) {
    return this.request<{ documents: any[] }>(`/uploads/dog/${dogId}`);
  }

  async deleteDocument(documentId: string) {
    return this.request(`/uploads/${documentId}`, { method: 'DELETE' });
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
}

export const apiClient = new ApiClient();