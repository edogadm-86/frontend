import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const runMigrations = async () => {
  try {
    console.log('Starting database migration...');

    const migrationSQL = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP WITH TIME ZONE,
        language VARCHAR(5) DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create dogs table
      CREATE TABLE IF NOT EXISTS dogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        breed VARCHAR(255) NOT NULL,
        age INTEGER NOT NULL CHECK (age >= 0 AND age <= 30),
        weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
        profile_picture TEXT,
        microchip_id VARCHAR(50),
        license_number VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create vaccinations table
      CREATE TABLE IF NOT EXISTS vaccinations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        vaccine_type VARCHAR(255) NOT NULL,
        date_given DATE NOT NULL,
        next_due_date DATE,
        veterinarian VARCHAR(255) NOT NULL,
        batch_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create health_records table
      CREATE TABLE IF NOT EXISTS health_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('vet-visit', 'medication', 'illness', 'injury', 'other')),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        veterinarian VARCHAR(255),
        medication VARCHAR(255),
        dosage VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('vet', 'grooming', 'training', 'walk', 'feeding', 'other')),
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255),
        notes TEXT,
        reminder BOOLEAN DEFAULT true,
        reminder_time INTEGER DEFAULT 60,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create training_sessions table
      CREATE TABLE IF NOT EXISTS training_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        duration INTEGER NOT NULL CHECK (duration > 0),
        commands TEXT[] DEFAULT '{}',
        progress VARCHAR(20) NOT NULL CHECK (progress IN ('excellent', 'good', 'fair', 'needs-work')),
        notes TEXT NOT NULL,
        behavior_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create emergency_contacts table
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('vet', 'emergency-vet', 'poison-control', 'other')),
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        available_24h BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_dogs_user_id ON dogs(user_id);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_dog_id ON vaccinations(dog_id);
      CREATE INDEX IF NOT EXISTS idx_health_records_dog_id ON health_records(dog_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_dog_id ON appointments(dog_id);
      CREATE INDEX IF NOT EXISTS idx_training_sessions_dog_id ON training_sessions(dog_id);
      CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due_date ON vaccinations(next_due_date);

      -- Create trigger function for updating updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_dogs_updated_at ON dogs;
      CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await pool.query(migrationSQL);
    console.log('Database migration completed successfully!');
    
    // Test the connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();