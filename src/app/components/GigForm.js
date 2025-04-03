import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { XMarkIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { gigCategories } from '@/lib/categories';

export default function GigForm({ onSubmit, onCancel, initialData, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const MAX_CATEGORIES = 5;
  const MAX_CUSTOM_CATEGORIES = 3;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price || '');
      setSelectedCategories(initialData.categories || []);
      
      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
        setPreviewImages(initialData.images.map(url => ({ url, uploaded: true })));
      }
    }
  }, [initialData]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        if (prev.length >= MAX_CATEGORIES) {
          return prev;
        }
        return [...prev, category];
      }
    });
  };

  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!customCategory.trim()) return;
    
    const customCount = selectedCategories.filter(cat => 
      !gigCategories.some(group => group.categories.includes(cat))
    ).length;
    
    if (customCount >= MAX_CUSTOM_CATEGORIES) {
      alert(`You can only add up to ${MAX_CUSTOM_CATEGORIES} custom categories`);
      return;
    }
    
    if (selectedCategories.length >= MAX_CATEGORIES) {
      alert(`You can only select up to ${MAX_CATEGORIES} categories in total`);
      return;
    }
    
    if (selectedCategories.includes(customCategory.trim())) {
      alert('This category already exists');
      return;
    }
    
    setSelectedCategories(prev => [...prev, customCategory.trim()]);
    setCustomCategory('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      uploaded: false,
      id: uuidv4()
    }));
    
    setPreviewImages([...previewImages, ...newPreviews]);
  };
  
  const removeImage = (indexToRemove) => {
    // If the image is a preview only (not uploaded yet)
    if (!previewImages[indexToRemove].uploaded) {
      URL.revokeObjectURL(previewImages[indexToRemove].url);
    }
    
    setPreviewImages(previewImages.filter((_, index) => index !== indexToRemove));
    
    // If it was an already uploaded image, also remove from the images array
    if (previewImages[indexToRemove].uploaded) {
      const urlToRemove = previewImages[indexToRemove].url;
      setImages(images.filter(url => url !== urlToRemove));
    }
  };

  const uploadImages = async () => {
    const imagesToUpload = previewImages.filter(img => !img.uploaded);
    if (imagesToUpload.length === 0) return images;
    
    const uploadedUrls = [...images];
    
    for (let i = 0; i < imagesToUpload.length; i++) {
      const { file, id } = imagesToUpload[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `gig_images/${user.id}/${fileName}`;
      
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      try {
        const { error } = await supabase.storage
          .from('gigs')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setUploadProgress(prev => ({ ...prev, [id]: percent }));
            }
          });
          
        if (error) throw error;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('gigs')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(publicUrlData.publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue with the rest of the images
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Submit the form with image URLs
      await onSubmit({
        title,
        description,
        price: parseFloat(price),
        categories: selectedCategories,
        images: imageUrls,
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setSelectedCategories([]);
      setImages([]);
      setPreviewImages([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-[#121212] rounded-lg p-8 border border-gray-800">
      <h2 className="text-2xl font-bold mb-8">
        Create a New Gig
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-white mb-2">Gig Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build a Responsive Website"
            className="w-full p-3 bg-[#121936] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-white">Categories (Select up to 5)</label>
            <span className="text-sm text-gray-400">
              {selectedCategories.length}/{MAX_CATEGORIES} selected
            </span>
          </div>

          {/* Custom Category Input */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Add a custom category"
                className="flex-1 p-3 bg-[#121936] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                disabled={selectedCategories.length >= MAX_CATEGORIES}
                className={`px-4 rounded-lg flex items-center justify-center ${
                  selectedCategories.length >= MAX_CATEGORIES
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              You can add up to {MAX_CUSTOM_CATEGORIES} custom categories
            </p>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
            {/* Selected Categories */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600/20 border border-indigo-500 rounded-full text-sm text-white"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                      className="p-0.5 hover:bg-indigo-500 rounded-full"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Predefined Categories */}
            {gigCategories.map((group) => (
              <div key={group.heading} className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium border-b border-gray-800 pb-1">
                  {group.heading}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.categories.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-indigo-600/20 border border-indigo-500'
                          : selectedCategories.length >= MAX_CATEGORIES
                          ? 'bg-gray-800/50 border border-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-[#121936] border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        disabled={selectedCategories.length >= MAX_CATEGORIES && !selectedCategories.includes(category)}
                        className="hidden"
                      />
                      <span className={`text-sm ${
                        selectedCategories.length >= MAX_CATEGORIES && !selectedCategories.includes(category)
                          ? 'text-gray-500'
                          : 'text-white'
                      }`}>{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {selectedCategories.length === 0 && (
            <p className="text-red-500 text-sm mt-2">Please select at least one category</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your gig..."
            className="w-full p-3 bg-[#121936] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[150px]"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-white mb-2">Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 250"
            className="w-full p-3 bg-[#121936] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        
        {/* Image Upload Section */}
        <div className="mb-6">
          <label className="block text-white mb-2">Images (up to 5)</label>
          
          {/* Image Previews */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {previewImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="bg-[#121936] rounded-lg overflow-hidden aspect-video">
                  {previewImages[index].url && (
                    <div className="mt-2">
                      <Image 
                        src={previewImages[index].url} 
                        alt={`Preview ${index}`} 
                        width={200} 
                        height={200} 
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  {!image.uploaded && uploadProgress[image.id] !== undefined && uploadProgress[image.id] < 100 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="w-full max-w-[80%] bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress[image.id]}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            {previewImages.length < 5 && (
              <label className="cursor-pointer bg-[#121936] rounded-lg border border-gray-700 border-dashed flex flex-col items-center justify-center aspect-video hover:bg-[#1a2046] transition-colors">
                <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Add Image</span>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple={previewImages.length === 0}
                />
              </label>
            )}
          </div>
          
          <p className="text-xs text-gray-400">
            Upload up to 5 images to showcase your gig (PNG, JPG, WEBP)
          </p>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 px-6 border border-gray-700 rounded-md text-white hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              'Post Gig'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 