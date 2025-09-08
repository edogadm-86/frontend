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
        date_of_birth DATE NOT NULL,
        weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
        profile_picture TEXT,
        microchip_id VARCHAR(50),
        passport_number VARCHAR(50),
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

      -- Create documents table for file attachments
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
        vaccination_id UUID REFERENCES vaccinations(id) ON DELETE CASCADE,
        health_record_id UUID REFERENCES health_records(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('profile_image', 'vaccination_document', 'health_document', 'license', 'microchip', 'other')),
        uploaded_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create posts table for community features
      CREATE TABLE IF NOT EXISTS posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        post_type VARCHAR(50) NOT NULL CHECK (post_type IN ('story', 'question', 'tip', 'event', 'photo', 'video')),
        image_url TEXT,
        video_url TEXT,
        tags TEXT[],
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create events table
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meetup', 'training', 'competition', 'adoption', 'fundraiser', 'other')),
        location VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        image_url TEXT,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create post_likes table
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      );

      -- Create post_comments table
      CREATE TABLE IF NOT EXISTS post_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create event_participants table
      CREATE TABLE IF NOT EXISTS event_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );

      -- Create indexes for new tables
      CREATE INDEX IF NOT EXISTS idx_documents_dog_id ON documents(dog_id);
      CREATE INDEX IF NOT EXISTS idx_documents_vaccination_id ON documents(vaccination_id);
      CREATE INDEX IF NOT EXISTS idx_documents_health_record_id ON documents(health_record_id);
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
      CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
      CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
      CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

      -- Create nutrition_records table
      CREATE TABLE IF NOT EXISTS nutrition_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        food_brand VARCHAR(255) NOT NULL,
        food_type VARCHAR(255) NOT NULL,
        daily_amount DECIMAL(6,2) NOT NULL CHECK (daily_amount > 0),
        calories_per_day INTEGER NOT NULL CHECK (calories_per_day > 0),
        protein_percentage DECIMAL(5,2) NOT NULL CHECK (protein_percentage >= 0 AND protein_percentage <= 100),
        fat_percentage DECIMAL(5,2) NOT NULL CHECK (fat_percentage >= 0 AND fat_percentage <= 100),
        carb_percentage DECIMAL(5,2) NOT NULL CHECK (carb_percentage >= 0 AND carb_percentage <= 100),
        supplements TEXT[] DEFAULT '{}',
        notes TEXT,
        weight_at_time DECIMAL(5,2) NOT NULL CHECK (weight_at_time > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create meal_plans table
      CREATE TABLE IF NOT EXISTS meal_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
        meal_time TIME NOT NULL,
        food_type VARCHAR(255) NOT NULL,
        amount DECIMAL(6,2) NOT NULL CHECK (amount > 0),
        calories INTEGER NOT NULL CHECK (calories > 0),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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

      DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
      CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_events_updated_at ON events;
      CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
      CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_nutrition_records_updated_at ON nutrition_records;
      CREATE TRIGGER update_nutrition_records_updated_at BEFORE UPDATE ON nutrition_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
      CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- Create indexes for nutrition tables
      CREATE INDEX IF NOT EXISTS idx_nutrition_records_dog_id ON nutrition_records(dog_id);
      CREATE INDEX IF NOT EXISTS idx_nutrition_records_date ON nutrition_records(date);
      CREATE INDEX IF NOT EXISTS idx_meal_plans_dog_id ON meal_plans(dog_id);
      CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON meal_plans(is_active);
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