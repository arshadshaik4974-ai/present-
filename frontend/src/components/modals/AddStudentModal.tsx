import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

      await studentService.create(payload as any);
      setFormData({ student_id: '', full_name: '', roll_number: '', class_id: '', section: '', date_of_birth: '', gender: '', parent_guardian: '', contact: '' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}

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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Create Student</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
