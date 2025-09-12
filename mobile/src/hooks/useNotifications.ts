import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== 'granted') return;
    
    try {
      return new Notification(title, {
        icon: '/logo-1.png',
        badge: '/logo-1.png',
        ...options,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  };

  const scheduleVaccinationReminder = (dogName: string, vaccineName: string, dueDate: Date) => {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7 && daysDiff > 0) {
      sendNotification(`Vaccination Reminder - ${dogName}`, {
        body: `${vaccineName} vaccination is due in ${daysDiff} day(s)`,
        tag: `vaccination-${dogName}-${vaccineName}`,
      });
    }
  };

  const scheduleAppointmentReminder = (dogName: string, appointmentTitle: string, appointmentDate: Date) => {
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    
    if (hoursDiff <= 24 && hoursDiff > 0) {
      sendNotification(`Appointment Reminder - ${dogName}`, {
        body: `${appointmentTitle} in ${hoursDiff} hour(s)`,
        tag: `appointment-${dogName}-${appointmentTitle}`,
      });
    }
  };

  return {
    supported,
    permission,
    requestPermission,
    sendNotification,
    scheduleVaccinationReminder,
    scheduleAppointmentReminder,
  };
};