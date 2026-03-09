-- DIGI REFERENT Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (students, trainers, admin)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'trainer', 'admin')),
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('homme', 'femme', 'autre')),
  location VARCHAR(100),
  avatar_color VARCHAR(20) DEFAULT '#3B82F6',
  total_points INTEGER DEFAULT 0,
  level_id INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Levels/Tiers system
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  badge_icon VARCHAR(50),
  color VARCHAR(20)
);

-- Modules (Email, Ordinateur, Internet, Smartphone)
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  order_index INTEGER DEFAULT 0
);

-- Courses within modules
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) DEFAULT 'débutant' CHECK (difficulty IN ('débutant', 'intermédiaire', 'avancé')),
  order_index INTEGER DEFAULT 0,
  pdf_url VARCHAR(500),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises for each course
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('qcm', 'vrai_faux', 'association', 'ordre', 'texte_a_trous')),
  question TEXT NOT NULL,
  data JSONB NOT NULL,
  points INTEGER DEFAULT 10,
  difficulty VARCHAR(20) DEFAULT 'facile' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

-- Student exercise attempts/results
CREATE TABLE IF NOT EXISTS exercise_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  answers JSONB,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exercise_id)
);

-- Course completion tracking
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- Badges system
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  condition_type VARCHAR(50),
  condition_value INTEGER
);

-- Student badges earned
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- Messaging system
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(300),
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDF files (planning, course materials)
CREATE TABLE IF NOT EXISTS pdf_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('planning', 'course', 'practice')),
  course_id INTEGER REFERENCES courses(id),
  file_path VARCHAR(500) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(200),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercise_results_student ON exercise_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exercise_results_course ON exercise_results(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_student ON course_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
