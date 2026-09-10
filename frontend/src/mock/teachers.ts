// Mock teacher data — kept for development reference only.
// NOT imported by any production service.

import { Teacher } from '../types/teacher';

export const mockTeachers: Teacher[] = [
  {
    id: 't1',
    teacher_id: 'T-101',
    full_name: 'John Doe',
    email: 'john.doe@school.edu',
    phone: '+1987654321',
    subject: 'Mathematics',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 't2',
    teacher_id: 'T-102',
    full_name: 'Jane Smith',
    email: 'jane.smith@school.edu',
    phone: '+1987654322',
    subject: 'Physics',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
];
