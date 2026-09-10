// Student types aligned with backend schemas (app/schemas/student.py)

export interface Student {
  id: string;
  student_id: string;
  roll_number: string | null;
  full_name: string;
  class_id: string | null;
  section: string | null;
  date_of_birth: string | null;
  gender: string | null;
  parent_guardian: string | null;
  contact: string | null;
  status: string;
  face_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  student_id: string;
  roll_number?: string;
  full_name: string;
  class_id?: string;
  section?: string;
  date_of_birth?: string;
  gender?: string;
  parent_guardian?: string;
  contact?: string;
  status?: string;
  face_enrolled?: boolean;
}

export interface StudentUpdate {
  student_id?: string;
  roll_number?: string;
  full_name?: string;
  class_id?: string;
  section?: string;
  date_of_birth?: string;
  gender?: string;
  parent_guardian?: string;
  contact?: string;
  status?: string;
  face_enrolled?: boolean;
}
