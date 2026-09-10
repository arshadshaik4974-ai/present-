-- 001_initial_schema.sql

-- Drop existing tables to ensure clean state (if needed during dev, comment out in prod)
DROP TABLE IF EXISTS ai_events CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Application profile synced with Supabase Auth or standalone)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('principal', 'admin', 'teacher')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TEACHERS
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    subject TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    academic_year TEXT,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    room TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT UNIQUE NOT NULL,
    roll_number TEXT,
    full_name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    section TEXT,
    date_of_birth DATE,
    gender TEXT,
    parent_guardian TEXT,
    contact TEXT,
    status TEXT DEFAULT 'active',
    face_enrolled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATTENDANCE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    source TEXT NOT NULL CHECK (source IN ('manual', 'teacher', 'ai')),
    confidence NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent accidental duplicate daily attendance for the same student+class
    CONSTRAINT unique_daily_attendance UNIQUE (student_id, class_id, date)
);

-- 6. AI EVENTS
CREATE TABLE ai_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL CHECK (event_type IN ('person_detected', 'face_detected', 'face_recognized', 'unknown_person', 'attendance_marked', 'camera_started', 'camera_stopped')),
    camera_id TEXT,
    track_id TEXT,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    confidence NUMERIC,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);
