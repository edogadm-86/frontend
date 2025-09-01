import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact } from '../types';

export const useApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [nutritionRecords, setNutritionRecords] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<{ [dogId: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProfile();
      setUser(response.user);
      await loadAllData();
    } catch (error: any) {
      console.error('Error loading user:', error);
      if (error.message.includes('token') || error.message.includes('401')) {
        apiClient.clearToken();
        setUser(null);
      }
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load all user data
  const loadAllData = async () => {
    try {
      // Load dogs
      const dogsResponse = await apiClient.getDogs();
      const dogsWithTypes: Dog[] = dogsResponse.dogs.map(dog => ({
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        weight: dog.weight,
        profilePicture: dog.profile_picture,
        microchipId: dog.microchip_id,
        licenseNumber: dog.license_number,
        documents: [],
        createdAt: new Date(dog.created_at),
        updatedAt: new Date(dog.updated_at),
      }));
      setDogs(dogsWithTypes);

      // Load emergency contacts
      const contactsResponse = await apiClient.getEmergencyContacts();
      const contactsWithTypes: EmergencyContact[] = contactsResponse.emergencyContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        type: contact.type as EmergencyContact['type'],
        phone: contact.phone,
        address: contact.address,
        available24h: contact.available_24h,
      }));
      setEmergencyContacts(contactsWithTypes);

      // Load data for each dog
      if (dogsWithTypes.length > 0) {
        const allVaccinations: any[] = [];
        const allHealthRecords: any[] = [];
        const allAppointments: any[] = [];
        const allTrainingSessions: any[] = [];
        const allNutritionRecords: any[] = [];
        const allMealPlans: { [dogId: string]: any[] } = {};

        for (const dog of dogsWithTypes) {
          try {
            const [vaccinationsRes, healthRes, appointmentsRes, trainingRes, nutritionRes, mealPlanRes] = await Promise.all([
              apiClient.getVaccinations(dog.id),
              apiClient.getHealthRecords(dog.id),
              apiClient.getAppointments(dog.id),
              apiClient.getTrainingSessions(dog.id),
              apiClient.getNutritionRecords(dog.id),
              apiClient.getMealPlan(dog.id),
            ]);

            allVaccinations.push(...vaccinationsRes.vaccinations);
            allHealthRecords.push(...healthRes.healthRecords);
            allAppointments.push(...appointmentsRes.appointments);
            allTrainingSessions.push(...trainingRes.trainingSessions);
            allNutritionRecords.push(...nutritionRes.nutritionRecords);
            allMealPlans[dog.id] = mealPlanRes.mealPlan;
          } catch (error) {
            console.error(`Error loading data for dog ${dog.id}:`, error);
          }
        }

        setVaccinations(allVaccinations);
        setHealthRecords(allHealthRecords);
        setAppointments(allAppointments);
        setTrainingSessions(allTrainingSessions);
        setNutritionRecords(allNutritionRecords);
        setMealPlans(allMealPlans);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message);
    }
  };

  // Auth functions
  const register = async (userData: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const response = await apiClient.register(userData);
      setUser(response.user);
      await loadAllData();
      return response;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      await loadAllData();
      return response;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    setDogs([]);
    setVaccinations([]);
    setHealthRecords([]);
    setAppointments([]);
    setTrainingSessions([]);
    setEmergencyContacts([]);
    setNutritionRecords([]);
    setMealPlans({});
  };

  // CRUD operations
  const createDog = async (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiClient.createDog(dogData);
      const newDog: Dog = {
        id: response.dog.id,
        name: response.dog.name,
        breed: response.dog.breed,
        age: response.dog.age,
        weight: response.dog.weight,
        profilePicture: response.dog.profile_picture,
        microchipId: response.dog.microchip_id,
        licenseNumber: response.dog.license_number,
        documents: [],
        createdAt: new Date(response.dog.created_at),
        updatedAt: new Date(response.dog.updated_at),
      };
      setDogs(prev => [...prev, newDog]);
      return newDog;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
    try {
      const response = await apiClient.updateDog(dogId, dogData);
      const updatedDog: Dog = {
        id: response.dog.id,
        name: response.dog.name,
        breed: response.dog.breed,
        age: response.dog.age,
        weight: response.dog.weight,
        profilePicture: response.dog.profile_picture,
        microchipId: response.dog.microchip_id,
        licenseNumber: response.dog.license_number,
        documents: [],
        createdAt: new Date(response.dog.created_at),
        updatedAt: new Date(response.dog.updated_at),
      };
      setDogs(prev => prev.map(dog => dog.id === dogId ? updatedDog : dog));
      return updatedDog;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    dogs,
    vaccinations,
    healthRecords,
    appointments,
    trainingSessions,
    emergencyContacts,
    nutritionRecords,
    mealPlans,
    loading,
    error,
    register,
    login,
    logout,
    createDog,
    updateDog,
    loadUser,
  };
};