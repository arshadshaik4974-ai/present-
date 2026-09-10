import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserSquare2, AlertTriangle, CalendarCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { Student } from '../../types/student';
import { Class } from '../../types/class';
import { AttendanceRecord } from '../../types/attendance';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';

export const StudentDetail: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [classObj, setClassObj] = useState<Class | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      try {
        const studentData = await studentService.getById(studentId);
        setStudent(studentData);
        
        const [cls, allAttendance] = await Promise.all([
          studentData.class_id ? classService.getById(studentData.class_id).catch(() => null) : Promise.resolve(null),
          attendanceService.getAll()
        ]);
        
        setClassObj(cls);
        setAttendance(allAttendance.filter(a => a.student_id === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err: any) {
        setError(err.message || 'Unable to load student details.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
        <p className="text-lg font-medium">{error || 'Student not found.'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const presentDays = attendance.filter(a => a.status === 'present').length;
  const absentDays = attendance.filter(a => a.status === 'absent').length;
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
      </Button>
      
      <PageHeader 
        title={student.full_name} 
        description={`Roll Number: ${student.roll_number || 'N/A'}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserSquare2 className="mr-2 h-5 w-5 text-gray-500" />
              Student Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-medium text-gray-900">{classObj ? `${classObj.name} - ${classObj.section}` : 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={student.status === 'active' ? 'success' : 'default'}>{student.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Face Enrollment</p>
              <Badge variant={student.face_enrolled ? 'success' : 'warning'}>
                {student.face_enrolled ? 'enrolled' : 'pending'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => navigate('face-enrollment')}
              >
                {student.face_enrolled ? 'Manage Face Profile' : 'Enroll Face'}
              </Button>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium text-gray-900">{student.contact || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck className="mr-2 h-5 w-5 text-gray-500" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-2xl font-bold text-primary">{attendancePercentage.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-700">{presentDays}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-700">{absentDays}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-yellow-600">Late</p>
                <p className="text-2xl font-bold text-yellow-700">{lateDays}</p>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Records</h3>
            {attendance.length === 0 ? (
              <p className="text-gray-500">No attendance records found.</p>
            ) : (
              <div className="divide-y divide-gray-200 border rounded-md">
                {attendance.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium text-gray-900">{new Date(a.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">Source: {a.source}</p>
                    </div>
                    <Badge 
                      variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning'}
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
