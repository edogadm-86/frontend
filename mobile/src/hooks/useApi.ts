import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact, Nutrition } from '../types';

export const useApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nutritionRecords, setNutritionRecords] = useState<Nutrition[]>([]);

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
        const allVaccinations: Vaccination[] = [];
        const allHealthRecords: HealthRecord[] = [];
        const allAppointments: Appointment[] = [];
        const allTrainingSessions: TrainingSession[] = [];

        for (const dog of dogsWithTypes) {
          // Load vaccinations
          try {
            const vaccinationsResponse = await apiClient.getVaccinations(dog.id);
            const vaccinationsWithTypes = vaccinationsResponse.vaccinations.map(vaccination => ({
              id: vaccination.id,
              dogId: vaccination.dog_id,
              vaccineName: vaccination.vaccine_name,
              vaccineType: vaccination.vaccine_type,
              dateGiven: new Date(vaccination.date_given),
              nextDueDate: vaccination.next_due_date ? new Date(vaccination.next_due_date) : undefined,
              veterinarian: vaccination.veterinarian,
              batchNumber: vaccination.batch_number,
              notes: vaccination.notes,
            }));
            allVaccinations.push(...vaccinationsWithTypes);
          } catch (error) {
            console.error(`Error loading vaccinations for dog ${dog.id}:`, error);
          }

          // Load health records
          try {
            const healthResponse = await apiClient.getHealthRecords(dog.id);
            const healthWithTypes = healthResponse.healthRecords.map(record => ({
              id: record.id,
              dogId: record.dog_id,
              date: new Date(record.date),
              type: record.type as HealthRecord['type'],
              title: record.title,
              description: record.description,
              veterinarian: record.veterinarian,
              medication: record.medication,
              dosage: record.dosage,
              documents: [],
            }));
            allHealthRecords.push(...healthWithTypes);
          } catch (error) {
            console.error(`Error loading health records for dog ${dog.id}:`, error);
          }

          // Load appointments
          try {
            const appointmentsResponse = await apiClient.getAppointments(dog.id);
            const appointmentsWithTypes = appointmentsResponse.appointments.map(appointment => ({
              id: appointment.id,
              dogId: appointment.dog_id,
              title: appointment.title,
              type: appointment.type as Appointment['type'],
              date: new Date(appointment.date),
              time: appointment.time,
              location: appointment.location,
              notes: appointment.notes,
              reminder: appointment.reminder,
              reminderTime: appointment.reminder_time,
            }));
            allAppointments.push(...appointmentsWithTypes);
          } catch (error) {
            console.error(`Error loading appointments for dog ${dog.id}:`, error);
          }
          
          // Load training sessions
          try {
            const trainingResponse = await apiClient.getTrainingSessions(dog.id);
            const trainingWithTypes = trainingResponse.trainingSessions.map(session => ({
              id: session.id,
              dogId: session.dog_id,
              date: new Date(session.date),
              duration: session.duration,
              commands: session.commands,
              progress: session.progress as TrainingSession['progress'],
              notes: session.notes,
              behaviorNotes: session.behavior_notes,
            }));
            allTrainingSessions.push(...trainingWithTypes);
          } catch (error) {
            console.error(`Error loading training sessions for dog ${dog.id}:`, error);
          }
        }

        setVaccinations(allVaccinations);
        setHealthRecords(allHealthRecords);
        setAppointments(allAppointments);
        setTrainingSessions(allTrainingSessions);
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
   // ---- Nutrition methods ----
  async function getNutritionRecords(dogId: string) {
    const { nutritionRecords } = await apiClient.getNutritionRecords(dogId);
    setNutritionRecords(nutritionRecords);
    return nutritionRecords;
  }

 async function createNutritionRecord(dogId: string, data: Omit<Nutrition, 'id'>): Promise<Nutrition> {
  const res = await apiClient.createNutritionRecord(dogId, data);
  // assuming API returns { nutritionRecord: {...} }
  const record: Nutrition = res.nutritionRecord;
  setNutritionRecords((prev) => [...prev, record]);
  return record;
}

async function updateNutritionRecord(dogId: string, recordId: string, data: Partial<Nutrition>): Promise<Nutrition> {
  const res = await apiClient.updateNutritionRecord(dogId, recordId, data);
  const record: Nutrition = res.nutritionRecord;
  setNutritionRecords((prev) =>
    prev.map((r) => (r.id === record.id ? record : r))
  );
  return record;
}


  async function deleteNutritionRecord(dogId: string, recordId: string) {
    await apiClient.deleteNutritionRecord(dogId, recordId);
    setNutritionRecords((prev) => prev.filter((r) => r.id !== recordId));
  }
  const createVaccination = async (vaccinationData: Omit<Vaccination, 'id'>) => {
    try {
      const response = await apiClient.createVaccination(vaccinationData.dogId, vaccinationData);
      const newVaccination: Vaccination = {
        id: response.vaccination.id,
        dogId: response.vaccination.dog_id,
        vaccineName: response.vaccination.vaccine_name,
        vaccineType: response.vaccination.vaccine_type,
        dateGiven: new Date(response.vaccination.date_given),
        nextDueDate: response.vaccination.next_due_date ? new Date(response.vaccination.next_due_date) : undefined,
        veterinarian: response.vaccination.veterinarian,
        batchNumber: response.vaccination.batch_number,
        notes: response.vaccination.notes,
      };
      setVaccinations(prev => [...prev, newVaccination]);
      return newVaccination;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createHealthRecord = async (recordData: Omit<HealthRecord, 'id' | 'documents'>) => {
    try {
      const response = await apiClient.createHealthRecord(recordData.dogId, recordData);
      const newRecord: HealthRecord = {
        id: response.healthRecord.id,
        dogId: response.healthRecord.dog_id,
        date: new Date(response.healthRecord.date),
        type: response.healthRecord.type as HealthRecord['type'],
        title: response.healthRecord.title,
        description: response.healthRecord.description,
        veterinarian: response.healthRecord.veterinarian,
        medication: response.healthRecord.medication,
        dosage: response.healthRecord.dosage,
        documents: [],
      };
      setHealthRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      const response = await apiClient.createAppointment(appointmentData.dogId, appointmentData);
      const newAppointment: Appointment = {
        id: response.appointment.id,
        dogId: response.appointment.dog_id,
        title: response.appointment.title,
        type: response.appointment.type as Appointment['type'],
        date: new Date(response.appointment.date),
        time: response.appointment.time,
        location: response.appointment.location,
        notes: response.appointment.notes,
        reminder: response.appointment.reminder,
        reminderTime: response.appointment.reminder_time,
      };
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createTrainingSession = async (sessionData: Omit<TrainingSession, 'id'>) => {
    try {
      const response = await apiClient.createTrainingSession(sessionData.dogId, sessionData);
      const newSession: TrainingSession = {
        id: response.trainingSession.id,
        dogId: response.trainingSession.dog_id,
        date: new Date(response.trainingSession.date),
        duration: response.trainingSession.duration,
        commands: response.trainingSession.commands,
        progress: response.trainingSession.progress as TrainingSession['progress'],
        notes: response.trainingSession.notes,
        behaviorNotes: response.trainingSession.behavior_notes,
      };
      setTrainingSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createEmergencyContact = async (contactData: Omit<EmergencyContact, 'id'>) => {
    try {
      const response = await apiClient.createEmergencyContact(contactData);
      const newContact: EmergencyContact = {
        id: response.emergencyContact.id,
        name: response.emergencyContact.name,
        type: response.emergencyContact.type as EmergencyContact['type'],
        phone: response.emergencyContact.phone,
        address: response.emergencyContact.address,
        available24h: response.emergencyContact.available_24h,
      };
      setEmergencyContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData);
      setUser(response.user);
      return response.user;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteVaccination = async (dogId: string, vaccinationId: string) => {
    try {
      await apiClient.deleteVaccination(dogId, vaccinationId);
      setVaccinations(prev => prev.filter(v => v.id !== vaccinationId));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteHealthRecord = async (dogId: string, recordId: string) => {
    try {
      await apiClient.deleteHealthRecord(dogId, recordId);
      setHealthRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteAppointment = async (dogId: string, appointmentId: string) => {
    try {
      await apiClient.deleteAppointment(dogId, appointmentId);
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteTrainingSession = async (dogId: string, sessionId: string) => {
    try {
      await apiClient.deleteTrainingSession(dogId, sessionId);
      setTrainingSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteEmergencyContact = async (contactId: string) => {
    try {
      await apiClient.deleteEmergencyContact(contactId);
      setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
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
    loading,
    error,
    register,
    login,
    logout,
    createDog,
    updateDog,
    createVaccination,
    createHealthRecord,
    createAppointment,
    createTrainingSession,
    createEmergencyContact,
    updateUser,
    deleteVaccination,
    deleteHealthRecord,
    deleteAppointment,
    deleteTrainingSession,
    deleteEmergencyContact,
    loadUser,
    nutritionRecords,
    getNutritionRecords,
    createNutritionRecord,
    updateNutritionRecord,
    deleteNutritionRecord,
  };
};