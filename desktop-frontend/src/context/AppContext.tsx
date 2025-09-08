import React, { createContext, useContext, ReactNode } from 'react';
import { useApi } from '../hooks/useApi';
import { Dog, User } from '../types';

interface AppContextType {
  user: User | null;
  dogs: Dog[];
  vaccinations: any[];
  healthRecords: any[];
  appointments: any[];
  trainingSessions: any[];
  emergencyContacts: any[];
  nutritionRecords: any[];
  mealPlans: { [dogId: string]: any[] };
  loading: boolean;
  error: string | null;
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<any>;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => void;
  createDog: (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => Promise<Dog>;
  updateDog: (dogId: string, dogData: Partial<Dog>) => Promise<Dog>;
  deleteDog: (dogId: string) => Promise<void>;
  currentDog: Dog | null;
  setCurrentDog: (dog: Dog | null) => void;
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
    deleteDog,
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
    deleteDog,
    currentDog,
    setCurrentDog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};