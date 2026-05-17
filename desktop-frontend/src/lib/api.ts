import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact, AdminStats, AdminUserSummary, AdminDog, AdminReportedPost } from '../types';
import { API_BASE_URL } from '../config';

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
 async changePassword(data: { currentPassword: string; newPassword: string }) {
  return this.request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

  // Dog endpoints
  /*async getDogs() {
    return this.request<{ dogs: any[] }>('/dogs');
  }*/
        async getDogs() {
        const response = await this.request<{ dogs: any[] }>('/dogs');
        //console.log("🐶 Raw dogs from backend:", response.dogs); 
        return {
        dogs: response.dogs.map((d) => ({
          ...d, // keeps original snake_case keys (e.g. date_of_birth, profile_picture, etc.)
          id: d.id,
          name: d.name,
          breed: d.breed,
          dateOfBirth: d.date_of_birth ? new Date(d.date_of_birth) : undefined,
          weight: d.weight,
          profilePicture: d.profile_picture,
          microchipId: d.microchip_id,
          passportNumber: d.passport_number,
          sex: d.sex,
          colour: d.colour,
          features: d.features,
          createdAt: d.created_at ? new Date(d.created_at) : undefined,
          updatedAt: d.updated_at ? new Date(d.updated_at) : undefined,
          documents: d.documents || [],
        })),
        };
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

  // Other endpoints (vaccinations, health records, etc.)
 

  async getHealthRecords(dogId: string) {
    return this.request<{ healthRecords: any[] }>(`/health/dog/${dogId}`);
  }

  async getAppointments(dogId: string) {
    return this.request<{ appointments: any[] }>(`/appointments/dog/${dogId}`);
  }

 
  async getEmergencyContacts() {
    return this.request<{ emergencyContacts: any[] }>('/emergency');
  }
  
  async getVaccinations(dogId: string) {
    return this.request<{ vaccinations: any[] }>(`/vaccinations/dog/${dogId}`);
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

  async deletePost(postId: string) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async reportPost(postId: string, reason: string) {
    return this.request(`/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getMyPosts() {
    return this.request<{ posts: any[] }>('/posts/my-posts');
  }

  async getTrendingTags() {
    return this.request<{ tags: { tag: string; count: number }[] }>('/posts/trending-tags');
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

    return this.request<{ document: any; fileUrl: string }>('/uploads/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ fileUrl: string }>('/uploads/image', {
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

  async createNutritionRecord(dogId: string, nutritionData: any) {
    return this.request<{ nutritionRecord: any }>(`/nutrition/dog/${dogId}/records`, {
      method: 'POST',
      body: JSON.stringify(nutritionData),
    });
  }

  async updateNutritionRecord(dogId: string, recordId: string, nutritionData: any) {
    return this.request<{ nutritionRecord: any }>(`/nutrition/dog/${dogId}/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(nutritionData),
    });
  }

  async deleteNutritionRecord(dogId: string, recordId: string) {
    return this.request(`/nutrition/dog/${dogId}/records/${recordId}`, { method: 'DELETE' });
  }

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
  async updateEntireMealPlan(dogId: string, data: { mealPlan: any[], nutrition_record_id?: string }) {
  return this.request(`/nutrition/dog/${dogId}/meal-plan`, {
    method: 'PUT',
    body: JSON.stringify(data),   // ✅ not wrapped again
  });
}



    async getMealsForRecord(dogId: string, recordId: string) {
      return this.request<{ meals: any[] }>(`/nutrition/dog/${dogId}/records/${recordId}/meals`);
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

  // Notification endpoints
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/auth/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/auth/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  // Push notification endpoints
  async getPushVapidKey() {
    return this.request<{ vapidPublicKey: string }>('/push/vapid-public-key');
  }

  async subscribePush(endpoint: string, keys: { p256dh: string; auth: string }) {
    return this.request('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint, keys }),
    });
  }

  async unsubscribePush(endpoint: string) {
    return this.request('/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
  }

  async getPushPrefs() {
    return this.request<{
      prefs: {
        push_enabled: boolean;
        vaccinations: boolean;
        appointments: boolean;
        medications: boolean;
        lost_dog_alerts: boolean;
      };
    }>('/push/prefs');
  }

  async updatePushPrefs(prefs: {
    push_enabled: boolean;
    vaccinations: boolean;
    appointments: boolean;
    medications: boolean;
    lost_dog_alerts: boolean;
  }) {
    return this.request('/push/prefs', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
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

  // Weight history endpoints
  async getWeightHistory(dogId: string) {
    return this.request<{ entries: any[] }>(`/dogs/${dogId}/weight`);
  }
  async addWeightEntry(dogId: string, data: { weight: number; date: string; notes?: string }) {
    return this.request<{ entry: any }>(`/dogs/${dogId}/weight`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async deleteWeightEntry(dogId: string, entryId: string) {
    return this.request(`/dogs/${dogId}/weight/${entryId}`, { method: 'DELETE' });
  }

  // Medication reminder endpoints
  async getMedicationReminders(dogId: string) {
    return this.request<{ reminders: any[] }>(`/dogs/${dogId}/reminders`);
  }
  async createMedicationReminder(dogId: string, data: any) {
    return this.request<{ reminder: any }>(`/dogs/${dogId}/reminders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateMedicationReminder(dogId: string, reminderId: string, data: any) {
    return this.request<{ reminder: any }>(`/dogs/${dogId}/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteMedicationReminder(dogId: string, reminderId: string) {
    return this.request(`/dogs/${dogId}/reminders/${reminderId}`, { method: 'DELETE' });
  }

  // Event update/delete
  async updateEvent(eventId: string, data: any) {
    return this.request<{ event: any }>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, { method: 'DELETE' });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request<{ stats: AdminStats }>('/admin/stats');
  }

  async getAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.search) q.append('search', params.search);
    return this.request<{ users: AdminUserSummary[]; total: number }>(`/admin/users?${q.toString()}`);
  }

  async getAdminReportedPosts() {
    return this.request<{ reports: AdminReportedPost[] }>('/admin/reported-posts');
  }

  async adminDeletePost(postId: string) {
    return this.request(`/admin/posts/${postId}`, { method: 'DELETE' });
  }

  async adminDismissReport(reportId: string) {
    return this.request(`/admin/reports/${reportId}/dismiss`, { method: 'POST' });
  }

  async getAdminDogs(params?: { page?: number; limit?: number; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.search) q.append('search', params.search);
    return this.request<{ dogs: AdminDog[]; total: number }>(`/admin/dogs?${q.toString()}`);
  }

  async adminDeleteDog(dogId: string) {
    return this.request(`/admin/dogs/${dogId}`, { method: 'DELETE' });
  }

  async adminToggleUserActive(userId: string, isActive: boolean) {
    return this.request<{ user: { id: string; is_active: boolean } }>(`/admin/users/${userId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
  }

  async adminDeleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  // Expense endpoints
  async getExpenses(dogId: string, params?: { month?: string; year?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.month) q.append('month', params.month);
    if (params?.year) q.append('year', params.year.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    return this.request<{ expenses: any[] }>(`/expenses/dog/${dogId}?${q.toString()}`);
  }

  async getYearlyExpenseStats(dogId: string, year?: number) {
    const q = year ? `?year=${year}` : '';
    return this.request<any>(`/expenses/dog/${dogId}/yearly${q}`);
  }

  async getExpenseStats(dogId: string, month?: string) {
    const q = month ? `?month=${month}` : '';
    return this.request<any>(`/expenses/dog/${dogId}/stats${q}`);
  }

  async createExpense(dogId: string, data: any) {
    return this.request<{ expense: any }>(`/expenses/dog/${dogId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExpense(dogId: string, expenseId: string, data: any) {
    return this.request<{ expense: any }>(`/expenses/dog/${dogId}/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExpense(dogId: string, expenseId: string) {
    return this.request(`/expenses/dog/${dogId}/${expenseId}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();