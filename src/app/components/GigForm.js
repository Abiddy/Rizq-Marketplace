'use client';

import { useState, useEffect } from 'react';

export default function GigForm({ onAddGig, onUpdateGig, onClose, gigToEdit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const categories = [
    'Web Development',
    'Logo Design',
    'Graphic Design',
    'Content Writing',
  ];

  // Populate form if editing
  useEffect(() => {
    if (gigToEdit) {
      setTitle(gigToEdit.title);
      setCategory(gigToEdit.category);
      setDescription(gigToEdit.description);
      setPrice(gigToEdit.price.toString());
    }
  }, [gigToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category || !description || !price) {
      alert('Please fill in all fields!');
      return;
    }

    const gigData = {
      title,
      category,
      description,
      price: parseFloat(price),
    };

    if (gigToEdit) {
      onUpdateGig({ ...gigData, id: gigToEdit.id });
    } else {
      onAddGig(gigData);
    }
    onClose();
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {gigToEdit ? 'Edit Gig' : 'Create a New Gig'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gig Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build a Responsive Website"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your gig..."
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 250"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          {gigToEdit ? 'Update Gig' : 'Post Gig'}
        </button>
      </form>
    </div>
  );
}