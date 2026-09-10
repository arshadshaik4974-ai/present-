// Teacher types aligned with backend schemas (app/schemas/teacher.py)

export interface Teacher {
  id: string;
  teacher_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherCreate {
  teacher_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  subject?: string;
  status?: string;
}

export interface TeacherUpdate {
  teacher_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  status?: string;
}
