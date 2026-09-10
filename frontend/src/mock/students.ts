// Mock student data — kept for development reference only.
// NOT imported by any production service.

import { Student } from '../types/student';

export const mockStudents: Student[] = [
  {
    id: 's1',
    student_id: 'STU-1001',
    roll_number: '1001',
    full_name: 'Alex Johnson',
    class_id: 'c1',
    section: 'A',
    date_of_birth: '2005-04-12',
    gender: 'male',
    parent_guardian: 'Michael Johnson',
    contact: '+1234567890',
    status: 'active',
    face_enrolled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 's2',
    student_id: 'STU-1002',
    roll_number: '1002',
    full_name: 'Sarah Williams',
    class_id: 'c1',
    section: 'A',
    date_of_birth: '2005-08-22',
    gender: 'female',
    parent_guardian: 'David Williams',
    contact: '+1234567891',
    status: 'active',
    face_enrolled: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 's3',
    student_id: 'STU-1003',
    roll_number: '1003',
    full_name: 'James Smith',
    class_id: 'c2',
    section: 'B',
    date_of_birth: '2006-01-15',
    gender: 'male',
    parent_guardian: 'Robert Smith',
    contact: '+1234567892',
    status: 'active',
    face_enrolled: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
];
