-- 008_cameras.sql

CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rtsp_url TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;

-- 1. Admins and principals can view cameras
CREATE POLICY "Admins and principals can view cameras"
    ON cameras
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'principal')
            AND users.is_active = TRUE
        )
    );

-- 2. Admins can manage cameras
CREATE POLICY "Admins can manage cameras"
    ON cameras
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
            AND users.is_active = TRUE
        )
    );

-- Seed with a sample camera to test with (can be modified by user later)
INSERT INTO cameras (name, rtsp_url, location) 
VALUES ('Main Gate Entry', 'rtsp://admin:admin@192.168.1.100:554/stream1', 'Gate 1')
ON CONFLICT DO NOTHING;
