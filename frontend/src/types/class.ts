// Class types aligned with backend schemas (app/schemas/class_schema.py)

export interface Class {
  id: string;
  name: string;
  section: string;
  academic_year: string | null;
  teacher_id: string | null;
  room: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ClassCreate {
  name: string;
  section: string;
  academic_year?: string;
  teacher_id?: string;
  room?: string;
  status?: string;
}

export interface ClassUpdate {
  name?: string;
  section?: string;
  academic_year?: string;
  teacher_id?: string;
  room?: string;
  status?: string;
}
