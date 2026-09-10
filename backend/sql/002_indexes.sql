-- 002_indexes.sql

-- Students Indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);

-- Teachers Indexes
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers(teacher_id);

-- Classes Indexes
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);

-- Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- AI Events Indexes
CREATE INDEX IF NOT EXISTS idx_ai_events_timestamp ON ai_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_events_student_id ON ai_events(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_camera_id ON ai_events(camera_id);
