-- 006_face_profiles.sql

-- Enable the vector extension for storing face embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the face profiles table
CREATE TABLE IF NOT EXISTS student_face_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrollment_status TEXT NOT NULL DEFAULT 'pending' CHECK (enrollment_status IN ('pending', 'enrolled', 'failed', 'disabled')),
    embedding vector(128), -- Using 128 dimensions for FaceNet
    model_name TEXT,
    model_version TEXT,
    quality_score NUMERIC,
    enrolled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one active face profile per student
    CONSTRAINT unique_student_face UNIQUE (student_id)
);

-- RLS Policies for student_face_profiles
ALTER TABLE student_face_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Admins and Principals can view all face profiles
CREATE POLICY "Admins and principals can view face profiles"
    ON student_face_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'principal')
            AND users.is_active = TRUE
        )
    );

-- 2. Teachers can view face profiles of their students
CREATE POLICY "Teachers can view face profiles of their students"
    ON student_face_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            JOIN teachers ON teachers.email = users.email
            JOIN classes ON classes.teacher_id = teachers.id
            JOIN students ON students.class_id = classes.id
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
            AND users.is_active = TRUE
            AND students.id = student_face_profiles.student_id
        )
    );

-- 3. Admins can manage face profiles
CREATE POLICY "Admins can manage face profiles"
    ON student_face_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin')
            AND users.is_active = TRUE
        )
    );

-- 4. Teachers can manage face profiles for their classes
CREATE POLICY "Teachers can manage face profiles of their students"
    ON student_face_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            JOIN teachers ON teachers.email = users.email
            JOIN classes ON classes.teacher_id = teachers.id
            JOIN students ON students.class_id = classes.id
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
            AND users.is_active = TRUE
            AND students.id = student_face_profiles.student_id
        )
    );
