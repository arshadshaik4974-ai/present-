-- 004_seed.sql

-- Clear existing data
TRUNCATE TABLE ai_events, attendance, students, classes, teachers, users RESTART IDENTITY CASCADE;

-- Insert Users (Mock Authentication profiles)
-- Note: In production, Supabase Auth handles passwords.
INSERT INTO users (id, username, email, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@school.edu', 'Admin User', 'admin'),
('22222222-2222-2222-2222-222222222222', 'principal', 'principal@school.edu', 'Principal Director', 'principal'),
('33333333-3333-3333-3333-333333333333', 't.smith', 'sarah.smith@school.edu', 'Sarah Smith', 'teacher');

-- Insert Teachers
INSERT INTO teachers (id, teacher_id, full_name, email, subject, phone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TCH001', 'Sarah Smith', 'sarah.smith@school.edu', 'Mathematics', '555-0101'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TCH002', 'John Davis', 'john.davis@school.edu', 'Science', '555-0102');

-- Insert Classes
INSERT INTO classes (id, name, section, academic_year, teacher_id, room) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Grade 10', 'A', '2023-2024', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Room 101'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Grade 10', 'B', '2023-2024', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Room 102');

-- Insert Students
INSERT INTO students (id, student_id, roll_number, full_name, class_id, section, face_enrolled) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STU001', '10-A-01', 'Alex Johnson', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'A', true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'STU002', '10-A-02', 'Emma Davis', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'A', false),
('12345678-1234-1234-1234-123456789012', 'STU003', '10-B-01', 'Michael Brown', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'B', true);

-- Insert Attendance (for today)
INSERT INTO attendance (student_id, class_id, date, status, source) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE, 'present', 'ai'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE, 'absent', 'manual');

-- Insert AI Events
INSERT INTO ai_events (event_type, camera_id, student_id, confidence) VALUES
('camera_started', 'CAM_MAIN_GATE', NULL, NULL),
('person_detected', 'CAM_MAIN_GATE', NULL, 0.95),
('face_detected', 'CAM_MAIN_GATE', NULL, 0.92),
('face_recognized', 'CAM_MAIN_GATE', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 0.98),
('attendance_marked', 'CAM_MAIN_GATE', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 0.98);
