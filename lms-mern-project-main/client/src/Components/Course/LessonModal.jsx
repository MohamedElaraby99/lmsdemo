import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateLesson } from '../../Redux/Slices/CourseSlice';
import { FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LessonModal = ({ lesson, unitId, lessonId, courseId, onClose, isOpen }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    price: lesson?.price || ''
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        price: lesson.price || ''
      });
    }
  }, [lesson]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        price: formData.price
      };

      await dispatch(updateLesson({
        courseId,
        unitId,
        lessonId,
        lessonData: updateData
      })).unwrap();

      toast.success('Lesson updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to update lesson');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Lesson: {formData.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lesson Information</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter lesson title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="6"
                placeholder="Enter lesson description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter lesson price"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FaSave className="text-sm" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
