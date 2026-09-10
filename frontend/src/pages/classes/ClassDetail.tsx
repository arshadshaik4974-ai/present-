import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Class } from '../../types/class';
import { Student } from '../../types/student';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';

export const ClassDetail: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [classObj, setClassObj] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    const load = async () => {
      try {
        const [cls, allStudents] = await Promise.all([
          classService.getById(classId),
          studentService.getAll()
        ]);
        setClassObj(cls);
        setStudents(allStudents.filter(s => s.class_id === classId));
      } catch (err: any) {
        setError(err.message || 'Unable to load class details.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !classObj) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
        <p className="text-lg font-medium">{error || 'Class not found.'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
      </Button>
      
      <PageHeader 
        title={`${classObj.name} - ${classObj.section}`} 
        description={`Academic Year: ${classObj.academic_year || 'N/A'}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-medium text-gray-900">{classObj.room || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900">{classObj.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-500" />
              Enrolled Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500">No students enrolled in this class.</p>
            ) : (
              <div className="divide-y divide-gray-200 border rounded-md">
                {students.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/teacher/students/${s.id}`)}>
                    <div>
                      <p className="font-medium text-gray-900">{s.full_name}</p>
                      <p className="text-sm text-gray-500">Roll: {s.roll_number || 'N/A'}</p>
                    </div>
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
