import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';
import { Class } from '../../types/class';
import { classService } from '../../services/classService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    roll_number: '',
    class_id: '',
    section: '',
    date_of_birth: '',
    gender: '',
    parent_guardian: '',
    contact: '',
  });

  useEffect(() => {
    if (isOpen) {
      classService.getAll().then(setClasses).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.student_id.trim() || !formData.full_name.trim()) {
      setError('Student ID and Full Name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { studentService } = await import('../../services/studentService');
      const payload: Record<string, string | undefined> = {
        student_id: formData.student_id.trim(),
        full_name: formData.full_name.trim(),
      };
      if (formData.roll_number.trim()) payload.roll_number = formData.roll_number.trim();
      if (formData.class_id) payload.class_id = formData.class_id;
      if (formData.section.trim()) payload.section = formData.section.trim();
      if (formData.date_of_birth) payload.date_of_birth = formData.date_of_birth;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.parent_guardian.trim()) payload.parent_guardian = formData.parent_guardian.trim();
      if (formData.contact.trim()) payload.contact = formData.contact.trim();

      const createdStudent = await studentService.create(payload as any);
      
      // If photo was provided, upload it for face enrollment
      if (photoBase64) {
        try {
          await studentService.enrollFace(createdStudent.id, photoBase64);
        } catch (enrollErr: any) {
          console.error("Face enrollment failed during student creation", enrollErr);
          // We intentionally don't throw here to avoid preventing modal close, 
          // as the student was successfully created.
          alert("Student was created, but face enrollment failed: " + (enrollErr.detail || enrollErr.message));
        }
      }

      setFormData({ student_id: '', full_name: '', roll_number: '', class_id: '', section: '', date_of_birth: '', gender: '', parent_guardian: '', contact: '' });
      setPhotoBase64(null);
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to create student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Add New Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="add-student-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {photoBase64 ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img src={photoBase64} alt="Student Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-3 text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Upload Student Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Optional, used for AI Face Recognition</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input name="student_id" value={formData.student_id} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. STU001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input name="roll_number" value={formData.roll_number} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. 101" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input name="full_name" value={formData.full_name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. John Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select name="class_id" value={formData.class_id} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input name="section" value={formData.section} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. A" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian</label>
              <input name="parent_guardian" value={formData.parent_guardian} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. Jane Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input name="contact" value={formData.contact} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. +91 9876543210" />
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 shrink-0 bg-gray-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button form="add-student-form" type="submit" variant="primary" isLoading={isSubmitting}>Create Student</Button>
        </div>
      </div>
    </div>
  );
};
