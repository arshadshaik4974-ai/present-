-- 007_attendance_sessions.sql

-- Create the attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent multiple active sessions for the same class on the same day
    -- While a class can have multiple sessions in a day technically, it's safer to avoid overlap
    CONSTRAINT unique_active_session UNIQUE (class_id, date, status)
);

-- RLS Policies for attendance_sessions
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Admins and Principals can view all sessions
CREATE POLICY "Admins and principals can view sessions"
    ON attendance_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'principal')
            AND users.is_active = TRUE
        )
    );

-- 2. Teachers can view their own sessions
CREATE POLICY "Teachers can view their own sessions"
    ON attendance_sessions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            JOIN teachers ON teachers.email = users.email
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
            AND users.is_active = TRUE
            AND attendance_sessions.teacher_id = teachers.id
        )
    );

-- 3. Admins can manage sessions
CREATE POLICY "Admins can manage sessions"
    ON attendance_sessions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = TRUE
        )
    );

-- 4. Teachers can manage their own sessions
CREATE POLICY "Teachers can manage their own sessions"
    ON attendance_sessions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            JOIN teachers ON teachers.email = users.email
            WHERE users.id = auth.uid()
            AND users.role = 'teacher'
            AND users.is_active = TRUE
            AND attendance_sessions.teacher_id = teachers.id
        )
    );
