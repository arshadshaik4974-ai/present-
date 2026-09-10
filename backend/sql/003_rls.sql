-- 003_rls.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- Note: Since we are using Supabase Python Client initialized with SERVICE_ROLE_KEY
-- in our backend to execute queries, it bypasses RLS by default.
-- However, we still define the policies to secure the database at the Postgres level
-- if direct access is ever attempted by an anon/authenticated web client.

-- Example policies (Assuming a custom claim `user_role` or linking to `users` table)

-- 1. Principals/Admins have full access
CREATE POLICY "Admin Full Access Users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('principal', 'admin'))
);

CREATE POLICY "Admin Full Access Teachers" ON teachers FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('principal', 'admin'))
);

CREATE POLICY "Admin Full Access Classes" ON classes FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('principal', 'admin'))
);

CREATE POLICY "Admin Full Access Students" ON students FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('principal', 'admin'))
);

CREATE POLICY "Admin Full Access Attendance" ON attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('principal', 'admin'))
);

-- 2. Teachers have restricted access
-- Teachers can only see students in their assigned classes
CREATE POLICY "Teacher View Assigned Students" ON students FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM classes c 
        JOIN teachers t ON c.teacher_id = t.id 
        WHERE c.id = students.class_id AND t.email = (SELECT email FROM users WHERE id = auth.uid())
    )
);

-- Teachers can only view/manage attendance for their classes
CREATE POLICY "Teacher Manage Assigned Attendance" ON attendance FOR ALL USING (
    EXISTS (
        SELECT 1 FROM classes c 
        JOIN teachers t ON c.teacher_id = t.id 
        WHERE c.id = attendance.class_id AND t.email = (SELECT email FROM users WHERE id = auth.uid())
    )
);
