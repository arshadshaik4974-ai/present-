import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academic_year: '',
    room: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.section.trim()) {
      setError('Class Name and Section are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { classService } = await import('../../services/classService');
      const payload: Record<string, string | undefined> = {
        name: formData.name.trim(),
        section: formData.section.trim(),
      };
      if (formData.academic_year.trim()) payload.academic_year = formData.academic_year.trim();
      if (formData.room.trim()) payload.room = formData.room.trim();

      await classService.create(payload as any);
      setFormData({ name: '', section: '', academic_year: '', room: '' });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || 'Failed to create class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Class</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. Class 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <input name="section" value={formData.section} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. A" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input name="academic_year" value={formData.academic_year} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. 2025-2026" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input name="room" value={formData.room} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. Room 201" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Create Class</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
