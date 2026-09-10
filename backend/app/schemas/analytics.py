from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class DailyAttendanceStat(BaseModel):
    date: str
    present: int
    absent: int
    late: int

class ClassAttendanceStat(BaseModel):
    classId: str
    className: str
    attendancePercentage: float

class DashboardAnalytics(BaseModel):
    totalStudents: int
    presentToday: int
    absentToday: int
    attendancePercentage: float
    activeClasses: int
    trend: List[DailyAttendanceStat]
