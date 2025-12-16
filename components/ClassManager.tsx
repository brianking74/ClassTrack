import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Dumbbell } from 'lucide-react';
import { ClassDefinition } from '../types';
import ClassModal from './ClassModal';

interface ClassManagerProps {
  classes: ClassDefinition[];
  onAdd: (classDef: ClassDefinition) => void;
  onEdit: (classDef: ClassDefinition) => void;
  onDelete: (id: string) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classes, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassDefinition | null>(null);

  const handleEditClick = (cls: ClassDefinition) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleSave = (classDef: ClassDefinition) => {
    if (editingClass) {
      onEdit(classDef);
    } else {
      onAdd(classDef);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Types</h1>
          <p className="text-slate-500">Define the types of classes you offer.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Class</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <Dumbbell size={24} />
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClick(cls)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(cls.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{cls.name}</h3>
              <p className="text-slate-500 text-sm h-10 line-clamp-2">
                {cls.description || "No description provided."}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Dumbbell size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No class types defined yet.</p>
            <button onClick={handleAddClick} className="text-indigo-600 font-medium hover:underline mt-2">Create your first class</button>
          </div>
        )}
      </div>

      <ClassModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingClass}
      />
    </div>
  );
};

export default ClassManager;