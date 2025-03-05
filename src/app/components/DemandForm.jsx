import { useState } from 'react';

export default function DemandForm({ onAddDemand, onUpdateDemand, onClose, demandToEdit }) {
  const [formData, setFormData] = useState({
    title: demandToEdit?.title || '',
    description: demandToEdit?.description || '',
    budget: demandToEdit?.budget || '',
    location: demandToEdit?.location || '',
    requirements: demandToEdit?.requirements || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (demandToEdit) {
      onUpdateDemand({ ...demandToEdit, ...formData });
    } else {
      onAddDemand(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <h2 className="text-xl font-bold mb-4">
        {demandToEdit ? 'Edit Demand' : 'Create New Demand'}
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Budget</label>
        <input
          type="text"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="e.g. $500-1000"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="e.g. Remote, New York, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Requirements</label>
        <textarea
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="List your requirements..."
        />
      </div>
      
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {demandToEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
} 