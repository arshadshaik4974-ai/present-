from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.student import StudentCreate, StudentUpdate, StudentInDB
from app.services.student_service import student_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_admin, require_teacher
from app.schemas.face import FaceEnrollmentRequest, FaceEnrollmentResponse, FaceProfileInDB
from app.services.face_service import face_service

router = APIRouter()

@router.get("", response_model=List[StudentInDB])
def read_students(current_user: UserInDB = Depends(require_teacher)):
    return student_service.get_all(current_user)

@router.get("/{student_id}", response_model=StudentInDB)
def read_student(student_id: str, current_user: UserInDB = Depends(require_teacher)):
    return student_service.get_by_id(student_id, current_user)

@router.post("", response_model=StudentInDB, status_code=201)
def create_student(student: StudentCreate, current_user: UserInDB = Depends(require_admin)):
    return student_service.create(student, current_user)

@router.put("/{student_id}", response_model=StudentInDB)
def update_student(student_id: str, student: StudentUpdate, current_user: UserInDB = Depends(require_admin)):
    return student_service.update(student_id, student, current_user)

@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: str, current_user: UserInDB = Depends(require_admin)):
    student_service.delete(student_id, current_user)
    return None

@router.post("/{student_id}/face-enrollment", response_model=FaceEnrollmentResponse)
def enroll_student_face(student_id: str, req: FaceEnrollmentRequest, current_user: UserInDB = Depends(require_teacher)):
    # Verify the teacher/admin has access to this student
    student_service.get_by_id(student_id, current_user)
    return face_service.enroll_face(student_id, req.image_base64, str(current_user.id))

@router.get("/{student_id}/face-enrollment", response_model=FaceProfileInDB)
def get_student_face_enrollment(student_id: str, current_user: UserInDB = Depends(require_teacher)):
    # Verify access
    student_service.get_by_id(student_id, current_user)
    return face_service.get_enrollment_status(student_id)

@router.delete("/{student_id}/face-enrollment", status_code=204)
def delete_student_face_enrollment(student_id: str, current_user: UserInDB = Depends(require_admin)):
    # Verify access
    student_service.get_by_id(student_id, current_user)
    face_service.delete_enrollment(student_id, str(current_user.id))
    return None
