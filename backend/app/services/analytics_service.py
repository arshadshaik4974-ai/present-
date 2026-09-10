from app.repositories.attendance_repository import attendance_repository
from app.repositories.student_repository import student_repository
from app.repositories.class_repository import class_repository
from app.repositories.teacher_repository import teacher_repository
from app.schemas.analytics import DashboardAnalytics, DailyAttendanceStat, ClassAttendanceStat
from app.schemas.user import UserInDB
from datetime import date, timedelta
from typing import List

class AnalyticsService:
    def _get_teacher_class_ids(self, email: str) -> List[str]:
        teacher = teacher_repository.get_by_email(email)
        if not teacher:
            return []
        classes = class_repository.get_by_teacher_id(str(teacher.id))
        return [str(c.id) for c in classes]

    def get_dashboard_stats(self, current_user: UserInDB) -> DashboardAnalytics:
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            if not allowed_classes:
                return DashboardAnalytics(totalStudents=0, presentToday=0, absentToday=0, attendancePercentage=0.0, activeClasses=0, trend=[])
            
            students = student_repository.get_by_class_ids(allowed_classes)
            classes = [c for c in class_repository.get_all() if str(c.id) in allowed_classes]
            attendance = attendance_repository.get_by_class_ids(allowed_classes)
        else:
            students = student_repository.get_all()
            classes = class_repository.get_all()
            attendance = attendance_repository.get_all()
        
        today = date.today().isoformat()
        
        # Calculate today's stats
        today_attendance = [a for a in attendance if str(a.date) == today]
        present_today = len([a for a in today_attendance if a.status == 'present'])
        absent_today = len([a for a in today_attendance if a.status == 'absent'])
        
        total_students = len(students)
        active_classes = len([c for c in classes if c.status == 'active'])
        
        attendance_percentage = (present_today / total_students * 100) if total_students > 0 else 0.0

        # Calculate 7-day trend
        trend: List[DailyAttendanceStat] = []
        for i in range(6, -1, -1):
            d = (date.today() - timedelta(days=i)).isoformat()
            d_records = [a for a in attendance if str(a.date) == d]
            trend.append(DailyAttendanceStat(
                date=d,
                present=len([a for a in d_records if a.status == 'present']),
                absent=len([a for a in d_records if a.status == 'absent']),
                late=len([a for a in d_records if a.status == 'late'])
            ))

        return DashboardAnalytics(
            totalStudents=total_students,
            presentToday=present_today,
            absentToday=absent_today,
            attendancePercentage=round(attendance_percentage, 1),
            activeClasses=active_classes,
            trend=trend
        )

    def get_class_stats(self, current_user: UserInDB) -> List[ClassAttendanceStat]:
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            if not allowed_classes:
                return []
            classes = [c for c in class_repository.get_all() if str(c.id) in allowed_classes]
            attendance = attendance_repository.get_by_class_ids(allowed_classes)
        else:
            classes = class_repository.get_all()
            attendance = attendance_repository.get_all()
        
        stats = []
        for c in classes:
            class_records = [a for a in attendance if str(a.class_id) == str(c.id)]
            total = len(class_records)
            present = len([a for a in class_records if a.status in ('present', 'late')])
            percentage = (present / total * 100) if total > 0 else 0.0
            
            stats.append(ClassAttendanceStat(
                classId=str(c.id),
                className=f"{c.name} - {c.section}",
                attendancePercentage=round(percentage, 1)
            ))
            
        return stats

analytics_service = AnalyticsService()
