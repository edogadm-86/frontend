import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Dog, Vaccination, HealthRecord, Appointment, TrainingSession, EmergencyContact } from '../types';

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data
  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        dogs: [],
        emergencyContacts: [],
      };

      setUser(userData);
      await loadAllData(authUser.id);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load all user data
  const loadAllData = async (userId: string) => {
    try {
      // Load dogs
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .eq('user_id', userId);

      if (dogsError) throw dogsError;

      const dogsWithTypes: Dog[] = dogsData.map(dog => ({
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
      const { data: contactsData, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);

      if (contactsError) throw contactsError;

      const contactsWithTypes: EmergencyContact[] = contactsData.map(contact => ({
        id: contact.id,
        name: contact.name,
        type: contact.type as EmergencyContact['type'],
        phone: contact.phone,
        address: contact.address,
        available24h: contact.available_24h,
      }));

      setEmergencyContacts(contactsWithTypes);

      if (dogsWithTypes.length > 0) {
        const dogIds = dogsWithTypes.map(dog => dog.id);

        // Load vaccinations
        const { data: vaccinationsData, error: vaccinationsError } = await supabase
          .from('vaccinations')
          .select('*')
          .in('dog_id', dogIds);

        if (vaccinationsError) throw vaccinationsError;

        const vaccinationsWithTypes: Vaccination[] = vaccinationsData.map(vaccination => ({
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

        setVaccinations(vaccinationsWithTypes);

        // Load health records
        const { data: healthData, error: healthError } = await supabase
          .from('health_records')
          .select('*')
          .in('dog_id', dogIds);

        if (healthError) throw healthError;

        const healthWithTypes: HealthRecord[] = healthData.map(record => ({
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

        setHealthRecords(healthWithTypes);

        // Load appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .in('dog_id', dogIds);

        if (appointmentsError) throw appointmentsError;

        const appointmentsWithTypes: Appointment[] = appointmentsData.map(appointment => ({
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

        setAppointments(appointmentsWithTypes);

        // Load training sessions
        const { data: trainingData, error: trainingError } = await supabase
          .from('training_sessions')
          .select('*')
          .in('dog_id', dogIds);

        if (trainingError) throw trainingError;

        const trainingWithTypes: TrainingSession[] = trainingData.map(session => ({
          id: session.id,
          dogId: session.dog_id,
          date: new Date(session.date),
          duration: session.duration,
          commands: session.commands,
          progress: session.progress as TrainingSession['progress'],
          notes: session.notes,
          behaviorNotes: session.behavior_notes,
        }));

        setTrainingSessions(trainingWithTypes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // CRUD operations for dogs
  const createDog = async (dogData: Omit<Dog, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dogs')
      .insert({
        user_id: user.id,
        name: dogData.name,
        breed: dogData.breed,
        age: dogData.age,
        weight: dogData.weight,
        profile_picture: dogData.profilePicture,
        microchip_id: dogData.microchipId,
        license_number: dogData.licenseNumber,
      })
      .select()
      .single();

    if (error) throw error;

    const newDog: Dog = {
      id: data.id,
      name: data.name,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      profilePicture: data.profile_picture,
      microchipId: data.microchip_id,
      licenseNumber: data.license_number,
      documents: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setDogs(prev => [...prev, newDog]);
    return newDog;
  };

  const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
    const { data, error } = await supabase
      .from('dogs')
      .update({
        name: dogData.name,
        breed: dogData.breed,
        age: dogData.age,
        weight: dogData.weight,
        profile_picture: dogData.profilePicture,
        microchip_id: dogData.microchipId,
        license_number: dogData.licenseNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dogId)
      .select()
      .single();

    if (error) throw error;

    const updatedDog: Dog = {
      id: data.id,
      name: data.name,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      profilePicture: data.profile_picture,
      microchipId: data.microchip_id,
      licenseNumber: data.license_number,
      documents: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setDogs(prev => prev.map(dog => dog.id === dogId ? updatedDog : dog));
    return updatedDog;
  };

  // CRUD operations for vaccinations
  const createVaccination = async (vaccinationData: Omit<Vaccination, 'id'>) => {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert({
        dog_id: vaccinationData.dogId,
        vaccine_name: vaccinationData.vaccineName,
        vaccine_type: vaccinationData.vaccineType,
        date_given: vaccinationData.dateGiven.toISOString().split('T')[0],
        next_due_date: vaccinationData.nextDueDate?.toISOString().split('T')[0],
        veterinarian: vaccinationData.veterinarian,
        batch_number: vaccinationData.batchNumber,
        notes: vaccinationData.notes,
      })
      .select()
      .single();

    if (error) throw error;

    const newVaccination: Vaccination = {
      id: data.id,
      dogId: data.dog_id,
      vaccineName: data.vaccine_name,
      vaccineType: data.vaccine_type,
      dateGiven: new Date(data.date_given),
      nextDueDate: data.next_due_date ? new Date(data.next_due_date) : undefined,
      veterinarian: data.veterinarian,
      batchNumber: data.batch_number,
      notes: data.notes,
    };

    setVaccinations(prev => [...prev, newVaccination]);
    return newVaccination;
  };

  // CRUD operations for health records
  const createHealthRecord = async (recordData: Omit<HealthRecord, 'id' | 'documents'>) => {
    const { data, error } = await supabase
      .from('health_records')
      .insert({
        dog_id: recordData.dogId,
        date: recordData.date.toISOString().split('T')[0],
        type: recordData.type,
        title: recordData.title,
        description: recordData.description,
        veterinarian: recordData.veterinarian,
        medication: recordData.medication,
        dosage: recordData.dosage,
      })
      .select()
      .single();

    if (error) throw error;

    const newRecord: HealthRecord = {
      id: data.id,
      dogId: data.dog_id,
      date: new Date(data.date),
      type: data.type as HealthRecord['type'],
      title: data.title,
      description: data.description,
      veterinarian: data.veterinarian,
      medication: data.medication,
      dosage: data.dosage,
      documents: [],
    };

    setHealthRecords(prev => [...prev, newRecord]);
    return newRecord;
  };

  // CRUD operations for appointments
  const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        dog_id: appointmentData.dogId,
        title: appointmentData.title,
        type: appointmentData.type,
        date: appointmentData.date.toISOString().split('T')[0],
        time: appointmentData.time,
        location: appointmentData.location,
        notes: appointmentData.notes,
        reminder: appointmentData.reminder,
        reminder_time: appointmentData.reminderTime,
      })
      .select()
      .single();

    if (error) throw error;

    const newAppointment: Appointment = {
      id: data.id,
      dogId: data.dog_id,
      title: data.title,
      type: data.type as Appointment['type'],
      date: new Date(data.date),
      time: data.time,
      location: data.location,
      notes: data.notes,
      reminder: data.reminder,
      reminderTime: data.reminder_time,
    };

    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  // CRUD operations for training sessions
  const createTrainingSession = async (sessionData: Omit<TrainingSession, 'id'>) => {
    const { data, error } = await supabase
      .from('training_sessions')
      .insert({
        dog_id: sessionData.dogId,
        date: sessionData.date.toISOString().split('T')[0],
        duration: sessionData.duration,
        commands: sessionData.commands,
        progress: sessionData.progress,
        notes: sessionData.notes,
        behavior_notes: sessionData.behaviorNotes,
      })
      .select()
      .single();

    if (error) throw error;

    const newSession: TrainingSession = {
      id: data.id,
      dogId: data.dog_id,
      date: new Date(data.date),
      duration: data.duration,
      commands: data.commands,
      progress: data.progress as TrainingSession['progress'],
      notes: data.notes,
      behaviorNotes: data.behavior_notes,
    };

    setTrainingSessions(prev => [...prev, newSession]);
    return newSession;
  };

  // CRUD operations for emergency contacts
  const createEmergencyContact = async (contactData: Omit<EmergencyContact, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: contactData.name,
        type: contactData.type,
        phone: contactData.phone,
        address: contactData.address,
        available_24h: contactData.available24h,
      })
      .select()
      .single();

    if (error) throw error;

    const newContact: EmergencyContact = {
      id: data.id,
      name: data.name,
      type: data.type as EmergencyContact['type'],
      phone: data.phone,
      address: data.address,
      available24h: data.available_24h,
    };

    setEmergencyContacts(prev => [...prev, newContact]);
    return newContact;
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    const updatedUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      dogs: dogs,
      emergencyContacts: emergencyContacts,
    };

    setUser(updatedUser);
    return updatedUser;
  };

  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setDogs([]);
          setVaccinations([]);
          setHealthRecords([]);
          setAppointments([]);
          setTrainingSessions([]);
          setEmergencyContacts([]);
        }
      }
    );

    return () => subscription.unsubscribe();
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
    createDog,
    updateDog,
    createVaccination,
    createHealthRecord,
    createAppointment,
    createTrainingSession,
    createEmergencyContact,
    updateUser,
    loadUser,
  };
};