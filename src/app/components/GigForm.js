import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function GigForm({ onSubmit, onCancel, initialData, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price || '');
      setCategory(initialData.category || '');
      
      // Set initial images if editing a gig
      if (initialData.images && initialData.images.length > 0) {
        setImages(initialData.images);
        setPreviewImages(initialData.images.map(url => ({ url, uploaded: true })));
      }
    }
  }, [initialData]);

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
      
      // Then submit the form with image URLs
      await onSubmit({
        title,
        description,
        price: parseFloat(price),
        category,
        images: imageUrls,
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
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
          <label className="block text-white mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 bg-[#121936] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 appearance-none"
            required
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Logo Design">Logo Design</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Content Writing">Content Writing</option>
            <option value="Translation">Translation</option>
            <option value="Social Media">Social Media</option>
            <option value="Marketing">Marketing</option>
            <option value="Video Editing">Video Editing</option>
          </select>
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