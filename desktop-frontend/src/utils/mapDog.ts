import { Dog } from '../types';

export const mapDogResponse = (dog: any): Dog => ({
  id: dog.id,
  name: dog.name,
  breed: dog.breed,
  dateOfBirth: dog.date_of_birth ? new Date(dog.date_of_birth) : undefined,
  weight: dog.weight,
  profilePicture: dog.profile_picture,
  microchipId: dog.microchip_id,
  passportNumber: dog.passport_number,
  sex: dog.sex,
  colour: dog.colour,
  features: dog.features,
  documents: dog.documents || [],
  createdAt: dog.created_at ? new Date(dog.created_at) : undefined,
  updatedAt: dog.updated_at ? new Date(dog.updated_at) : undefined,
});
