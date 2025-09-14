import React, { createContext, useContext, ReactNode } from 'react';
import { useApi } from '../hooks/useApi';
import { Dog, User, Vaccination, HealthRecord, Appointment, TrainingSession, Nutrition } from '../types';

interface AppContextType {
  user: User | null;
  updateUser: (userData: Partial<User>) => Promise<User>;
  dogs: Dog[];
  createDog: (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Dog>;
  updateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  vaccinations: Vaccination[];
  createVaccination: (vaccinationData: Omit<Vaccination, 'id'>) => Promise<Vaccination>;
  healthRecords: HealthRecord[];
  createHealthRecord: (recordData: Omit<HealthRecord, 'id' | 'documents'>) => Promise<HealthRecord>;
  appointments: Appointment[];
  createAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<Appointment>;
  trainingSessions: TrainingSession[];
  createTrainingSession: (sessionData: Omit<TrainingSession, 'id'>) => Promise<TrainingSession>;
  createEmergencyContact: (contactData: Omit<import('../types').EmergencyContact, 'id'>) => Promise<import('../types').EmergencyContact>;
  deleteVaccination: (dogId: string, vaccinationId: string) => Promise<void>;
  deleteHealthRecord: (dogId: string, recordId: string) => Promise<void>;
  deleteAppointment: (dogId: string, appointmentId: string) => Promise<void>;
  deleteTrainingSession: (dogId: string, sessionId: string) => Promise<void>;
  deleteEmergencyContact: (contactId: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => void;
  currentDog: Dog | null;
  setCurrentDog: (dog: Dog | null) => void;
  loading: boolean;
  nutritionRecords: Nutrition[];
  createNutritionRecord: (dogId: string, data: Omit<Nutrition, 'id'>) => Promise<Nutrition>;
  updateNutritionRecord: (dogId: string, recordId: string, data: Partial<Nutrition>) => Promise<Nutrition>;
  deleteNutritionRecord: (dogId: string, recordId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const {
    user,
    dogs,
    vaccinations,
    healthRecords,
    appointments,
    trainingSessions,
    loading,
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
    register,
    login,
    logout,
    nutritionRecords,
    createNutritionRecord,
    updateNutritionRecord,
    deleteNutritionRecord,
  } = useApi();

  const [currentDog, setCurrentDog] = React.useState<Dog | null>(null);

  // Set current dog to first dog when dogs are loaded
  React.useEffect(() => {
    if (dogs.length > 0 && !currentDog) {
      setCurrentDog(dogs[0]);
    }
  }, [dogs, currentDog]);

  const value: AppContextType = {
  user,
  updateUser,
  dogs,
  createDog,
  updateDog,
  vaccinations,
  createVaccination,
  healthRecords,
  createHealthRecord,
  appointments,
  createAppointment,
  trainingSessions,
  createTrainingSession,
  createEmergencyContact,
  deleteVaccination,       
  deleteHealthRecord,      
  deleteAppointment,      
  deleteTrainingSession,   
  deleteEmergencyContact,  
  register,
  login,
  logout,
  currentDog,
  setCurrentDog,
  loading,
   nutritionRecords,
  createNutritionRecord,
  updateNutritionRecord,
  deleteNutritionRecord,
};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};